# Quick Start: State Channels for AgentPay

**TL;DR - 5 minute read**

---

## What You're Implementing

**State channels** let two agents exchange USDC off-chain with only 2 on-chain transactions:
1. Open channel (fund it)
2. Close channel (settle final balance)

In between: unlimited updates, signed off-chain.

---

## Key APIs (from Clearnet RPC)

### 1. Open Channel
```
RPC: create_virtual_channel

Input:
- participantA: agent wallet address
- participantB: recipient address
- token: USDC address (0x...)
- amountA: funding amount (wei)
- amountB: 0 (broker only funds from participantB side)

Output:
- channel_id: 0x... (use this for all future ops)
```

### 2. Micropay (Update)
```
RPC: resize_channel

Input:
- channel_id: from step 1
- participant_change: amount to send (wei, positive = send out)
- funds_destination: recipient address

Output:
- state_hash: proof of state
- server_signature: broker's signature
```

### 3. Close Channel
```
RPC: close_channel

Input:
- channel_id: from step 1
- funds_destination: final recipient

Output:
- final_allocations: [agent balance, broker balance]
```

---

## Network Details

| Setting | Value |
|---------|-------|
| **Testnet** | Base Sepolia (84532) |
| **Mainnet** | Base (8453) |
| **WebSocket** | `wss://clearnet.yellow.com/ws` (production) |
| **USDC Address** | Check repo deployments |
| **Challenge Period** | 86400 seconds (24 hours) |

---

## Integration Checklist

### Phase 1: Connection
- [ ] Import NitroliteClient from implementation guide
- [ ] Create WebSocket connection in MCP server startup
- [ ] Implement EIP-712 signature flow
- [ ] Test `ping` RPC call

### Phase 2: Open Channel Tool
- [ ] Create `agentpay_open_channel` tool
- [ ] Accept: recipient, amount_usdc, chain
- [ ] Call `create_virtual_channel` RPC
- [ ] Store channel_id in database
- [ ] Return channel_id to user

### Phase 3: Micropay Tool
- [ ] Create `agentpay_micropay` tool
- [ ] Accept: channel_id, amount_usdc
- [ ] Call `resize_channel` RPC
- [ ] Update local ledger balance
- [ ] Return state_hash + signature

### Phase 4: Close Tool
- [ ] Create `agentpay_close_channel` tool
- [ ] Accept: channel_id
- [ ] Call `close_channel` RPC
- [ ] Verify final allocations match ledger
- [ ] Mark channel as closed

### Phase 5: Dashboard
- [ ] Show open channels
- [ ] Display micropayment history
- [ ] Show settled balances
- [ ] Real-time balance updates via WebSocket

---

## Key Code Snippets

### Opening a Channel
```typescript
const channelId = await channelManager.openChannel({
  participantA: '0xAgent123...',
  participantB: '0xRecipient456...',
  tokenAddress: '0xUsdc...',
  amountA: ethers.parseUnits('100', 6),  // 100 USDC
  amountB: '0'
});
```

### Sending Micropayment
```typescript
const result = await channelManager.resizeChannel({
  channelId,
  participantChange: ethers.parseUnits('10', 6),  // Send 10 USDC
  fundsDestination: '0xRecipient456...'
});
// result contains state_hash, signature from broker
```

### Closing
```typescript
const final = await channelManager.closeChannel(
  channelId,
  '0xAgent123...'
);
// final.finalAllocations shows [agent_balance, broker_balance]
```

---

## State Channel Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   CHANNEL LIFECYCLE                     │
└─────────────────────────────────────────────────────────┘

1. OPEN (on-chain)
   └─> create_virtual_channel
       └─> channel_id: 0x...
           status: "joining" → "open"

2. MICROPAY (off-chain)
   └─> resize_channel (can call N times)
       ├─> intent: RESIZE (1)
       ├─> version: increments
       └─> state_hash, signature

3. CLOSE (on-chain)
   └─> close_channel
       └─> intent: FINALIZE (2)
           final_allocations: [agent, broker]
           status: "closed"
```

---

## Testing Locally

### Start Clearnet Broker
```bash
git clone https://github.com/layer-3/ethtaipei.git
cd ethtaipei/clearnet

