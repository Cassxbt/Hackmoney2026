# AgentPay Demo Video Script

**Target Length:** 2:30 (150 seconds)
**Resolution:** 1080p minimum
**Format:** MP4
**Upload:** YouTube (unlisted is fine)

---

## Setup Before Recording

1. Open Claude Desktop
2. Open Terminal (for logs/output if needed)
3. Open BaseScan in browser (for tx verification)
4. Test microphone audio
5. Clear terminal history
6. Close unnecessary apps
7. Test screen recording (OBS or ScreenFlow)

---

## Script

### [0:00 - 0:15] Opening — The Problem (15 seconds)

**Screen:** Your face OR text overlay OR slides

**Say:**
> "AI agents are doing real work. They write code, analyze data, call APIs. But they can't pay for anything. When an agent needs a paid service, a human has to step in. That breaks the autonomous flow. We need a payment layer for AI agents."

**Transition to screen share**

---

### [0:15 - 0:25] The Solution (10 seconds)

**Screen:** Terminal with Claude Desktop + README visible

**Say:**
> "AgentPay solves this. It's an MCP server that gives any AI agent a financial API. Send payments, stream micropayments, settle across chains—all in USDC, all gas-free."

---

### [0:25 - 2:15] Live Demo (90 seconds)

**Screen:** Split screen — Claude Desktop (left) + Terminal/Browser (right)

#### Demo 1: Balance Check (15 sec)

**Type in Claude:**
```
Check my USDC balance
```

**Show:**
- Claude calls `agentpay_balance`
- Output shows total USDC across chains
- Highlight: "Base: 9.98 USDC, Total: 9.98 USDC"

**Say:**
> "The agent checks its balance across all chains using Circle Gateway. Unified balance, no fragmentation."

---

#### Demo 2: Send to ENS Name (30 sec)

**Type in Claude:**
```
Send 0.01 USDC to vitalik.eth
```

**Show:**
- Claude calls `agentpay_send`
- Output shows ENS resolution: "vitalik.eth → 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
- Transaction hash appears
- Switch to BaseScan showing confirmed tx
- Highlight: "Gas paid in USDC (via Circle Paymaster)"

**Say:**
> "The agent sends to a readable ENS name, not a 0x address. It resolves the name, sends the payment, and pays gas in USDC—no ETH required. Circle Paymaster handles it."

---

#### Demo 3: State Channel Micropayments (45 sec)

**Type in Claude:**
```
Open a micropayment channel with 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb and deposit 1 USDC
```

**Show:**
- Claude calls `agentpay_open_channel`
- Output: "Channel opened, session ID: 0xabc123..., deposit: 1 USDC"

**Say:**
> "Now the agent opens a state channel with a counterparty using Yellow Nitrolite. This is off-chain. One deposit transaction, then unlimited micropayments for free."

**Type in Claude:**
```
Send 10 micropayments of 0.001 USDC each through the channel
```

**Show:**
- Claude calls `agentpay_micropay` 10 times
- Output shows: "Micropayment sent: 0.001 USDC, remaining balance: 0.999 USDC"
- Counter increments each time
- Highlight: "On-chain transactions: 0"

**Say:**
> "Ten micropayments, zero on-chain transactions. This happens off-chain via state channels. It's instant, free, and scales to thousands of payments."

**Type in Claude:**
```
Close the channel
```

**Show:**
- Claude calls `agentpay_close_channel`
- Output: "Channel closed, final settlement: 0.99 USDC to me, 0.01 USDC to counterparty"

**Say:**
> "When done, the agent closes the channel. One final on-chain transaction settles everything."

---

### [2:15 - 2:25] The Numbers (10 seconds)

**Screen:** Text overlay OR slide with numbers

**Show:**
```
Without AgentPay (on-chain):
1000 micropayments × $0.25 = $250

With AgentPay (state channels):
1000 micropayments = $0.02

250x cheaper.
```

**Say:**
> "Without AgentPay: 1000 micropayments cost $250 in gas. With state channels: $0.02 total. That's 250 times cheaper."

---

### [2:25 - 2:30] Closing (5 seconds)

**Screen:** Logo OR GitHub repo OR text "AgentPay"

**Say:**
> "AgentPay is the payment layer for the agent economy. HTTP gave agents data. AgentPay gives them money."

**Show on screen:**
```
github.com/YOUR_USERNAME/agentpay
Built with Yellow Nitrolite + Circle + ENS
```

**Fade out**

---

## Recording Tips

### Do:
- Test audio levels BEFORE recording
- Speak clearly and at moderate pace
- Show real output, real transactions
- Keep terminal text large and readable
- Use cursor highlights to draw attention
- Record multiple takes if needed
- Keep energy up (you're excited about this!)

### Don't:
- Speed up the video (DISQUALIFIES)
- Mumble or speak too fast
- Show passwords or private keys
- Use low resolution (<720p)
- Go over 4 minutes
- Apologize for bugs (just show what works)

---

## Alternative Demo (If Yellow Channels Don't Work)

If state channels aren't working, focus on:

1. **Balance check** (Circle Gateway)
2. **Send to ENS** (Circle Paymaster + ENS)
3. **Cross-chain balance** (show multiple chains)
4. **Gas-free transactions** (emphasize USDC gas payment)

Then say:
> "State channels with Yellow Nitrolite are integrated and auth is working. In production, this enables 250x cost savings for micropayments."

Show code in editor as proof of integration.

---

## Backup Plan

If live demo fails:
- Use pre-recorded demo
- Show screenshots
- Walk through code in editor
- Judges understand hackathon demos fail

But try to get a working demo. It's the strongest proof.

---

## After Recording

- [ ] Watch full video to check audio/visual quality
- [ ] Verify no private keys visible
- [ ] Confirm video is 2-4 minutes
- [ ] Upload to YouTube
- [ ] Set to "Unlisted" (not private, not public)
- [ ] Test link in incognito window
- [ ] Add to README.md
- [ ] Include in submission form

---

## Example Commands for Demo

```bash
# In Claude Desktop:
Check my USDC balance
Send 0.01 USDC to vitalik.eth
Open a micropayment channel with 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb and deposit 1 USDC
Send 10 micropayments of 0.001 USDC each through the channel
Close the channel
```

Practice these. Make sure they work BEFORE recording.

---

**Record early. You need time for retakes and upload.**
