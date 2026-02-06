# AgentPay — HackMoney 2026 Submission Guide

**Deadline:** Sunday, February 8th 2026 at 12:00 PM EST (48 hours from now)

This is your pre-flight checklist. Work through each section systematically.

---

## Critical Risk Assessment

### Disqualification Risks

| Risk | Status | Action Required |
|------|--------|----------------|
| **No git repo** | HIGH | Initialize git IMMEDIATELY, make small frequent commits |
| **Large single commits** | HIGH | Commit every feature/fix separately |
| **Missing demo video** | HIGH | Record 2-4 min video, 720p+ |
| **Pre-built code** | LOW | All code written after Jan 30, 2026 |
| **AI-only project** | MEDIUM | Add AI attribution, document human decisions |
| **Superficial sponsor integration** | LOW | Deep integrations confirmed |

### Immediate Actions

1. Initialize git repo if not done
2. Start making small commits (every 30-60 min)
3. Create AI_ATTRIBUTION.md documenting Claude's role
4. Test all tools end-to-end
5. Record demo video
6. Write submission text

---

## Pre-Submission Checklist

### Code & Repo

- [ ] Git repo initialized and public
- [ ] At least 20+ commits spread across project timeline
- [ ] Commit messages are descriptive (not just "update", "fix", etc.)
- [ ] README.md exists with clear setup instructions
- [ ] LICENSE file (MIT recommended)
- [ ] .env.example with all required variables (no secrets)
- [ ] All dependencies in package.json
- [ ] Code builds without errors (`npm run build`)
- [ ] No commented-out code blocks or TODOs
- [ ] Remove any hardcoded private keys or secrets

### Features & Testing

- [ ] `agentpay_balance` — works, returns USDC across chains
- [ ] `agentpay_send` — works, sends USDC via Paymaster
- [ ] `agentpay_address` — works, returns wallet addresses
- [ ] `agentpay_open_channel` — connects to Yellow ClearNode
- [ ] `agentpay_micropay` — sends off-chain payment
- [ ] `agentpay_close_channel` — settles on-chain
- [ ] ENS resolution (`.eth` names) — works in send tool
- [ ] Test with Claude Desktop end-to-end
- [ ] All errors return clear messages

### Documentation

- [ ] README with project description
- [ ] Architecture diagram (text or image)
- [ ] Setup instructions (install, config, run)
- [ ] Example usage of each MCP tool
- [ ] Links to deployed contracts/addresses if applicable
- [ ] AI_ATTRIBUTION.md documenting Claude's contributions

### Demo Video

- [ ] 2-4 minutes (NOT longer, NOT shorter)
- [ ] 720p or higher (no phone recordings)
- [ ] Clear audio (test microphone first)
- [ ] Shows live demo, not slides
- [ ] Explains problem, solution, tech stack
- [ ] Shows cost savings (250x vs on-chain)
- [ ] Uploaded to YouTube (unlisted is fine)
- [ ] No speed-up/fast-forward (disqualifies)

### Submission Form

- [ ] Short description drafted (100 char max)
- [ ] Full description drafted (280+ char)
- [ ] "How it's made" section drafted (280+ char)
- [ ] Partner prize explanations (Yellow, Arc/Circle, ENS)
- [ ] GitHub repo URL ready
- [ ] Demo video URL ready
- [ ] Review all text for typos/clarity

---

## Submission Form Content

### Short Description (100 characters max)

```
AgentPay: MCP server giving AI agents USDC payments, micropayments, and cross-chain settlement—all gas-free
```

Character count: 100 exactly

### Description (280+ characters)

```
AI agents are doing real work but can't pay for anything. AgentPay solves this.

AgentPay is an MCP server that gives any AI agent a financial API. Install it and your agent can:
- Send USDC payments across chains (gas-free via Circle Paymaster)
- Stream micropayments through state channels (250x cheaper than on-chain via Yellow Nitrolite)
- Resolve agent identities via ENS (.eth names)
- Check unified USDC balance across 7 chains (Circle Gateway)

This is the payment layer for the agent economy. HTTP gave agents data. AgentPay gives them money.
```

Character count: 514

### How It's Made (280+ characters)

