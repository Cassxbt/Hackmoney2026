# AgentPay

**The Payment Layer for AI Agents**

AgentPay is an MCP (Model Context Protocol) server that gives AI agents a financial API. Install it and your agent can send USDC payments, stream micropayments through state channels, and settle across chains—all gas-free.

Built for HackMoney 2026 (ETHGlobal DeFi Hackathon, Jan 30 — Feb 11, 2026).

## The Problem

AI agents are doing real work: writing code, analyzing data, calling APIs. But they can't pay for anything. When an agent needs a paid service, a human must step in. That breaks the autonomous flow.

## The Solution

AgentPay gives agents money superpowers:
- **Send USDC** to any address or ENS name (gas-free via Circle Paymaster)
- **Stream micropayments** through state channels (250x cheaper than on-chain via Yellow Nitrolite)
- **Check balance** across 7 chains instantly (Circle Gateway)
- **Agent identity** via ENS (.eth names)

## Architecture

```
AI Agent (Claude, GPT, etc.)
         |
    MCP Tools
         |
  AgentPay Server
         |
   ┌─────┴─────┐
   │           │
Circle      Yellow       ENS
Gateway    Nitrolite  Resolution
Paymaster
   │           │         │
   └───────────┴─────────┘
         |
   On-chain (Base Sepolia)
```

## MCP Tools

AgentPay exposes 6 tools to AI agents:

### `agentpay_balance`
Check USDC balance across all supported chains (unified via Circle Gateway).

**Returns:** Total USDC balance, breakdown by chain

### `agentpay_send`
Send USDC to an address or ENS name. Gas paid in USDC via Circle Paymaster.

**Parameters:**
- `to` — Recipient address (0x...) or ENS name (vitalik.eth)
- `amount` — Amount in USDC (e.g., "10.50")
- `chain` — Target chain (default: base)

**Returns:** Transaction hash, gas payment method

### `agentpay_address`
Get the agent's wallet addresses (EOA and Smart Account).

**Returns:** EOA address, Smart Account address

### `agentpay_open_channel`
Open a state channel for instant micropayments. Off-chain, gas-free after opening.

**Parameters:**
- `counterparty` — Address of counterparty (0x...)
- `amount` — Initial deposit in USDC (e.g., "5.00")

**Returns:** Channel session ID, deposit amount

### `agentpay_micropay`
Send an instant micropayment through an open channel. No gas, no on-chain transaction.

**Parameters:**
- `amount` — Amount to send in USDC (e.g., "0.001")
- `sessionId` — Channel session ID (uses active channel if omitted)

**Returns:** New balance, counterparty balance, version

### `agentpay_close_channel`
Close a state channel and settle on-chain. Final balances are paid out.

**Parameters:**
- `sessionId` — Channel session ID (uses active channel if omitted)

**Returns:** Final allocations, settlement transaction

## Tech Stack

- **MCP SDK** — `@modelcontextprotocol/sdk` (TypeScript)
- **Yellow Nitrolite** — `@erc7824/nitrolite` (state channels, ERC-7824)
- **Circle Paymaster** — Gas-free USDC transactions (ERC-4337)
- **Circle Gateway** — Unified USDC balance across 7 chains
- **ENS** — `.eth` name resolution via viem
- **Chain** — Base Sepolia (testnet)

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Test USDC on Base Sepolia

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/agentpay.git
cd agentpay
npm install
```

### Configuration

Create `.env` file:

```env
AGENT_PRIVATE_KEY=0x...
AGENT_ADDRESS=0x...
NETWORK=testnet
```

Get test USDC:
1. Visit [Circle Faucet](https://faucet.circle.com/) (Base Sepolia)
2. Enter your `AGENT_ADDRESS`
3. Receive test USDC

### Build

```bash
npm run build
```

### Run

```bash
npm start
```

The MCP server will start on stdio transport, ready for AI agents to connect.

## Usage with Claude Desktop

1. Install [Claude Desktop](https://claude.ai/download)

2. Add AgentPay to your MCP config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "agentpay": {
      "command": "node",
      "args": ["/path/to/agentpay/dist/index.js"]
    }
  }
}
```

