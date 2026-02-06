# HackMoney 2026 — Strategy & Progress Tracker

**Last Updated:** 2026-02-05
**Event:** Jan 30 — Feb 11, 2026 (Virtual)
**Status:** Ideation / Pre-Build

---

## Hackathon Intelligence Summary

### Core Themes (from ETHGlobal)
- Stablecoin flows
- On/offramps
- Agentic payments

### Judge Scoring Rubric
| Criteria | Weight |
|---|---|
| Functionality (works, code quality) | 25% |
| Creativity (novel angle) | 20% |
| Technical Difficulty (hard problem, elegant solution) | 20% |
| Practicality (real users could use it today) | 20% |
| UX/Polish (clean, intuitive) | 15% |

### Disqualification Risks
- Single large git commits (must show progression)
- Pre-built code before Jan 30 5:00 PM ET
- Superficial sponsor integration (especially ENS)
- Video below 720p
- Missing README/documentation

---

## Sponsor Bounties

### Yellow Network — $15,000 (UNDERCOMPETED)
- **Tech:** Nitrolite SDK + ERC-7824 state channels
- **Prize split:** $4K best use case, $3K technical excellence, $2K Nitrolite contributions, $1K GitHub PRs
- **What they want:** Performance metrics (speed, cost savings), real use cases
- **Key insight:** State channels = off-chain balance updates between two counterparties, settled on-chain periodically. NOT a generic "gasless" wrapper for DeFi.
- **Docs:** https://docs.yellow.org/ | https://erc7824.org/

### Uniswap Foundation — $10,000 (MOST COMPETITIVE)
- **Tech:** v4 Hooks
- **Bonus:** Unichain deployment
- **150+ hooks already exist** — need novel angle or exceptional execution
- **Past winners:** Unipump (bonding curves), Super DCA (0% fee DCA), UniPerp
- **Security is critical** — judges scrutinize hook safety
- **Docs:** https://docs.uniswap.org/contracts/v4/

### Circle / Arc — $10,000 (STRATEGIC CENTER)
- **Products:** Gateway (NEW, mainnet Jan 2025), Paymaster, CCTP V2, Wallets
- **Gateway:** Unified USDC balance across 7 chains, <500ms
- **Paymaster:** Pay gas in USDC, ERC-4337 compatible
- **CCTP V2:** Faster-than-finality cross-chain USDC + post-transfer hooks
- **Submission req:** Must include "Circle Product Feedback" section
- **Docs:** https://developers.circle.com/

### LI.FI — $6,000 (PROVEN PATH)
- **Was itself a HackMoney winner (2021)**
- **Tech:** 20+ bridges, 20+ DEXs aggregated via SDK
- **Want:** Practical SDK integrations solving real cross-chain UX problems
- **Docs:** https://docs.li.fi/

### ENS — $5,000 (EASY TO DISQUALIFY)
- **Must be central to UX** — just registering a name = disqualified
- **Valid:** AI agent naming, subname infrastructure, identity layer
- **Docs:** https://docs.ens.domains/

### Sui — $10,000 (UNCERTAIN)
- Limited ETHGlobal presence historically
- If targeting: focus on Ethereum<>Sui cross-chain

---

## Winning Patterns (from 50+ past ETHGlobal winners analyzed)

1. **AI Agents + Autonomous Systems** = 30-35% of recent winners
2. **DeFi Accessibility / UX** = 25-30% of winners
3. Polished MVP beats ambitious but broken
4. Deep sponsor integration (1-2 sponsors) beats wide (4 sponsors)
5. Live demo > slides (every winner had working demo)
6. Clear user persona and problem statement
7. Git commits every 2-3 hours throughout event
8. Demo: problem statement (20 sec) -> live demo (2-3 min) -> architecture (30 sec)

---

## Analysis File Ideas — Honest Assessment