export DATABASE_DRIVER=sqlite
export PRIVATE_KEY_HEX=0x...
export NETWORKS_JSON='[{"name":"base-sepolia","infura_url":"...","custody_address":"0x...","chain_id":"84532"}]'

go run ./...
# Server starts on localhost:8000
# WebSocket: ws://localhost:8000/ws
```

### Connect from MCP
```typescript
const client = new NitroliteClient({
  wsUrl: 'ws://localhost:8000/ws',  // Local
  privateKey: '0x...',
  chainId: 84532
});

await client.connect();
const channelId = await channelManager.openChannel({...});
```

---

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `missing signature` | RPC message not signed | Check private key |
| `insufficient funds` | Channel balance too low | Resize with +amount first |
| `quorum not met` | Multi-sig threshold not reached | Need more participant signatures |
| `challenge expired` | Took too long to close | Close within challenge period |

---

## Yellow Network Prize Requirements

To win the **$15K bounty**, you must:

1. ✅ **Use Nitrolite SDK** (go-nitrolite imported in code)
2. ✅ **Off-chain transactions** (resize_channel calls counted, not on-chain)
3. ✅ **Working prototype** (demo with 2 agents, open → micropay → close)
4. ✅ **Custom state logic** (multi-agent micropayment routing)

**For AgentPay:**
- Agents open channels per-pair
- Send micropayments via resize (state updates)
- Stream payments over time
- Close when done
- Showcase multi-agent payment flows

---

## File Locations in Repo

| Purpose | File |
|---------|------|
| Channel ops | `src/lib/channel.ts` |
| Virtual apps | `src/lib/virtual-app.ts` |
| WebSocket client | `src/lib/nitrolite.ts` |
| MCP tools | `src/tools/agentpay-channels.ts` |
| Database | `src/db/schema.sql` |
| Tests | `src/test/channels.test.ts` |

---

## Dependencies to Add

```bash
npm install @erc7824/nitrolite ethers ws @modelcontextprotocol/sdk

# Or in package.json:
{
  "dependencies": {
    "@erc7824/nitrolite": "^0.0.0-20250512...",
    "ethers": "^6.0.0",
    "ws": "^8.0.0",
    "@modelcontextprotocol/sdk": "^0.4.0"
  }
}
```

---

## Environment Variables

```bash
# Blockchain
CHAIN_ID=84532
USDC_ADDRESS=0x...

# Nitrolite
NITROLITE_WS_URL=wss://clearnet.yellow.com/ws
AGENT_PRIVATE_KEY=0x...

# Optional: Local testing
LOCAL_NITROLITE_WS=ws://localhost:8000/ws
```

---

## Debugging

### Check WebSocket Connection
```typescript
client.on('open', () => console.log('Connected'));
client.on('error', (err) => console.error('Error:', err));
client.on('close', () => console.log('Disconnected'));
```

### Verify RPC Response
```typescript
const response = await client.sendRPC('ping', []);
console.log('RPC response:', response);
// Should be: { res: [requestId, 'pong', [], timestamp], sig: [...] }
```

### Track Ledger Balance
```typescript
const balance = await channelManager.getChannelBalance(channelId);
console.log('Current balance:', balance);
// Format: { balances: [{ address, amount }] }
```

---

## Next Steps

1. **Read:** `/Users/apple/Hackmoney/YELLOW_NITROLITE_RESEARCH.md` for full details
2. **Code:** `/Users/apple/Hackmoney/IMPLEMENTATION_GUIDE.md` for copy-paste templates
3. **Implement:** Channel tools in order (open → micropay → close)
4. **Test:** With local Clearnet broker or Yellow testnet
5. **Demo:** Showcase agent-to-agent payment stream
6. **Submit:** To Yellow Network bounty

---

## Support Resources

- **Nitrolite Docs:** https://erc7824.org/quick_start
- **GitHub:** https://github.com/erc7824/nitrolite
- **ClearNode:** https://github.com/erc7824/nitrolite/tree/main/clearnode
- **Example:** https://github.com/erc7824/nitrolite/tree/main/examples

---

**Start with opening a channel. Everything else follows the same pattern.**

**Good luck! 🚀**
