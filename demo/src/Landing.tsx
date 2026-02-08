import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

function Landing() {
  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] opacity-30"
          style={{ background: 'radial-gradient(ellipse at center, rgba(250,204,21,0.08) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] opacity-20"
          style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, transparent 60%)' }} />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-xl font-semibold tracking-tight"
        >
          <span className="text-yellow-400">Agent</span><span className="text-white/90">Pay</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-5"
        >
          <a
            href="https://github.com/Cassxbt/Hackmoney2026"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            GitHub
          </a>
          <Link
            to="/demo"
            className="text-sm font-medium px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] rounded-lg transition-all"
          >
            Launch Demo
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 pt-24 pb-32 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-10 text-xs font-medium bg-yellow-400/[0.08] text-yellow-400/90 rounded-full border border-yellow-400/[0.12]"
          >
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
            HackMoney 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8"
          >
            <span className="block text-white">The Payment Layer</span>
            <span className="block bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
              for AI Agents
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            HTTP gave agents data.{' '}
            <span className="text-white/70 font-medium">AgentPay gives them money.</span>
            <br className="hidden sm:block" />
            Send payments, stream micropayments, settle across chains — all gas-free.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/demo"
              className="group px-7 py-3.5 bg-gradient-to-b from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-semibold rounded-xl transition-all shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/25 hover:translate-y-[-1px]"
            >
              Try Live Demo
              <span className="inline-block ml-1.5 group-hover:translate-x-0.5 transition-transform">&#8594;</span>
            </Link>
            <a
              href="https://github.com/Cassxbt/Hackmoney2026"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 text-white/70 hover:text-white font-medium rounded-xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.03] transition-all"
            >
              View Source
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-24 flex items-center justify-center gap-12 md:gap-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {[
              { value: '250x', label: 'Cost reduction' },
              { value: '0', label: 'Gas for agents', prefix: '$' },
              { value: '7', label: 'Chains supported' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">
                  {s.prefix}{s.value}
                </div>
                <div className="text-xs text-white/30 mt-1 tracking-wide uppercase">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Problem / Solution */}
      <section className="relative z-10 py-28 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 gap-16 lg:gap-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider bg-red-500/[0.08] text-red-400/80 rounded-md border border-red-500/[0.1] mb-5">
                The Problem
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5 text-white/95">
                AI Agents Can't<br />Spend Money
              </h2>
              <p className="text-white/40 leading-relaxed text-[17px]">
                Today's AI agents browse the web, write code, analyze data — but they can't pay for anything.
                No API purchases, no service subscriptions, no micropayments for compute.
              </p>
              <p className="text-white/25 mt-3 text-[15px] italic">
                They're economically powerless.
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/[0.08] text-emerald-400/80 rounded-md border border-emerald-500/[0.1] mb-5">
                The Solution
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5 text-white/95">
                A Financial API<br />for Agents
              </h2>
              <p className="text-white/40 leading-relaxed text-[17px]">
                AgentPay is an MCP server that gives any AI agent the ability to send payments,
                stream micropayments through state channels, and settle across chains.
              </p>
              <p className="text-white/70 mt-3 text-[15px] font-medium">
                All in USDC. All gas-free.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="relative z-10 py-28 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-white/35 text-lg">Seven MCP tools for complete financial capabilities</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-6 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
          >
            {/* Large card — State Channels */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-4 group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-yellow-400/20 p-8 lg:p-10 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.04]"
                style={{ background: 'radial-gradient(circle, rgba(250,204,21,1) 0%, transparent 70%)' }} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-400/[0.1] border border-yellow-400/[0.15] flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-yellow-400/60 uppercase tracking-wider">Core Feature</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white/90">State Channel Micropayments</h3>
                <p className="text-white/35 leading-relaxed max-w-lg">
                  Open a channel, stream thousands of instant micropayments off-chain, then settle with a single transaction.
                  Powered by Yellow Network's Nitrolite protocol.
                </p>
                <div className="flex gap-3 mt-6">
                  <code className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/[0.04] text-yellow-400/70 border border-white/[0.06]">
                    agentpay_open_channel
                  </code>
                  <code className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/[0.04] text-yellow-400/70 border border-white/[0.06]">
                    agentpay_micropay
                  </code>
                  <code className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/[0.04] text-yellow-400/70 border border-white/[0.06]">
                    agentpay_close_channel
                  </code>
                </div>
              </div>
            </motion.div>

            {/* Gas-free */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 group rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-blue-400/20 p-7 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/[0.1] border border-blue-500/[0.15] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white/90">Gas-Free Transfers</h3>
              <p className="text-sm text-white/35 leading-relaxed">
                Circle Paymaster covers gas costs. Agents pay in USDC, never need ETH.
              </p>
              <code className="inline-block text-xs font-mono px-2.5 py-1 mt-4 rounded-md bg-white/[0.04] text-blue-400/70 border border-white/[0.06]">
                agentpay_send
              </code>
            </motion.div>

            {/* Cross-chain */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 group rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-400/20 p-7 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/[0.1] border border-purple-500/[0.15] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white/90">Cross-Chain USDC</h3>
              <p className="text-sm text-white/35 leading-relaxed">
                Unified balance across 7 chains via Circle Gateway. One API, every chain.
              </p>
              <code className="inline-block text-xs font-mono px-2.5 py-1 mt-4 rounded-md bg-white/[0.04] text-purple-400/70 border border-white/[0.06]">
                agentpay_balance
              </code>
            </motion.div>

            {/* ENS */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 group rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-sky-400/20 p-7 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-500/[0.1] border border-sky-500/[0.15] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white/90">ENS Identity</h3>
              <p className="text-sm text-white/35 leading-relaxed">
                Send to names, not addresses. Agents are discoverable via ENS.
              </p>
              <code className="inline-block text-xs font-mono px-2.5 py-1 mt-4 rounded-md bg-white/[0.04] text-sky-400/70 border border-white/[0.06]">
                vitalik.eth
              </code>
            </motion.div>

            {/* MCP Standard */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 group rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-400/20 p-7 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/[0.1] border border-emerald-500/[0.15] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white/90">MCP Standard</h3>
              <p className="text-sm text-white/35 leading-relaxed">
                Works with Claude, GPT, and any MCP-compatible AI agent. Plug and play.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Code Example */}
      <section className="relative z-10 py-28 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            {/* Config */}
            <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden border border-white/[0.06]">
              <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                <span className="ml-2 text-xs text-white/30 font-mono">claude_desktop_config.json</span>
              </div>
              <pre className="p-5 text-sm font-mono leading-relaxed bg-[#0a0a0f] overflow-x-auto">
                <code>
                  <span className="text-white/25">{'{\n'}</span>
                  <span className="text-white/25">{'  '}</span>
                  <span className="text-purple-400/70">"mcpServers"</span>
                  <span className="text-white/25">{': {\n'}</span>
                  <span className="text-white/25">{'    '}</span>
                  <span className="text-yellow-400/70">"agentpay"</span>
                  <span className="text-white/25">{': {\n'}</span>
                  <span className="text-white/25">{'      '}</span>
                  <span className="text-sky-400/70">"command"</span>
                  <span className="text-white/25">{': '}</span>
                  <span className="text-emerald-400/70">"npx agentpay-mcp"</span>
                  <span className="text-white/25">{'\n    }\n  }\n}'}</span>
                </code>
              </pre>
            </motion.div>

            {/* Usage */}
            <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden border border-white/[0.06]">
              <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                <span className="ml-2 text-xs text-white/30 font-mono">agent conversation</span>
              </div>
              <div className="p-5 text-sm font-mono leading-loose bg-[#0a0a0f]">
                <div className="text-white/50">
                  <span className="text-white/20">&gt;</span> "Send 0.01 USDC to vitalik.eth"
                </div>
                <div className="mt-3 space-y-1.5">
                  <div><span className="text-emerald-400/70">&#10003;</span> <span className="text-white/30">Resolved</span> <span className="text-sky-400/60">vitalik.eth</span> <span className="text-white/20">&#8594;</span> <span className="text-white/30">0xd8dA...6045</span></div>
                  <div><span className="text-emerald-400/70">&#10003;</span> <span className="text-white/30">Sent</span> <span className="text-yellow-400/70">0.01 USDC</span> <span className="text-white/20">gas-free</span></div>
                  <div><span className="text-emerald-400/70">&#10003;</span> <span className="text-white/20">TX:</span> <span className="text-purple-400/50">0xcd30...9f03</span></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="relative z-10 py-28 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="rounded-3xl overflow-hidden border border-white/[0.06] bg-white/[0.01]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="p-10 md:p-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">The Economics</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center p-8 rounded-2xl bg-red-500/[0.03] border border-red-500/[0.08]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-red-400/60 mb-3">Without AgentPay</div>
                  <div className="text-5xl md:text-6xl font-bold text-white/90 mb-2">$250</div>
                  <div className="text-sm text-white/25">1,000 on-chain micropayments</div>
                </div>
                <div className="text-center p-8 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/[0.08]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/60 mb-3">With AgentPay</div>
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent mb-2">$0.02</div>
                  <div className="text-sm text-white/25">1,000 state channel micropayments</div>
                </div>
              </div>
              <div className="text-center mt-10">
                <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">250x</span>
                <span className="text-xl text-white/30 ml-3">cheaper</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Built With */}
      <section className="relative z-10 py-28 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Built With</h2>
            <p className="text-white/30 text-lg">Enterprise-grade infrastructure</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              {
                name: 'Yellow Network',
                desc: 'State channels for instant, off-chain micropayments via Nitrolite protocol',
                color: 'yellow',
                icon: (
                  <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                    <rect width="32" height="32" rx="6" fill="#FACC15" fillOpacity={0.15} />
                    <path d="M16 7L22 13L16 19L10 13L16 7Z" fill="#FACC15" />
                    <path d="M16 15L22 21L16 27L10 21L16 15Z" fill="#FACC15" fillOpacity={0.4} />
                  </svg>
                ),
              },
              {
                name: 'Circle',
                desc: 'Gateway for cross-chain USDC balance, Paymaster for gas-free transactions',
                color: 'blue',
                icon: (
                  <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                    <rect width="32" height="32" rx="6" fill="#3B82F6" fillOpacity={0.15} />
                    <circle cx="16" cy="16" r="7" stroke="#3B82F6" strokeWidth="2" fill="none" />
                    <circle cx="16" cy="16" r="3" fill="#3B82F6" />
                  </svg>
                ),
              },
              {
                name: 'ENS',
                desc: 'Human-readable names for agent identity and payment routing',
                color: 'sky',
                icon: (
                  <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                    <rect width="32" height="32" rx="6" fill="#38BDF8" fillOpacity={0.15} />
                    <path d="M10 10L16 7L22 10V18L16 26L10 18V10Z" fill="#38BDF8" fillOpacity={0.8} />
                  </svg>
                ),
              },
            ].map((item) => (
              <motion.div
                key={item.name}
                variants={fadeUp}
                className="group text-center p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300"
              >
                <div className="flex justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white/90">{item.name}</h3>
                <p className="text-sm text-white/30 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 px-6 lg:px-12">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">See It Live</h2>
          <p className="text-white/35 text-lg mb-10">
            Watch micropayments stream between two wallets in real time.
          </p>
          <Link
            to="/demo"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-b from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold text-lg rounded-xl transition-all shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/25 hover:translate-y-[-1px]"
          >
            Launch Live Demo
            <span className="group-hover:translate-x-1 transition-transform">&#8594;</span>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 lg:px-12 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/25">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400/70 font-semibold">Agent</span>
            <span className="font-semibold text-white/60">Pay</span>
            <span className="mx-1.5 text-white/10">|</span>
            <span>HackMoney 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/Cassxbt/Hackmoney2026"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/50 transition-colors"
            >
              GitHub
            </a>
            <span className="text-white/10">|</span>
            <span>Yellow Network &middot; Circle &middot; ENS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