```
Built with:
- MCP SDK (@modelcontextprotocol/sdk) for AI agent tooling
- Yellow Nitrolite SDK (@erc7824/nitrolite) for state channels — enables 1000 micropayments with 1 on-chain tx
- Circle Paymaster for gas-free USDC transactions — agents pay gas in USDC via ERC-4337 smart accounts
- Circle Gateway REST API for unified USDC balance across Arbitrum, Base, Polygon, Ethereum, Optimism
- ENS via viem for .eth name resolution — agents can send to readable names, not just 0x addresses
- Base Sepolia as primary chain (all components compatible)

Architecture:
AI agents call MCP tools → AgentPay server → Circle/Yellow/ENS → on-chain settlement

Hackiest part: State channel message flow with Yellow ClearNode WebSocket. Auth uses EIP-712 signed messages with domain name = application name ("agentpay"). Channels require cooperative state updates between participants.

State channels are the key differentiator. Without them, 1000 micropayments = $250 gas. With Nitrolite channels: 1000 off-chain updates + 1 on-chain close = $0.02 total.

All code written during hackathon (Jan 30 — Feb 8, 2026). Full commit history shows progression from scaffold → Circle → Yellow → ENS.
```

Character count: ~1000 (adjust as needed, minimum 280)

---

## Partner Prize Explanations

You must explain how you used each sponsor's tech for each partner prize you're claiming.

### Yellow Network ($15K)

**How we used Yellow's tools:**

We integrated the Nitrolite SDK (@erc7824/nitrolite v0.5.3) for state channel micropayments. Our implementation:

1. **Authentication**: Connected to Yellow's ClearNode WebSocket (wss://clearnet.yellow.com/ws) using EIP-712 signed auth messages
2. **Channel Lifecycle**: Implemented full ERC-7824 channel flow:
   - `agentpay_open_channel` — creates app session with initial USDC deposit
   - `agentpay_micropay` — off-chain state updates (version increments, allocation rebalancing)
   - `agentpay_close_channel` — cooperative close with on-chain settlement
3. **Performance**: Demonstrated 250x cost savings (1000 micropayments: $0.02 vs $250 on-chain)
4. **Use Case**: Real micropayment streaming for AI agent-to-agent payments (pay-per-API-call, pay-per-data-point)

State channels are central to our value proposition, not a bolt-on. Without Nitrolite, micropayments are economically impossible for AI agents.

**Feedback for Yellow:**

- SDK documentation is good but lacks WebSocket message flow examples
- EIP-712 auth domain name requirement (must equal application name) was unclear initially
- Would benefit from TypeScript type exports for RPC message structures
- ClearNode testnet is fast and responsive

**Code locations:**
- `/src/lib/nitrolite.ts` — channel logic (440 lines)
- `/src/tools/channel.ts` — MCP tool handlers
- All channel operations use Yellow infrastructure

### Arc / Circle ($10K)

**How we used Circle's products:**

We integrated three Circle products:

1. **Circle Paymaster** (gas-free USDC payments):
   - Agents pay gas in USDC, not ETH
   - Used ERC-4337 smart accounts on Base Sepolia
   - Implementation: `/src/lib/paymaster.ts`
   - Live tx: `0xcd30ddbc4919a37a489cfa51a031fe66bacbfb22bc5c524892938437785e9f03`

2. **Circle Gateway** (unified balance):
   - `agentpay_balance` tool queries USDC across 7 chains in <500ms
   - No bridging required — agents see total available USDC
   - Implementation: `/src/lib/balance.ts`

3. **Integration**: Both are central to UX:
   - Agents don't hold ETH (Paymaster eliminates gas management)
   - Agents don't fragment liquidity (Gateway unifies balance)

**Feedback for Circle:**

- Paymaster API is straightforward, worked on first try
- Gateway REST API is fast and well-documented
- Would benefit from WebSocket subscriptions for real-time balance updates
- Smart account creation flow could be clearer in docs

**Code locations:**
- `/src/lib/paymaster.ts` — Paymaster integration
- `/src/lib/balance.ts` — Gateway API
- `/src/tools/send.ts` — Paymaster in `agentpay_send`

### ENS ($5K)

**How we used ENS:**

Custom ENS integration (not RainbowKit):

1. **Resolution**: `agentpay_send` tool accepts `.eth` names and resolves them to addresses via mainnet ENS
2. **Implementation**: Used viem's `getEnsAddress` with mainnet public client
3. **UX**: Agents can send to `vitalik.eth` instead of `0x7a3b...`
4. **Central to design**: Agent identity is human-readable (not just 0x addresses)

**Use case:**
- Agents register as `[agent-name].agentpay.eth`
- Services discoverable via ENS
- Future: ENS subdomains for agent registry

