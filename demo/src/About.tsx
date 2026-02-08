import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const diagramFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const nodeReveal = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const nodeStagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function ArchitectureDiagram() {
  return (
    <motion.div
      className="relative w-full max-w-4xl mx-auto"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={nodeStagger}
    >
      {/* AI Agent */}
      <motion.div variants={nodeReveal} className="flex justify-center mb-2">
        <div className="px-8 py-5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-center min-w-[220px]">
          <div className="text-sm font-medium text-white/70 mb-1">AI Agent</div>
          <div className="text-[11px] text-white/25 font-mono">Claude, GPT, Custom</div>
        </div>
      </motion.div>

      {/* Connector: Agent to MCP */}
      <motion.div variants={diagramFade} className="flex justify-center">
        <div className="flex flex-col items-center">
          <div className="w-px h-8 bg-gradient-to-b from-white/[0.08] to-yellow-400/30" />
          <div className="text-[10px] font-mono text-yellow-400/50 tracking-wider py-1">MCP PROTOCOL</div>
          <div className="w-px h-8 bg-gradient-to-b from-yellow-400/30 to-white/[0.08]" />
        </div>
      </motion.div>

      {/* AgentPay MCP Server */}
      <motion.div variants={nodeReveal} className="flex justify-center mb-2">
        <div className="px-8 py-6 rounded-lg border border-yellow-400/20 bg-yellow-400/[0.03] text-center min-w-[280px]">
          <div className="text-base font-semibold text-yellow-400/90 mb-1.5">AgentPay MCP Server</div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] font-mono text-white/30">
            <span>balance</span>
            <span>send</span>
            <span>open_channel</span>
            <span>micropay</span>
            <span>close_channel</span>
            <span>resolve_ens</span>
          </div>
        </div>
      </motion.div>

      {/* Connector: MCP to services (three branches) */}
      <motion.div variants={diagramFade} className="relative flex justify-center">
        <div className="flex items-start w-full max-w-2xl">
          {/* Left branch */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-10 bg-gradient-to-b from-white/[0.08] to-amber-400/30" />
            <div className="text-[9px] font-mono text-amber-400/40 tracking-wider py-0.5">WEBSOCKET</div>
            <div className="w-px h-6 bg-amber-400/20" />
          </div>
          {/* Center branch */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-10 bg-gradient-to-b from-white/[0.08] to-blue-400/30" />
            <div className="text-[9px] font-mono text-blue-400/40 tracking-wider py-0.5">REST + ERC-4337</div>
            <div className="w-px h-6 bg-blue-400/20" />
          </div>
          {/* Right branch */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-10 bg-gradient-to-b from-white/[0.08] to-emerald-400/30" />
            <div className="text-[9px] font-mono text-emerald-400/40 tracking-wider py-0.5">VIEM / RPC</div>
            <div className="w-px h-6 bg-emerald-400/20" />
          </div>
        </div>
      </motion.div>

      {/* Three service boxes */}
      <motion.div variants={nodeReveal} className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-2">
        {/* Yellow Network */}
        <div className="px-4 py-5 rounded-lg border border-amber-400/15 bg-amber-400/[0.02] text-center">
          <div className="text-sm font-medium text-amber-400/80 mb-1.5">Yellow Network</div>
          <div className="text-[10px] text-white/25 leading-relaxed">
            Nitrolite state channels<br />
            Off-chain micropayments<br />
            Single settlement tx
          </div>
        </div>
        {/* Circle */}
        <div className="px-4 py-5 rounded-lg border border-blue-400/15 bg-blue-400/[0.02] text-center">
          <div className="text-sm font-medium text-blue-400/80 mb-1.5">Circle</div>
          <div className="text-[10px] text-white/25 leading-relaxed">
            Gateway: cross-chain USDC<br />
            Paymaster: gas in USDC<br />
            7 chains, unified balance
          </div>
        </div>
        {/* ENS */}
        <div className="px-4 py-5 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.02] text-center">
          <div className="text-sm font-medium text-emerald-400/80 mb-1.5">ENS</div>
          <div className="text-[10px] text-white/25 leading-relaxed">
            Bidirectional resolution<br />
            Full profile + social records<br />
            Identity-aware routing
          </div>
        </div>
      </motion.div>

      {/* Connector: services to blockchain */}
      <motion.div variants={diagramFade} className="relative flex justify-center">
        <div className="flex items-start w-full max-w-2xl">
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-8 bg-white/[0.06]" />
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-8 bg-white/[0.06]" />
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-8 bg-white/[0.06]" />
          </div>
        </div>
      </motion.div>

      {/* Base blockchain */}
      <motion.div variants={nodeReveal} className="flex justify-center">
        <div className="px-10 py-4 rounded-lg border border-white/[0.06] bg-white/[0.015] text-center">
          <div className="text-sm font-medium text-white/50 mb-0.5">Base (L2)</div>
          <div className="text-[10px] text-white/20 font-mono">USDC Settlement Layer</div>
        </div>
      </motion.div>

      {/* Payment flow label */}
      <motion.div variants={diagramFade} className="mt-8 text-center">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/[0.04] bg-white/[0.015]">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/60" />
          <span className="text-[11px] text-white/25 font-mono tracking-wide">
            Agent requests payment &rarr; MCP routes to service &rarr; Settlement on Base
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

const problems = [
  {
    title: 'API Marketplaces',
    desc: 'Agents can autonomously purchase API calls, data feeds, and compute resources without human approval for each transaction.',
  },
  {
    title: 'Pay-Per-Use AI Services',
    desc: 'AI agents can pay other AI agents for specialized tasks: translation, image generation, code review. Creating an agent-to-agent economy.',
  },
  {
    title: 'Autonomous Research',
    desc: 'Research agents can purchase journal access, datasets, and premium information sources to complete tasks without waiting for human intervention.',
  },
  {
    title: 'Micro-SaaS for Agents',
    desc: 'Service providers can charge agents per-request instead of monthly subscriptions, enabling granular pricing at $0.001 per call.',
  },
  {
    title: 'Cross-Border Payments',
    desc: 'Agents operating globally can settle in USDC across 7 chains without dealing with currency conversion, bank hours, or wire fees.',
  },
  {
    title: 'IoT & Device Payments',
    desc: 'Smart devices running AI can pay for bandwidth, electricity, or maintenance autonomously via micropayment channels.',
  },
];

const benefits = [
  { metric: '250x', label: 'Cheaper micropayments via state channels vs on-chain transactions' },
  { metric: '$0', label: 'Gas costs for agents. Circle Paymaster handles it in USDC' },
  { metric: '< 1s', label: 'Micropayment latency through off-chain state channels' },
  { metric: '7', label: 'Chains supported with unified USDC balance via Circle Gateway' },
  { metric: '1', label: 'On-chain transaction to settle thousands of micropayments' },
  { metric: 'Any', label: 'MCP-compatible AI agent works: Claude, GPT, custom agents' },
];

function About() {
  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased">
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-semibold tracking-tight">
          <span className="text-yellow-400">Agent</span><span className="text-white/90">Pay</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/about" className="text-sm text-white/80 font-medium">About</Link>
          <a href="https://github.com/cassxbt" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60 transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="https://x.com/cassxbt" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60 transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
      </nav>

      <header className="pt-20 pb-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              What is <span className="text-yellow-400">AgentPay</span>?
            </h1>
            <p className="text-xl text-white/40 leading-relaxed max-w-3xl">
              AgentPay is an MCP server that gives AI agents a complete financial API.
              It connects to any MCP-compatible AI assistant and enables it to send payments,
              stream micropayments through state channels, check balances across chains, and
              resolve human-readable ENS names. All in USDC, all without gas fees.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Problems It Solves</h2>
            <p className="text-white/30 text-lg font-light tracking-wide">Real use cases where AgentPay unlocks autonomous commerce</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
          >
            {problems.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all"
              >
                <h3 className="text-lg font-semibold text-white/90 mb-2">{p.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">By The Numbers</h2>
            <p className="text-white/30 text-lg font-light tracking-wide">Key metrics that define the AgentPay advantage</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
          >
            {benefits.map((b) => (
              <motion.div
                key={b.label}
                variants={fadeUp}
                className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent mb-2">
                  {b.metric}
                </div>
                <p className="text-sm text-white/35 leading-relaxed">{b.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Architecture</h2>
            <p className="text-white/30 text-lg font-light tracking-wide">How the payment stack connects</p>
          </motion.div>

          <ArchitectureDiagram />
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-4xl font-bold tracking-tight mb-5">See It In Action</h2>
          <p className="text-white/35 text-lg mb-10 font-light tracking-wide">
            Watch real micropayments stream between two wallets in real time.
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

      <footer className="py-8 px-6 lg:px-12 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/25">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400/70 font-semibold">Agent</span>
            <span className="font-semibold text-white/60">Pay</span>
            <span className="mx-1.5 text-white/10">|</span>
            <span>HackMoney 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Yellow Network &middot; Circle &middot; ENS</span>
            <a href="https://github.com/cassxbt" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/40 transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[16px] h-[16px]">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://x.com/cassxbt" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/40 transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default About;
