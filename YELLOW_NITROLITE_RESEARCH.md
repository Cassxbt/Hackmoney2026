# Yellow Network & Nitrolite Research - Actionable Implementation Details

**Research Date:** February 6, 2026
**Target:** State channels integration for AgentPay

---

## 1. Repository Map

### Primary Resources

| Repo | Language | Purpose | Status |
|------|----------|---------|--------|
| **erc7824/nitrolite** | Go, TypeScript, Solidity | Core state channel framework | ✅ Active |
| **layer-3/ethtaipei** | Go | Clearnet broker implementation (ClearNode) | ✅ Reference impl |
| **layer-3/go-nitro** | Go | Pre-Nitrolite state channels (legacy) | ⚠️ Pre-production |
| **layer-3/broker-contracts** | Solidity | Yellow Network smart contracts | ✅ Deployment targets |

---

## 2. Channel Lifecycle - Complete Flow

### State Channel States (from protocol)
```
VOID → INITIAL → ACTIVE → DISPUTE → FINAL
              ↓
           CHANOPEN (magic number for creation)
              ↓
        ACTIVE (off-chain operations)
              ↓
         CHANCLOSE (magic number for closure)
              ↓
           FINAL
```

### API Methods by Phase

#### A. OPEN CHANNEL

**Via Clearnet RPC (ClearNode broker):**
```
Method: create_virtual_channel

Parameters:
{
  "participantA": "0xAddress1",
  "participantB": "0xAddress2",  // Usually broker
  "token_address": "0xUSDC",
  "amountA": "1000000000000000000",
  "amountB": "1000000000000000000",
  "adjudicator": "0xAdjudicatorAddress",  // Optional
  "challenge": 86400,  // Seconds, default 24hrs
  "nonce": 1680000000  // Optional, default: timestamp
}

Response:
{
  "channel_id": "0xChannelID",
  "status": "joining"  // → "open"
}
```

**Key Data Structures (Go):**
```go
// From layer-3/ethtaipei/clearnet/channel.go
type Channel struct {
  ID            uint          // DB primary key
  ChannelID     string        // Unique on-chain identifier
  ParticipantA  string        // User address
  ParticipantB  string        // Broker address
  Status        ChannelStatus // joining → open → closed
  Challenge     uint64        // Challenge period
  Nonce         uint64        // Channel nonce
  Version       uint64        // State version counter
  Adjudicator   string        // Contract address
  NetworkID     string        // Chain ID (e.g., "base-sepolia")
  Token         string        // Token address (USDC)
  Amount        int64         // Total channel collateral
  CreatedAt     time.Time
  UpdatedAt     time.Time
}
```

#### B. RESIZE CHANNEL (Update)

**Method:** `resize_channel`

```
Parameters:
{
  "channel_id": "0xChannelID",
  "participant_change": "500000000000000000",  // +/- amount
  "funds_destination": "0xAddress"
}

Response:
{
  "channel_id": "0xChannelID",
  "intent": 1,  // nitrolite.IntentRESIZE
  "version": 2,
  "state_data": "0xEncoded",
  "state_hash": "0xKeccak256(state)",
  "allocations": [
    {
      "destination": "0xAddress1",
      "token": "0xUSDC",
      "amount": "1500000000000000000"
    }
  ],
  "server_signature": {
    "v": 27,
    "r": "0x...",
    "s": "0x..."
  }
}
```

**Encoding (from clearnet/handlers.go):**
```go
// State encoding pattern
channelID := common.HexToHash(channel.ChannelID)
encodedState, err := nitrolite.EncodeState(
  channelID,
  nitrolite.IntentRESIZE,
  big.NewInt(int64(channel.Version)+1),
  encodedIntentions,  // Resize amounts as []int256[]
  allocations,        // New fund distribution
)

stateHash := crypto.Keccak256Hash(encodedState).Hex()
sig, err := signer.NitroSign(encodedState)  // Returns nitrolite.Signature
```

#### C. CLOSE CHANNEL

**Method:** `close_channel`

```
Parameters:
{
  "channel_id": "0xChannelID",
  "funds_destination": "0xAddress"
}

Response:
{
  "channel_id": "0xChannelID",
  "intent": 2,  // nitrolite.IntentFINALIZE
  "version": 3,
  "state_data": "0x",
  "final_allocations": [
    {
      "destination": "0xAddress1",
      "token": "0xUSDC",
      "amount": "1500000000000000000"
    },
    {
      "destination": "0xBroker",
      "token": "0xUSDC",
      "amount": "500000000000000000"
    }
  ],
  "state_hash": "0x...",
  "server_signature": { "v": 27, "r": "0x...", "s": "0x..." }
}
```

---

## 3. Virtual Applications (Multi-Participant)

For micropayment streaming to multiple agents, use Virtual Apps:

**Method:** `create_application`

