import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Yellow Network logo
const YellowLogo = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
    <rect width="40" height="40" rx="8" fill="#FACC15"/>
    <path d="M20 8L28 16L20 24L12 16L20 8Z" fill="#0a0a0a"/>
    <path d="M20 18L28 26L20 34L12 26L20 18Z" fill="#0a0a0a" fillOpacity="0.5"/>
  </svg>
);

// Circle logo
const CircleLogo = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
    <circle cx="20" cy="20" r="18" fill="#3B82F6"/>
    <circle cx="20" cy="20" r="10" fill="#0a0a0a"/>
    <circle cx="20" cy="20" r="6" fill="#3B82F6"/>
  </svg>
);

// ENS logo
const ENSLogo = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
    <rect width="40" height="40" rx="8" fill="#5298FF"/>
    <path d="M12 12L20 8L28 12V20L20 32L12 20V12Z" fill="white" fillOpacity="0.9"/>
  </svg>
);

// Animated gradient orbs
const GradientOrbs = () => (
  <>
    <motion.div
      className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(250,204,21,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }}
      animate={{
        x: [0, 50, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-20 right-[10%] w-[600px] h-[600px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }}
      animate={{
        x: [0, -40, 0],
        y: [0, -50, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(82,152,255,0.1) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }}
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />
  </>
);

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

function Landing() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col">
        <GradientOrbs />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
          <motion.div
            className="text-2xl font-bold tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-yellow-400">Agent</span>Pay
          </motion.div>
          <motion.div
            className="flex items-center gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <a
              href="https://github.com/Cassxbt/Hackmoney2026"
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              GitHub
            </a>
            <Link
              to="/demo"
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-yellow-400/20"
            >
              Launch Demo
            </Link>
          </motion.div>
        </nav>

        <div className="relative z-10 flex-1 flex items-center justify-center px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium bg-yellow-400/10 text-yellow-400 rounded-full border border-yellow-400/20"
            >
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              HackMoney 2026
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.95] tracking-tight"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              The Payment Layer
              <br />
              <span className="text-yellow-400">for AI Agents</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              HTTP gave agents data.
              <br />
              <span className="text-white font-medium">AgentPay gives them money.</span>
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                to="/demo"
                className="group px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-lg rounded-xl transition-all shadow-xl shadow-yellow-400/20 hover:shadow-yellow-400/30 hover:scale-[1.02]"
              >
                Try Live Demo
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <a
                href="https://github.com/Cassxbt/Hackmoney2026"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl font-semibold text-lg transition-all"
              >
                View Source
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto"
              variants={stagger}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              {[
                { value: '250x', label: 'Cheaper than on-chain' },
                { value: '7', label: 'Chains supported' },
                { value: '$0', label: 'Gas for agents' },
              ].map((stat) => (
                <motion.div key={stat.label} variants={fadeUp} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-400">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
          </motion.div>
        </motion.div>
      </header>

      {/* Problem/Solution Section */}
      <section className="py-32 px-8 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 gap-16 md:gap-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <div className="inline-block px-3 py-1 text-xs font-semibold bg-red-500/10 text-red-400 rounded-full mb-4">
                THE PROBLEM
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">AI Agents Can't Spend Money</h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                Today's AI agents can browse the web, write code, and analyze data — but they can't pay for anything. No API purchases, no service subscriptions, no micropayments for compute.
              </p>
              <p className="text-gray-500 mt-4">
                They're economically powerless.
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="inline-block px-3 py-1 text-xs font-semibold bg-green-500/10 text-green-400 rounded-full mb-4">
                THE SOLUTION
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">A Financial API for Agents</h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                AgentPay is an MCP server that gives any AI agent the ability to send payments, stream micropayments through state channels, and settle across multiple chains.
              </p>
              <p className="text-white font-medium mt-4">
                All in USDC. All gas-free.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-8 bg-gradient-to-b from-transparent via-yellow-400/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Three steps to financially-enabled AI</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            {[
              {
                num: '01',
                title: 'Connect MCP Server',
                desc: 'Add AgentPay to your AI assistant\'s MCP config. Works with Claude, GPT, and any MCP-compatible agent.',
                color: 'yellow'
              },
              {
                num: '02',
                title: 'Fund the Wallet',
                desc: 'Deposit USDC to the agent\'s wallet. Supports multiple chains via Circle Gateway with unified balance.',
                color: 'blue'
              },
              {
                num: '03',
                title: 'Agent Pays',
                desc: 'Your agent can now send payments, open payment channels, and stream micropayments — all gas-free.',
                color: 'green'
              },
            ].map((step) => (
              <motion.div
                key={step.num}
                variants={scaleIn}
                className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-yellow-400/20 transition-all duration-300"
              >
                <div className={`text-5xl font-bold text-${step.color}-400/20 mb-4`}>{step.num}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* MCP Tools */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">MCP Tools</h2>
            <p className="text-gray-400 text-lg">Five tools for complete financial capabilities</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              { name: 'agentpay_balance', desc: 'Check wallet balance across all supported chains', accent: '#3B82F6' },
              { name: 'agentpay_send', desc: 'Send USDC to any address or ENS name, gas-free', accent: '#22C55E' },
              { name: 'agentpay_open_channel', desc: 'Open a payment channel for streaming micropayments', accent: '#FACC15' },
              { name: 'agentpay_micropay', desc: 'Send instant off-chain micropayments (0.001 USDC+)', accent: '#F472B6' },
              { name: 'agentpay_close_channel', desc: 'Close channel and settle final balances on-chain', accent: '#F97316' },
            ].map((tool) => (
              <motion.div
                key={tool.name}
                variants={fadeUp}
                className="group p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
              >
                <code
                  className="font-mono text-sm font-medium"
                  style={{ color: tool.accent }}
                >
                  {tool.name}
                </code>
                <p className="text-gray-400 text-sm mt-2">{tool.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack / Partners */}
      <section className="py-32 px-8 relative">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(250,204,21,0.3) 0%, transparent 50%)`,
          }}
        />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Built With</h2>
            <p className="text-gray-400 text-lg">Enterprise-grade infrastructure</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              {
                Logo: YellowLogo,
                name: 'Yellow Network',
                desc: 'State channels for instant, off-chain micropayments with on-chain settlement',
                color: 'yellow'
              },
              {
                Logo: CircleLogo,
                name: 'Circle',
                desc: 'Gateway for cross-chain USDC, Paymaster for gas-free transactions',
                color: 'blue'
              },
              {
                Logo: ENSLogo,
                name: 'ENS',
                desc: 'Human-readable names for agent identity and payment routing',
                color: 'sky'
              },
            ].map(({ Logo, name, desc }) => (
              <motion.div
                key={name}
                variants={scaleIn}
                className="text-center p-10 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Logo />
                </div>
                <h3 className="text-xl font-semibold mb-3">{name}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-32 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="p-10 md:p-16 rounded-3xl bg-gradient-to-br from-yellow-400/10 via-transparent to-blue-500/10 border border-white/5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">The Numbers</h2>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="text-center p-6 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="text-sm text-red-400 font-medium mb-2">Without AgentPay</div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">$250</div>
                <div className="text-gray-500 text-sm">1000 on-chain micropayments</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-green-500/5 border border-green-500/10">
                <div className="text-sm text-green-400 font-medium mb-2">With AgentPay</div>
                <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">$0.02</div>
                <div className="text-gray-500 text-sm">1000 state channel micropayments</div>
              </div>
            </div>
            <div className="text-center mt-10">
              <span className="text-5xl md:text-6xl font-bold text-yellow-400">250x</span>
              <span className="text-2xl text-gray-400 ml-3">cheaper</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">See It In Action</h2>
          <p className="text-gray-400 text-lg mb-12">
            Watch real micropayments flow between two wallets in real-time, powered by Yellow Network state channels.
          </p>
          <Link
            to="/demo"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xl rounded-xl transition-all shadow-xl shadow-yellow-400/20 hover:shadow-yellow-400/30 hover:scale-[1.02]"
          >
            Launch Live Demo
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-semibold">Agent</span>
            <span className="font-semibold text-white">Pay</span>
            <span className="mx-2">·</span>
            <span>HackMoney 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/Cassxbt/Hackmoney2026" className="hover:text-white transition-colors">GitHub</a>
            <span className="text-gray-700">|</span>
            <span>Yellow · Circle · ENS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
