# AgentPay Demo Video Script

**Format:** Screen recording + voiceover (no face)
**Target Length:** ~3:00 (aim for 2:30-3:30)
**Resolution:** 1080p minimum
**Upload:** YouTube (unlisted)

---

## Setup Before Recording

1. Run `cd /Users/apple/Hackmoney/demo && npm run dev`
2. Open http://localhost:5173 in Chrome (clean profile, no extensions visible)
3. Zoom browser to 90-100% so full layout is visible
4. Test microphone audio levels
5. Close all other tabs and apps
6. Hide bookmarks bar
7. Screen recorder ready (OBS / QuickTime / ScreenFlow)

---

## Script

### [0:00 - 0:20] Landing Page — The Hook

**Screen:** Browser at http://localhost:5173 (landing page)

**Actions:** Page loads with animations. Slowly scroll down through sections.

**Say:**
> "AI agents can write code, analyze data, and call APIs. But they can't pay for anything. When an agent needs a paid service, a human has to step in. That breaks the entire autonomous loop."

**Scroll to "The Solution" section**

> "AgentPay fixes this. It's an MCP server that gives any AI agent a financial API — send payments, stream micropayments through state channels, and settle across chains. All in USDC. All gas-free."

---

### [0:20 - 0:40] Landing Page — Architecture + Numbers

**Actions:** Continue scrolling through "How It Works" and "MCP Tools" sections.

**Say:**
> "It works in three steps: connect the MCP server to your AI agent, fund the wallet with USDC, and the agent can pay. Five MCP tools cover everything — balance checks, payments, opening channels, streaming micropayments, and closing channels."

**Scroll to cost comparison section. Pause here.**

> "The numbers speak for themselves. A thousand on-chain micropayments cost $250 in gas. With AgentPay's state channels — two cents. That's 250 times cheaper."

---

### [0:40 - 0:50] Transition to Demo

**Actions:** Scroll back up. Click "Launch Demo" button. Demo page loads.

**Say:**
> "Let me show you this working live. This demo runs two wallets — an AI agent and a service provider — connected through Yellow Network state channels."

---

### [0:50 - 1:10] Step 1 — Fund Wallets

**Screen:** Demo page. Wallets are generated (auto on load). Two terminal panels + balance cards visible.

**Actions:** Click "1. Fund Wallets" button.

**Say:**
> "Both wallets are freshly generated. First we fund them from Yellow's testnet faucet."

**Wait for faucet success in both terminals.**

> "Both wallets funded. You can see the addresses and faucet confirmations in real time."

---

### [1:10 - 1:40] Step 2 — Connect to ClearNode

**Actions:** Click "2. Connect to ClearNode" button.

**Say:**
> "Now both wallets connect to Yellow Network's ClearNode — this is the state channel infrastructure that enables off-chain micropayments."

**Wait for authentication on both sides. Watch terminal logs.**

> "Both wallets authenticated. You can see the WebSocket connection, the challenge-response auth, and the ledger balances. This is all happening over Yellow's Nitrolite protocol."

---

### [1:40 - 2:10] Step 3 — Open Channel

**Actions:** Click "3. Open Channel" button.

**Say:**
> "Now the agent opens a payment channel with the service provider. This is one on-chain transaction that locks up 1 USDC."

**Wait for session ID to appear.**

> "Channel is open. That session ID represents a state channel between these two wallets. From here on, every payment is instant and free."

---

### [2:10 - 2:50] Step 4 — Micropayments

**Actions:** Click "4. Send Micropayment" button. Click it multiple times (5-8 times) with ~2 second gaps.

**Say (on first click):**
> "Now watch this. Each click sends a micropayment of one cent through the state channel."

**Keep clicking. Watch the balance cards update in real time — agent balance decreasing, service balance increasing.**

> "See the balances updating in real time? Agent goes down, service goes up. Every payment is a signed state update — no blockchain transactions, no gas fees, no waiting for confirmations."

**Click a few more times.**

> "That's eight micropayments in ten seconds. On-chain, that would have cost over two dollars in gas. Here? Zero. This is what makes agent-to-agent commerce practical."

---

### [2:50 - 3:10] Closing — Why It Matters

**Screen:** Stay on demo page showing the final balances and protocol logs.

**Say:**
> "AgentPay is built on three pieces of infrastructure. Yellow Network for state channel micropayments. Circle for gas-free USDC transfers and cross-chain settlement. And ENS for human-readable agent identity."

> "This is the payment layer for the agent economy. HTTP gave agents data. AgentPay gives them money."

**End. Hold on screen for 2 seconds, then fade out.**

---

## Recording Tips

### Do
- Speak at a steady, confident pace — not rushed
- Let each step complete before moving to the next
- Pause briefly on the balance cards updating (the visual payoff)
- Keep the cursor near what you're describing
- Leave 1 second of silence before and after the recording

### Don't
- Speed up the video (against rules)
- Show private keys or .env files
- Apologize for anything — just show what works
- Rush through the micropayment clicks — let the audience absorb it
- Go over 4 minutes

### If Something Fails
- If faucet fails: refresh page, try again (sometimes takes 2 attempts)
- If WebSocket disconnects: refresh and redo from step 1
- If a step hangs for >10 seconds: explain briefly and move on
- Record multiple takes — pick the cleanest one

---

## After Recording

- [ ] Watch full video, check audio sync and clarity
- [ ] Verify no private keys or secrets visible
- [ ] Confirm length is 2:00-4:00
- [ ] Upload to YouTube (unlisted)
- [ ] Test link in incognito browser
- [ ] Update README.md with video link
- [ ] Submit to HackMoney