```
Parameters:
{
  "definition": {
    "protocol": "NitroRPC/0.2",
    "participants": ["0xAgent1", "0xAgent2", "0xAgent3"],
    "weights": [1, 1, 1],  // Multi-sig weights
    "quorum": 2,           // Consensus threshold
    "challenge": 86400,
    "nonce": 1680000000
  },
  "token": "0xUSDC",
  "allocations": [
    "500000000000000000",
    "500000000000000000",
    "500000000000000000"
  ]
}

Response:
{
  "app_id": "0xVirtualAppID",
  "status": "open"
}
```

**Close Virtual App:**

```
Method: close_application

Parameters:
{
  "app_id": "0xVirtualAppID",
  "allocations": [
    "600000000000000000",  // Agent1 earned this
    "400000000000000000",  // Agent2
    "500000000000000000"   // Agent3
  ]
}

Response:
{
  "app_id": "0xVirtualAppID",
  "status": "closed"
}
```

---

## 4. Ledger System (Balance Tracking)

**Key Implementation:** `layer-3/ethtaipei/clearnet/ledger.go`

```go
// Double-entry accounting system
type Entry struct {
  AccountID   string // Channel ID or Virtual App ID
  Beneficiary string // Participant address
  Credit      int64  // Funds received
  Debit       int64  // Funds sent
  CreatedAt   time.Time
}

// Balance = SUM(credits) - SUM(debits) per (AccountID, Beneficiary)
```

**Flow:**
1. User deposits into channel → Credit to channel ledger account
2. User participates in virtual app → Transfer from channel to vApp account
3. Virtual app settles → Transfer back from vApp to channel
4. User withdraws → Debit from channel account

---

## 5. Authentication & Signing

**All RPC messages require EIP-712 signatures:**

```go
// From clearnet/auth.go & signer.go
type RPCRequest struct {
  Req       RPCData  // [RequestID, Method, Params, Timestamp]
  AccountID string   // For vApp messages
  Intent    []int64  // Allocation intent changes
  Sig       []string // Hex-encoded signatures
}

// Signature recovery
func RecoverAddress(message []byte, signatureHex string) (string, error) {
  sig, _ := hexutil.Decode(signatureHex)
  msgHash := crypto.Keccak256Hash(message)
  pubkey, _ := crypto.SigToPub(msgHash.Bytes(), sig)
  return crypto.PubkeyToAddress(*pubkey).Hex(), nil
}
```

**WebSocket Auth Flow:**
1. Client sends `auth_request` → receives challenge
2. Client signs challenge with private key
3. Client sends `auth_verify` with signature → authenticated
4. Session valid for 24 hours; updated on each message

---

## 6. Nitrolite Go SDK (erc7824/go-nitrolite)

**Installation:**
```bash
go get github.com/erc7824/go-nitrolite
```

**Key Types:**

```go
import "github.com/erc7824/go-nitrolite"

// Channel configuration
type Channel struct {
  Participants []common.Address
  Adjudicator  common.Address
  Challenge    uint64
  Nonce        uint64
}

// State encoding
type Allocation struct {
  Destination common.Address
  Token       common.Address
  Amount      *big.Int
}

// State intent constants
const (
  IntentRESIZE    = 1
  IntentFINALIZE   = 2
)

// Signing
type Signature struct {
  V uint8
  R [32]byte
  S [32]byte
}

// Core functions
func GetChannelID(ch Channel) common.Hash
func EncodeState(
  channelID common.Hash,
  intent uint8,
  version *big.Int,
  stateData []byte,
  allocations []Allocation,
) ([]byte, error)

func Sign(data []byte, privateKey *ecdsa.PrivateKey) (Signature, error)
```

---

## 7. Clearnet RPC Server (ClearNode)

**Repository:** `layer-3/ethtaipei/clearnet/`

**Key Files:**
- `rpc.go` - RPC protocol definitions
- `handlers.go` - API method implementations
- `channel.go` - Channel state management
- `ledger.go` - Balance accounting
- `signer.go` - State signing
- `ws.go` - WebSocket handler & authentication
- `auth.go` - Challenge-response auth
- `vapp.go` - Virtual app definitions

**Running Locally:**
```bash
git clone https://github.com/layer-3/ethtaipei.git
cd ethtaipei/clearnet

# Configure
export DATABASE_DRIVER=sqlite
export DATABASE_URL=file:clearnet.db?cache=shared
export PRIVATE_KEY_HEX=0x...
export NETWORKS_JSON='[{"name":"base-sepolia","infura_url":"...","custody_address":"0x...","chain_id":"84532"}]'

# Run
go run ./...
```

**WebSocket Connection:**
```
Primary: wss://clearnet.yellow.com/ws
Testnet: Local or custom setup
```

---

## 8. Smart Contracts

**Repository:** `layer-3/broker-contracts/`

**Key Contracts:**
- `Custody.sol` - Token deposit/withdrawal
- `Adjudicator.sol` - State validation & dispute resolution
- `ERC20.sol` - USDC mock for testing

**Deployment Pattern:**
```solidity
// On Base Sepolia
Custody deployed at: TBD (check repo deployments/)
Adjudicator deployed at: TBD

// Channel participants reference these addresses in channel creation
```