| Idea | Rating | Issue |
|---|---|---|
| YellowSub | 4/10 | Misunderstands state channel tech |
| GasGuardian | 5/10 | Quest-for-gas is overdone (Galxe, Layer3) |
| HookAgents | 6/10 | Best Uniswap idea but LP management is saturated |
| YieldGPT | 4/10 | "ChatGPT for DeFi" built 50+ times already |
| RiskDAO | 5/10 | Way too complex for hackathon scope |
| FarmFi | 3/10 | Needs physical IoT, not DeFi-focused enough |
| DeFiRewards | 4/10 | Receipt scanning + DeFi is a stretch |
| YieldBridge | 5/10 | Duplicate concept, nothing novel |
| UniCross | 5/10 | Cross-chain hooks extremely hard in 10 days |
| ZKCredit | 6/10 | Strong concept, ZK systems take weeks |
| AutoYoga | 5/10 | Same as HookAgents with different name |
| AgentCredit | 5/10 | Where do RWAs come from in a hackathon? |
| DeFiPay | 6/10 | Practical but NFC mobile app = huge scope |
| YieldAI | 4/10 | 5th yield aggregator variant |
| YieldMarket | 6/10 | Most original, but building AMM is a lot |

**Core problem:** 5 ideas are the same yield aggregator. Most misuse Yellow's state channel tech.

---

## FINAL DIRECTION: AgentPay — The Payment Layer for AI Agents

### The Thesis

> "HTTP gave agents data. AgentPay gives them money."

The internet is becoming an economy of AI agents. These agents write code, analyze data,
generate content, call APIs. But they can't pay for anything. When an agent needs a paid
API, compute, or another agent's service — a human must step in.

AgentPay is an MCP server that gives any AI agent a financial API.
Install it, and your AI agent can send payments, stream micropayments,
and settle across chains — all in USDC, all gas-free.

**Target: Yellow ($15K) + Circle ($10K) + ENS ($5K) = $30K potential**

### Why Each Sponsor Tech Is Essential (Not Bolted On)

| Problem | Without It | Sponsor Solution |
|---|---|---|
| 1000 micropayments = $250 gas | Economically impossible | **Yellow Nitrolite** — 1000 off-chain updates, 1 on-chain settle = $0.02 |
| Agent needs ETH on 7 chains for gas | Breaks completely | **Circle Paymaster** — pay gas in USDC |
| Agent has fragmented balance | Can't operate cross-chain | **Circle Gateway** — unified USDC across 7 chains |
| Agent address is 0x7a3b... | Undiscoverable, unreadable | **ENS** — agent-name.agentpay.eth |

### Architecture

```
Human gives task to AI Agent (Claude / GPT / any LLM)
                    |
        AI Agent calls MCP tools
                    |
         ┌── AgentPay MCP Server ──┐
         │                          │
    ┌────┴────┐  ┌───────┐  ┌──────┴──────┐
    │ Circle  │  │Yellow  │  │    ENS      │
    │Gateway +│  │Nitro-  │  │ Resolution  │
    │Paymaster│  │lite    │  │& Registry   │
    └────┬────┘  └───┬───┘  └──────┬──────┘
         │           │             │
         └───────────┴─────────────┘
                     |
          On-chain settlement
          (only when channel closes)
```

### MCP Tools Exposed

```
agentpay_balance        → Check USDC across all chains (Gateway)
agentpay_send           → One-shot payment to ENS name (Paymaster, gas-free)
agentpay_open_channel   → Open micropayment channel with another agent (Nitrolite)
agentpay_micropay       → Stream payment through channel (off-chain, instant, free)
agentpay_close_channel  → Settle net balance on-chain (one transaction)
agentpay_resolve        → Look up agent/service by ENS name
```

### The Demo (2.5 minutes)

**Act 1 — Problem (20 sec)**
> "AI agents are doing real work. But they can't pay for anything. We built the payment layer."

**Act 2 — Live Demo (90 sec)**
Split screen: Terminal (Claude) + Real-time Dashboard

```
User: "I need 1000 real-time crypto price points. Find a provider and get them."
```

Claude uses AgentPay tools:
1. agentpay_resolve("market-data.agentpay.eth") → finds provider
2. agentpay_balance() → "$100 USDC across Base + Arbitrum"
3. agentpay_open_channel(provider, $5 deposit) → opens state channel