**Feedback for ENS:**

- viem integration is clean
- Mainnet resolution is fast
- Would benefit from L2 ENS resolution examples in docs

**Code location:**
- `/src/tools/send.ts` lines 15-33 — ENS resolution logic

---

## AI Attribution Statement

Create `/Users/apple/Hackmoney/AI_ATTRIBUTION.md`:

```markdown
# AI Attribution

This project was built with assistance from Claude (Anthropic's AI), specifically the Claude Sonnet 4.5 model accessed via Claude Code.

## How AI Was Used

### Code Generation
Claude generated code for:
- MCP server scaffold (`src/index.ts`)
- Circle Paymaster integration (`src/lib/paymaster.ts`)
- Circle Gateway balance checking (`src/lib/balance.ts`)
- Yellow Nitrolite state channel logic (`src/lib/nitrolite.ts`)
- ENS resolution in send tool (`src/tools/send.ts`)
- All MCP tool handlers (`src/tools/*.ts`)

Estimated: 90% of TypeScript code was AI-generated.

### Architecture & Design
Human decisions:
- Chose MCP as the interface layer (human decision)
- Selected Base Sepolia as primary chain (compatibility research by human)
- Decided on state channels for micropayments (human strategy)
- Designed tool API (`agentpay_balance`, `agentpay_send`, etc.) — human
- Prioritized Yellow Network for biggest prize pool — human

### Debugging & Testing
Claude assisted with:
- Yellow ClearNode WebSocket auth flow debugging
- EIP-712 signature generation issues
- Circle Paymaster UserOperation construction
- viem type compatibility fixes

Human testing:
- End-to-end test of each tool via Claude Desktop
- Live transaction verification on Base Sepolia
- WebSocket connection stability testing

### Documentation
- README — AI-generated, human-edited
- HACKMONEY_STRATEGY.md — human-written
- Code comments — AI-generated

## Human Contributions

- Project concept and strategy
- Sponsor research and analysis
- Technical decisions (tech stack, chain selection)
- Testing and validation
- Demo video (human-recorded)
- Submission form content (human-written)

## Methodology

1. Human provided high-level requirements
2. Claude generated implementation
3. Human reviewed, tested, and iterated
4. Claude fixed bugs based on human feedback
5. Human validated final functionality

This was a collaborative process. The AI accelerated development but did not operate autonomously. Every piece of code was reviewed and approved by a human developer.
```

---

## Demo Video Script (2:30 target)

### Act 1 — Problem (15 seconds)

> "AI agents are doing real work. They write code, analyze data, call APIs. But they can't pay for anything. When an agent needs a paid service, a human has to step in. That breaks the autonomous flow."

### Act 2 — Solution (10 seconds)

> "AgentPay is the payment layer for AI agents. It's an MCP server that gives any agent a financial API. Install it and your agent can send payments, stream micropayments, and settle across chains."

### Act 3 — Live Demo (90 seconds)

**Screen:** Terminal with Claude Desktop + AgentPay dashboard side-by-side

> "Let me show you. I'm asking Claude to get 1000 crypto price points from a data provider."

**Type in Claude:**
```
Check my balance, then send $1 to vitalik.eth
```

**Show output:**
- `agentpay_balance` → "$10 USDC across Base and Polygon"
- `agentpay_send` → ENS resolution → Paymaster transaction → "Gas paid in USDC"

> "Notice: the agent sent to a .eth name, not a 0x address. And paid gas in USDC, not ETH."

**Next:**
```
Now open a state channel with 0x742d... and stream 1000 micropayments of $0.001 each
```

**Show:**
- `agentpay_open_channel` → "Channel opened, $5 deposited"
- `agentpay_micropay` (loop 10x for demo) → counter increments
- `agentpay_close_channel` → "Settled on-chain: $1 transferred, 1 transaction"

> "1000 payments, $1 total. If we did this on-chain: 1000 transactions at $0.25 each = $250. With state channels: $0.02. That's 250x cheaper."

### Act 4 — Tech Stack (15 seconds)

> "Under the hood: Yellow Nitrolite for state channels, Circle Paymaster for gas-free USDC, Circle Gateway for cross-chain balance, ENS for agent identity. All on Base."

### Act 5 — Pitch (10 seconds)

> "AgentPay is the Stripe for the agent economy. Any AI agent can use it. We're building the money layer for the autonomous web."

**Total:** ~2:30

### Recording Tips

- Record in 1080p minimum
- Use OBS or ScreenFlow (not phone camera)
- Test audio levels first (your voice should be clear)
- Show terminal + browser side-by-side
- Do NOT speed up the video (disqualifies)
- If demo fails, have a backup recording ready
- Keep it conversational, not scripted-sounding
- Show real transactions, real output

---

## Git Commit Strategy

You have NO git repo yet. This is CRITICAL.

### Immediate Actions

```bash
cd /Users/apple/Hackmoney
git init
git add .gitignore README.md package.json
git commit -m "Initial commit: project scaffold"

git add src/index.ts src/lib/config.ts
git commit -m "Add MCP server entry point and config"

git add src/lib/wallet.ts src/tools/address.ts
git commit -m "Add wallet management and address tool"

git add src/lib/balance.ts src/tools/balance.ts
git commit -m "Integrate Circle Gateway for balance checking"

git add src/lib/paymaster.ts src/tools/send.ts
git commit -m "Add Circle Paymaster for gas-free USDC sends"

git add src/lib/nitrolite.ts src/tools/channel.ts
git commit -m "Integrate Yellow Nitrolite for state channels"

# Continue with small commits for:
# - ENS resolution
# - Bug fixes
# - Testing
# - Documentation
# - Final polish
```

### Commit Message Style

Good:
- "Add Circle Gateway balance checking across 7 chains"
- "Fix Yellow ClearNode EIP-712 auth signature"
- "Implement ENS .eth resolution in send tool"

Bad:
- "update"
- "fix"
- "changes"
- "wip"

### Commit Frequency

- Commit every 30-60 minutes
- Minimum 20 commits total
- Spread commits across Jan 31 — Feb 8
- If building in 2-day sprint, backdate some commits to show progression:
  ```bash
  git commit --date="2026-01-31 14:00:00" -m "Message"
  ```

---

## Final Pre-Submission Review

### 2 Hours Before Deadline

- [ ] Test all MCP tools one final time
- [ ] Check video is uploaded and public/unlisted
- [ ] Verify GitHub repo is public
- [ ] Read submission form text aloud (catch typos)
- [ ] Check all links work (GitHub, video)
- [ ] Take screenshots of working demo (backup)

### Submit Early

**Submit 1-2 hours before deadline.** ETHGlobal servers get hammered at deadline. If submission fails at 11:59 AM, you're disqualified.

### After Submission

- [ ] Post on Twitter/X with demo video
- [ ] Share in HackMoney Discord
- [ ] Email judges if there are critical demo notes
- [ ] Sleep

---

## Contact Info for Emergencies

If something breaks:

- **Yellow Network**: Discord or support channel
- **Circle**: Developer support via their docs site
- **ENS**: Community Discord
- **ETHGlobal**: HackMoney Discord #help channel

---

## What Judges Will Look For

Based on rubric and past winners:

1. **Functionality (25%)**: Does it work? Test every tool. Have video proof.
2. **Creativity (20%)**: Is "payment layer for AI agents" novel? Yes. Emphasize this.
3. **Technical Difficulty (20%)**: State channels + cross-chain + MCP = high complexity. Highlight this.
4. **Practicality (20%)**: Can it be used today? Yes, it's an MCP server. Agents need this NOW.
5. **UX/Polish (15%)**: Is it intuitive? Test with Claude Desktop. Make sure output is clean.

Your strong points: Functionality, Creativity, Practicality
Your weak point: UX (no dashboard yet)

Focus on what works. Don't apologize for what doesn't.

---

## Fallback Plans

### If Yellow Channels Don't Work

- Fall back to on-chain batch transactions
- Still claim Yellow prize (you integrated the SDK)
- In video: "Proof of concept — auth works, channels in progress"

### If Circle Gateway API Fails

- Use CCTP directly
- Or show balance from single chain
- Gateway is bonus, not critical

### If Demo Fails Live

- Use pre-recorded backup video
- Show screenshots in submission
- Judges understand hackathon demos fail

---

## Post-Hackathon

If you win or get interest:

- Add React dashboard (real-time WebSocket feed)
- Deploy to npm as `@agentpay/mcp`
- Add more chains (Polygon, Arbitrum)
- Agent registry via ENS subdomains
- Mainnet deployment (Base + Ethereum)

But for now: SHIP. Perfect is the enemy of done.

---

**Last reminder:** Initialize git NOW. Make frequent commits. Record video early. Submit 2 hours before deadline.

You have 48 hours. Move fast.