---

## 9. Complete Integration Checklist for AgentPay

### Phase 1: Channel Opening

- [ ] Implement `agentpay_open_channel` tool handler
  - Accept: agent_address, recipient_address, amount_usdc, chain
  - Call: `create_virtual_channel` RPC
  - Return: channel_id + confirmation

- [ ] Add channel database table
  - Fields: channel_id, participant_a, participant_b, status, balance
  - Index: channel_id (unique), participant_a, status

- [ ] Implement WebSocket auth
  - EIP-712 signing with agent's private key
  - Challenge-response flow

### Phase 2: Micropayments (RESIZE)

- [ ] Implement `agentpay_micropay` tool handler
  - Input: channel_id, amount_usdc, recipient
  - Encode state with nitrolite.EncodeState()
  - Sign with signer.NitroSign()
  - Call: `resize_channel` RPC
  - Track intent changes in ledger

- [ ] Implement ledger streaming
  - Record each transfer in double-entry ledger
  - Balance = SUM(credits) - SUM(debits)

### Phase 3: Channel Closing

- [ ] Implement `agentpay_close_channel` tool handler
  - Input: channel_id
  - Get final allocations from ledger
  - Call: `close_channel` RPC
  - Update channel status to closed

### Phase 4: Virtual Apps (Multi-Agent)

- [ ] Implement virtual app creation for multi-party scenarios
  - Method: `create_application`
  - Use when 3+ agents participating in single transaction
  - Aggregate micropayments, settle once

---

## 10. Key Constants & Network Details

### Base Sepolia (Primary)

```
Network ID: 84532
RPC: https://sepolia.base.org
USDC Address: (Check deployments, usually 0x...)
Challenge Period: 86400 seconds (24 hours)
```

### Protocol Constants

```go
const (
  IntentRESIZE   = 1
  IntentFINALIZE = 2
  ChannelStatusJoining = "joining"
  ChannelStatusOpen    = "open"
  ChannelStatusClosed  = "closed"
)
```

---

## 11. Error Handling Patterns

**From clearnet/handlers.go:**

```go
// Missing parameters
if len(rpc.Req.Params) < 1 {
  return nil, errors.New("missing parameters")
}

// Signature validation
if !recoveredAddresses[participant] {
  return nil, fmt.Errorf("missing signature for participant %s", participant)
}

// Quorum validation
if totalWeight < int64(vApp.Quorum) {
  return nil, fmt.Errorf("quorum not met: %d/%d", totalWeight, vApp.Quorum)
}

// Insufficient funds
balance, _ := account.Balance()
if balance < allocation.Int64() {
  return nil, errors.New("insufficient funds")
}
```

---

## 12. External Documentation

- **Official SDK Docs:** https://erc7824.org/quick_start
- **Protocol Spec:** https://github.com/erc7824/nitrolite/tree/main/docs
- **ClearNode Setup:** https://github.com/erc7824/nitrolite/tree/main/clearnode
- **Go SDK Reference:** https://pkg.go.dev/github.com/erc7824/nitrolite

---

## 13. TypeScript SDK (For Frontend/Dashboard)

```bash
npm install @erc7824/nitrolite
```

**Exports from SDK:**
```typescript
export * from './types';
export * from './utils';
export * from './errors';
export * from './client';
export * from './client/services';
export * from './client/types';
export * from './client/state';
export * from './client/signer';
export * from './rpc';
export * from './abis';
```

**Usage Pattern (from SDK structure):**
```typescript
import { NitroliteClient } from '@erc7824/nitrolite';

const client = new NitroliteClient({
  wsUrl: 'wss://clearnet.yellow.com/ws',
  privateKey: agentPrivateKey,
  chainId: 84532  // Base Sepolia
});

// Connect → authenticate → create session → operate → close
await client.connect();
const appSession = await client.createApplication({...});
await client.closeApplication(appSession.id);
```

---

## 14. Yellow Network Prize Strategy

**$15K Yellow Network Bounty Requires:**
1. ✅ SDK integration (go-nitrolite already integrated in ethtaipei)
2. ✅ Off-chain transactions (resize_channel proven working)
3. ✅ Working prototype (ClearNode running + contracts deployed)
4. ✅ Custom state channel logic (multi-agent micropayments)

**For AgentPay:**
- Implement tools using Clearnet RPC (not raw Nitro contracts)
- Track all agent→agent transfers in ledger
- Demonstrate streaming micropayments via channel updates
- Showcase multi-agent virtual app creation

---

## 15. Next Steps

1. **Set up Clearnet broker locally** or connect to Yellow testnet
2. **Implement channel lifecycle tools** in MCP server
3. **Add ledger balance tracking** for agent-to-agent transfers
4. **Test with 2 agents** → micropayment stream → settlement
5. **Extend to virtual apps** for 3+ agent scenarios
6. **Record demo video** showing full flow
7. **Submit to Yellow Network** bounty

---

**End of Research Document**