3. Restart Claude Desktop

4. Test:

```
Check my USDC balance
```

Claude should call `agentpay_balance` and return your balance.

5. Try a payment:

```
Send 1 USDC to vitalik.eth
```

Claude will resolve the ENS name and send via Paymaster.

6. Open a channel:

```
Open a micropayment channel with 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb and deposit 5 USDC
```

Then stream payments:

```
Send 10 micropayments of 0.001 USDC each through the channel
```

Close when done:

```
Close the channel and settle on-chain
```

## Cost Comparison

### Without AgentPay (on-chain)
- 1000 micropayments × $0.25 gas = **$250**

### With AgentPay (state channels)
- 1 channel open: $0.01
- 1000 off-chain micropayments: $0.00
- 1 channel close: $0.01
- **Total: $0.02**

**250x cheaper.**

## Demo

[Demo Video](https://youtube.com/link-to-demo)

Watch a live demo of:
- Balance checking across chains
- Gas-free USDC sends via Paymaster
- ENS resolution (sending to .eth names)
- State channel micropayments (1000 payments, 1 on-chain tx)

## Sponsor Integrations

### Yellow Network — Nitrolite SDK
- State channels via ERC-7824 standard
- Connected to ClearNode WebSocket (wss://clearnet.yellow.com/ws)
- Full channel lifecycle: open, update, close
- 250x cost savings vs on-chain

**Code:** `/src/lib/nitrolite.ts`, `/src/tools/channel.ts`

### Circle — Gateway + Paymaster
- **Paymaster:** Gas-free USDC transactions via ERC-4337 smart accounts
- **Gateway:** Unified USDC balance across Arbitrum, Base, Polygon, Ethereum, Optimism (7 chains)
- Agents never hold ETH, never manage gas

**Code:** `/src/lib/paymaster.ts`, `/src/lib/balance.ts`

### ENS
- `.eth` name resolution via mainnet lookup
- Agents send to readable names, not 0x addresses
- Future: Agent registry via ENS subdomains

**Code:** `/src/tools/send.ts` (lines 15-33)

## Test Addresses

- **EOA:** `0x66d71a8612Fbf6ab69340Bf82aB431e1Ad30b5c3`
- **Smart Account:** `0xc3A8c8fe8430877317207fd5e50Fa0F458014D80`
- **Network:** Base Sepolia (testnet)
- **First Paymaster TX:** [0xcd30ddbc...](https://sepolia.basescan.org/tx/0xcd30ddbc4919a37a489cfa51a031fe66bacbfb22bc5c524892938437785e9f03)

## Roadmap

**MVP (HackMoney 2026):**
- [x] MCP server with 6 tools
- [x] Circle Gateway integration
- [x] Circle Paymaster integration
- [x] Yellow Nitrolite state channels
- [x] ENS resolution
- [ ] Demo video
- [ ] React dashboard (real-time feed)

**Post-Hackathon:**
- [ ] Publish to npm as `@agentpay/mcp`
- [ ] Support more chains (Polygon, Arbitrum, Optimism)
- [ ] Agent registry via ENS subdomains
- [ ] Mainnet deployment
- [ ] WebSocket API for non-MCP clients
- [ ] Multi-agent payment routing

## Contributing

This project was built during HackMoney 2026. Contributions welcome after the hackathon ends (Feb 11, 2026).

## AI Attribution

This project was built with assistance from Claude (Anthropic's AI). See [AI_ATTRIBUTION.md](./AI_ATTRIBUTION.md) for full disclosure of AI contributions.

## License

MIT License. See [LICENSE](./LICENSE) for details.

## Links

- **HackMoney 2026:** https://ethglobal.com/events/hackmoney2026
- **Yellow Network:** https://yellow.org/
- **Circle Developers:** https://developers.circle.com/
- **ENS:** https://ens.domains/
- **MCP Protocol:** https://modelcontextprotocol.io/

---

**Built with Yellow Nitrolite + Circle Gateway/Paymaster + ENS**

*"HTTP gave agents data. AgentPay gives them money."*