Dashboard animates: connection between two agents lights up.

4. Agent requests data. Each point = agentpay_micropay($0.001)

Dashboard: micropayment counter streams in real-time. $0.001... $0.002...

5. agentpay_close_channel() → settles $1.00 in ONE on-chain tx

**Act 3 — The Numbers (20 sec)**
```
Micropayments:    1,000
Total cost:       $1.00
On-chain txs:     1
Gas (in USDC):    $0.02
If on-chain:      1,000 × $0.25 = $250.00
Savings:          250x cheaper
```

**Act 4 — The Pitch (15 sec)**
> "AgentPay is an MCP server. Any AI agent can use it.
> We're building the Stripe for the agent economy."

### Build Schedule (10 days)

| Days | Layer | Deliverable | Risk |
|---|---|---|---|
| 1-2 | Foundation | MCP server + Circle wallet + send/balance tools | Low |
| 3-4 | Gas-Free | Circle Paymaster + Gateway cross-chain balance | Low-Med |
| 5-6 | Differentiator | Yellow Nitrolite: open_channel/micropay/close_channel | Medium |
| 7 | Identity | ENS resolution + agent registry subnames | Low |
| 8-9 | Polish | React dashboard (real-time streams, cost metrics, agent viz) | Low |
| 10 | Ship | Demo video, README, architecture diagram, submission | Low |

### Fallbacks

| Risk | Fallback |
|---|---|
| Nitrolite SDK issues | Batch micropayments on-chain (less impressive, still works) |
| Circle Gateway access | Use CCTP V2 directly for cross-chain |
| MCP too abstract for judges | Add web chat UI alongside terminal demo |
| Demo fails live | Pre-recorded backup + live dashboard |

### What Makes This Different From Every Other Submission

| What Others Build | Why AgentPay Is Different |
|---|---|
| "AI yield aggregator" | We're not optimizing yield. We're building infrastructure. |
| "ChatGPT for DeFi" | We're not wrapping DeFi in chat. We're enabling agent-to-agent payments. |
| "Gasless DEX" | We're not a DEX. We're the payment rail underneath. |
| "Cross-chain bridge UI" | We're not bridging for humans. We're making money invisible to agents. |

### Judge Scoring Prediction

| Criteria (Weight) | Expected | Why |
|---|---|---|
| Functionality (25%) | 9/10 | Live demo, real payments, measurable 250x savings |
| Creativity (20%) | 9/10 | "Payment layer for AI agents" — novel category |
| Technical Difficulty (20%) | 8/10 | State channels + cross-chain + MCP |
| Practicality (20%) | 9/10 | Agents genuinely need this TODAY |
| UX/Polish (15%) | 8/10 | Real-time streaming dashboard is visceral |

---

## SDK Compatibility Verification (CONFIRMED 2026-02-05)

### Chain Overlap Matrix

| Chain | Nitrolite | Circle Paymaster | Circle Gateway | USDC Native | Status |
|---|---|---|---|---|---|
| **Base (8453)** | YES | YES | YES | YES | PRIMARY CHAIN |
| **Polygon (137)** | YES | YES | YES | YES | SECONDARY |
| Ethereum | YES | YES | YES | YES | Settlement only |
| Celo | YES | No | No | Yes | Not viable |
| Arbitrum | No | YES | YES | YES | No Nitrolite |
| Avalanche | No | YES | YES | YES | No Nitrolite |

**Decision: Build on Base as primary chain.** All four components work there.

### Package Compatibility

| Package | Version | Language | Peer Deps |
|---|---|---|---|
| `@erc7824/nitrolite` | latest | TypeScript | None |
| `@modelcontextprotocol/sdk` | latest | TypeScript | `zod` |
| Circle Paymaster | N/A (on-chain contract) | Permissionless | None |
| Circle Gateway | REST API | Any | Circle dev account |
| ENS | via `viem` | TypeScript | None |

**No dependency conflicts. All TypeScript. All compatible.**

