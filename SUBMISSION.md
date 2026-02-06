# AgentPay — HackMoney 2026 Submission

> Copy-paste content for the ETHGlobal submission form

---

## Short Description (100 chars max)

```
AgentPay: MCP server giving AI agents USDC payments, micropayments, and cross-chain settlement—all gas-free
```

---

## Full Description (280+ chars)

AI agents are doing real work but can't pay for anything. AgentPay solves this.

AgentPay is an MCP server that gives any AI agent a financial API. Install it and your agent can:
- Send USDC payments across chains (gas-free via Circle Paymaster)
- Stream micropayments through state channels (250x cheaper than on-chain via Yellow Nitrolite)
- Resolve agent identities via ENS (.eth names)
- Check unified USDC balance across 7 chains (Circle Gateway)

This is the payment layer for the agent economy. HTTP gave agents data. AgentPay gives them money.

---

## How It's Made (280+ chars)

Built with:
- **MCP SDK** (@modelcontextprotocol/sdk) for AI agent tooling
- **Yellow Nitrolite SDK** (@erc7824/nitrolite) for state channels — enables 1000 micropayments with 1 on-chain tx
- **Circle Paymaster** for gas-free USDC transactions — agents pay gas in USDC via ERC-4337 smart accounts
- **Circle Gateway** REST API for unified USDC balance across Arbitrum, Base, Polygon, Ethereum, Optimism
- **ENS via viem** for .eth name resolution — agents can send to readable names, not just 0x addresses
- **Base Sepolia** as primary chain (all components compatible)

Architecture:
```
AI agents → MCP tools → AgentPay server → Circle/Yellow/ENS → on-chain settlement
```

Hackiest part: State channel message flow with Yellow ClearNode WebSocket. Auth uses EIP-712 signed messages with domain name = application name ("agentpay"). Had to generate fresh session keys per connection to avoid expiry errors.

State channels are the key differentiator. Without them, 1000 micropayments = $250 gas. With Nitrolite channels: 1000 off-chain updates + 1 on-chain close = $0.02 total.

---

## Partner Prizes

### Yellow Network ($15K)

**How we used Yellow's tools:**

We integrated the Nitrolite SDK (@erc7824/nitrolite v0.5.3) for state channel micropayments.

Implementation:
1. **Authentication** — Connected to Yellow's ClearNode WebSocket (wss://clearnet.yellow.com/ws) using EIP-712 signed auth messages. Used fresh session keys per connection to avoid "session key expired" errors.
2. **Channel Lifecycle** — Implemented full ERC-7824 channel flow:
   - `agentpay_open_channel` — creates app session with initial USDC allocation
   - `agentpay_micropay` — off-chain state updates (version increments, allocation rebalancing)
   - `agentpay_close_channel` — cooperative close with on-chain settlement
3. **Use Case** — Micropayment streaming for AI agent-to-agent payments (pay-per-API-call, pay-per-data-point)

State channels are central to our value proposition. Without Nitrolite, micropayments are economically impossible for AI agents.

**Feedback for Yellow:**
- SDK documentation is solid but WebSocket message flow examples would help
- EIP-712 auth domain name requirement (must equal application name) took some debugging
- TypeScript types for RPC message structures would be helpful
- ClearNode testnet is fast and responsive

**Code locations:**
- `/src/lib/nitrolite.ts` — channel logic
- `/src/tools/channel.ts` — MCP tool handlers

---

### Arc / Circle ($10K)

**How we used Circle's products:**

1. **Circle Paymaster** (gas-free USDC):
   - Agents pay gas in USDC, not ETH
   - Used ERC-4337 smart accounts on Base Sepolia
   - Live tx: `0xcd30ddbc4919a37a489cfa51a031fe66bacbfb22bc5c524892938437785e9f03`

2. **Circle Gateway** (unified balance):
   - `agentpay_balance` queries USDC across 7 chains in <500ms
   - No bridging required — agents see total available USDC

Both are central to UX. Agents don't hold ETH (Paymaster eliminates gas management). Agents don't fragment liquidity (Gateway unifies balance).

**Feedback for Circle:**
- Paymaster API worked on first try, great docs
- Gateway REST API is fast and well-documented
- Would love WebSocket subscriptions for real-time balance updates

**Code locations:**
- `/src/lib/paymaster.ts` — Paymaster integration
- `/src/lib/balance.ts` — Gateway API

---

### ENS ($5K)

**How we used ENS:**

Custom ENS integration (not RainbowKit):

1. `agentpay_send` accepts .eth names and resolves to addresses via mainnet ENS
2. Used viem's `getEnsAddress` with mainnet public client
3. Agents can send to `vitalik.eth` instead of `0x7a3b...`

Agent identity as human-readable names, not just hex addresses.

**Code location:**
- `/src/tools/send.ts` lines 15-33 — ENS resolution logic

---

## Links

- **GitHub:** https://github.com/[YOUR_USERNAME]/agentpay
- **Demo Video:** https://youtube.com/watch?v=[VIDEO_ID]

---

## Test Addresses

- EOA: `0x66d71a8612Fbf6ab69340Bf82aB431e1Ad30b5c3`
- Smart Account: `0xc3A8c8fe8430877317207fd5e50Fa0F458014D80`
- Network: Base Sepolia (testnet)

---

## AI Attribution

This project was built with assistance from Claude Code (Anthropic). See AI_ATTRIBUTION.md for full disclosure. Architecture decisions, testing, and validation were human-driven.

---

## Checklist Before Submitting

- [ ] Replace [YOUR_USERNAME] with actual GitHub username
- [ ] Replace [VIDEO_ID] with actual YouTube video ID
- [ ] Verify GitHub repo is PUBLIC
- [ ] Test video link in incognito window
- [ ] Submit 2 hours BEFORE deadline (servers crash)