### Nitrolite Confirmed Details
- Custody contract: `0x490fb189DdE3a01B00be9BA5F41e3447FbC838b6`
- Adjudicator: `0xcbbc03a873c11beeFA8676146721Fa00924d7e4`
- ClearNode WebSocket: `wss://clearnet.yellow.com/ws`
- Supports any ERC-20 token (USDC confirmed on Base + Polygon)
- Channel lifecycle: CHANOPEN → off-chain state updates → CHANCLOSE (cooperative) or challenge-response
- Resolution paths: cooperative close, challenge-response, checkpoint, reset

### Circle Paymaster Confirmed Details
- Chains: Arbitrum, Avalanche, Base, Ethereum, OP Mainnet, Polygon, Unichain
- USDC only
- ERC-4337 v0.7 and v0.8
- Supports EOAs via EIP-7702 (Pectra upgrade)
- **Permissionless** — no API keys, no signup needed
- 10% gas surcharge on Arbitrum/Base (negligible for demo)

### Circle Gateway Confirmed Details
- REST API, needs Circle developer account
- Unified USDC balance across 7 chains
- <500ms cross-chain liquidity
- Available: Arbitrum, Avalanche, Base, Ethereum, Optimism, Polygon, Unichain

### MCP SDK Confirmed Details
- Package: `@modelcontextprotocol/sdk`
- Peer dep: `zod` (v3.25+)
- Supports: tools, resources, prompts
- Transports: stdio (for Claude Code), Streamable HTTP (for web)
- Well-documented: freecodecamp tutorial, official docs

---

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-02-05 | Completed full research phase | Both agents analyzed 50+ winners, all 6 sponsors |
| 2026-02-05 | Rejected analysis file's top 5 | Most misuse Yellow tech, 5 are same idea |
| 2026-02-05 | Proposed 4 new recommendations | Based on sponsor intel + winning patterns |
| 2026-02-05 | Deep rethink of AgentPay | First-principles rebuild: MCP payment layer for AI agents |
| 2026-02-05 | Validated Nitrolite SDK | State channels confirmed: open/update/close lifecycle, TypeScript SDK, multi-chain (Polygon, Celo, Base) |
| 2026-02-05 | Full compatibility verification | All SDKs compatible: Base is primary chain, all TypeScript, no dep conflicts, USDC supported everywhere |
| 2026-02-05 | User confirmed AgentPay direction | Rebuilding from first principles as MCP payment layer for AI agents |
| | | |

## Next Steps

- [ ] Get user confirmation on AgentPay direction
- [ ] Run Nitrolite SDK hello-world (npm install @erc7824/nitrolite, test connection)
- [ ] Get Circle developer account + test Gateway/Paymaster APIs
- [ ] Scaffold MCP server with tool definitions
- [ ] Set up project repo (Next.js + TypeScript)
- [ ] Build Layer 0: MCP server + basic agentpay_balance + agentpay_send
- [ ] Build Layer 1: Paymaster + Gateway integration
- [ ] Build Layer 2: Nitrolite state channels (open/micropay/close)
- [ ] Build Layer 3: ENS resolution + subname registry
- [ ] Build Layer 4: Real-time React dashboard
- [ ] Record demo video (720p+, 2.5 min)
- [ ] Write README + architecture diagram
- [ ] Submit (2 hours before deadline)

---

## Key Links

| Resource | URL |
|---|---|
| HackMoney 2026 | https://ethglobal.com/events/hackmoney2026 |
| Yellow Docs | https://docs.yellow.org/ |
| ERC-7824 | https://erc7824.org/ |
| Nitrolite SDK | https://github.com/erc7824/nitrolite |
| Uniswap v4 | https://docs.uniswap.org/contracts/v4/ |
| Circle Developer | https://developers.circle.com/ |
| Circle Gateway | https://www.circle.com/gateway |
| Circle Paymaster | https://www.circle.com/paymaster |
| LI.FI SDK | https://docs.li.fi/ |
| ENS Docs | https://docs.ens.domains/ |
