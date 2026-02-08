import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';

function useTypewriter(text: string, speed = 35, startDelay = 800) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// Terminal scenes with architecture path mapping
const scenes = [
  {
    command: 'Check my USDC balance',
    results: [
      { text: 'Base Sepolia: 9.98 USDC', color: 'text-emerald-400/70' },
      { text: 'Ethereum: 0.00 USDC', color: 'text-emerald-400/70' },
      { text: 'Total: 9.98 USDC', color: 'text-yellow-400/80' },
    ],
    activePaths: ['agent', 'mcp', 'circle'] as string[],
    activeLabel: 'Circle Gateway',
  },
  {
    command: 'Send 0.01 USDC to vitalik.eth',
    results: [
      { text: 'Resolved vitalik.eth → 0xd8dA...6045', color: 'text-sky-400/70' },
      { text: 'Sent 0.01 USDC (gas-free via Paymaster)', color: 'text-emerald-400/70' },
      { text: 'TX: 0xcd30ddbc...9f03', color: 'text-purple-400/60' },
    ],
    activePaths: ['agent', 'mcp', 'circle', 'ens'] as string[],
    activeLabel: 'ENS + Circle Paymaster',
  },
  {
    command: 'Open micropayment channel, deposit 1 USDC',
    results: [
      { text: 'Channel opened with counterparty', color: 'text-emerald-400/70' },
      { text: 'Session: 0xa1b2c3d4...e5f6', color: 'text-yellow-400/70' },
      { text: 'Deposit: 1.00 USDC locked', color: 'text-emerald-400/70' },
    ],
    activePaths: ['agent', 'mcp', 'yellow'] as string[],
    activeLabel: 'Yellow Nitrolite',
  },
  {
    command: 'Stream 10 micropayments of $0.001',
    results: [
      { text: 'Sent 0.001 USDC (state v2)', color: 'text-emerald-400/50' },
      { text: 'Sent 0.001 USDC (state v3)', color: 'text-emerald-400/50' },
      { text: '... 8 more payments', color: 'text-white/20' },
      { text: '10 payments streamed, 0 gas used', color: 'text-yellow-400/80' },
    ],
    activePaths: ['agent', 'mcp', 'yellow'] as string[],
    activeLabel: 'Yellow State Channels',
  },
];

// Animated terminal
function AnimatedTerminal({ sceneIdx, scene, typedChars, visibleResults, phase }: {
  sceneIdx: number;
  scene: typeof scenes[0];
  typedChars: number;
  visibleResults: number;
  phase: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.06] w-full">
      <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]/60" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/60" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f]/60" />
        <span className="ml-2 text-xs text-white/25 font-mono">agentpay</span>
      </div>
      <div className="p-6 bg-[#0a0a0f] font-mono text-sm min-h-[220px]">
        <div className="text-white/40">
          <span className="text-white/20">&gt; </span>
          <span className="text-white/60">{scene.command.slice(0, typedChars)}</span>
          {phase === 'typing' && <span className="inline-block w-[7px] h-[14px] bg-yellow-400/60 ml-0.5 animate-pulse" />}
        </div>
        <div className="mt-3 space-y-1.5">
          {scene.results.slice(0, visibleResults).map((r, i) => (
            <motion.div
              key={`${sceneIdx}-${i}`}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-emerald-400/70">&#10003; </span>
              <span className={r.color}>{r.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Architecture flow diagram synced with terminal
function ArchitectureFlow({ sceneIdx }: { sceneIdx: number }) {
  const scene = scenes[sceneIdx];
  const paths = scene.activePaths;
  const isActive = (node: string) => paths.includes(node);

  const nodeBase = 'px-4 py-3 rounded-xl border text-center transition-all duration-400';
  const sponsorBase = 'px-3 py-2 rounded-lg border text-center transition-all duration-300';

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <motion.div
          key={scene.activeLabel}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-white/40">{scene.activeLabel}</span>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-4 lg:gap-6">
        {/* Agent */}
        <motion.div
          animate={{
            borderColor: isActive('agent') ? 'rgba(250,204,21,0.4)' : 'rgba(255,255,255,0.06)',
            boxShadow: isActive('agent') ? '0 0 24px rgba(250,204,21,0.08)' : 'none',
          }}
          transition={{ duration: 0.4 }}
          className={nodeBase + ' bg-white/[0.02]'}
        >
          <div className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Agent</div>
          <div className="text-xs font-mono text-yellow-400/70">Claude</div>
        </motion.div>

        {/* Connection line */}
        <div className="flex items-center">
          <motion.div
            animate={{ background: isActive('mcp') ? 'linear-gradient(to right, rgba(250,204,21,0.4), rgba(255,255,255,0.1))' : 'rgba(255,255,255,0.06)' }}
            transition={{ duration: 0.4 }}
            className="w-10 h-px"
          />
          <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-white/15" />
        </div>

        {/* MCP Server */}
        <motion.div
          animate={{
            borderColor: isActive('mcp') ? 'rgba(250,204,21,0.4)' : 'rgba(255,255,255,0.06)',
            boxShadow: isActive('mcp') ? '0 0 24px rgba(250,204,21,0.08)' : 'none',
          }}
          transition={{ duration: 0.4 }}
          className={nodeBase + ' bg-white/[0.02]'}
        >
          <div className="text-[10px] text-white/25 uppercase tracking-widest mb-1">MCP Server</div>
          <div className="text-xs font-mono text-yellow-400/70">AgentPay</div>
        </motion.div>

        {/* Connection line */}
        <div className="flex items-center">
          <motion.div
            animate={{ background: (isActive('yellow') || isActive('circle') || isActive('ens')) ? 'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.1))' : 'rgba(255,255,255,0.04)' }}
            transition={{ duration: 0.4 }}
            className="w-10 h-px"
          />
          <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-white/10" />
        </div>

        {/* Sponsor nodes */}
        <div className="flex flex-col gap-2">
          <motion.div
            animate={{
              borderColor: isActive('yellow') ? 'rgba(250,204,21,0.5)' : 'rgba(255,255,255,0.04)',
              opacity: isActive('yellow') ? 1 : 0.25,
              scale: isActive('yellow') ? 1.05 : 0.95,
              boxShadow: isActive('yellow') ? '0 0 16px rgba(250,204,21,0.1)' : 'none',
            }}
            transition={{ duration: 0.3 }}
            className={sponsorBase + ' bg-white/[0.02]'}
          >
            <div className="text-[10px] font-mono text-yellow-400/70">Yellow</div>
          </motion.div>

          <motion.div
            animate={{
              borderColor: isActive('circle') ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.04)',
              opacity: isActive('circle') ? 1 : 0.25,
              scale: isActive('circle') ? 1.05 : 0.95,
              boxShadow: isActive('circle') ? '0 0 16px rgba(96,165,250,0.1)' : 'none',
            }}
            transition={{ duration: 0.3 }}
            className={sponsorBase + ' bg-white/[0.02]'}
          >
            <div className="text-[10px] font-mono text-blue-400/70">Circle</div>
          </motion.div>

          <motion.div
            animate={{
              borderColor: isActive('ens') ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.04)',
              opacity: isActive('ens') ? 1 : 0.25,
              scale: isActive('ens') ? 1.05 : 0.95,
              boxShadow: isActive('ens') ? '0 0 16px rgba(56,189,248,0.1)' : 'none',
            }}
            transition={{ duration: 0.3 }}
            className={sponsorBase + ' bg-white/[0.02]'}
          >
            <div className="text-[10px] font-mono text-sky-400/70">ENS</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Logos
function YellowLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-1 h-6 bg-yellow-400 rounded-full" />
      <span className="text-2xl font-bold tracking-tight text-white/90">yellow</span>
    </div>
  );
}

function CircleLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="55 38 145 145" fill="none" className={className}>
      <path d="M178.464 80.9832L175.907 76.5164C175.707 76.1668 175.429 75.8679 175.095 75.6431C174.761 75.4183 174.379 75.2736 173.98 75.2202C173.581 75.1667 173.175 75.2061 172.793 75.3352C172.412 75.4642 172.065 75.6795 171.78 75.9643L165.94 81.8051C165.51 82.2355 165.242 82.8015 165.182 83.407C165.122 84.0125 165.274 84.62 165.612 85.1262C167.746 88.3851 169.455 91.9034 170.697 95.5957C173.017 102.495 173.663 109.846 172.582 117.044C171.5 124.242 168.722 131.08 164.476 136.992C160.23 142.904 154.639 147.721 148.164 151.046C141.689 154.371 134.516 156.107 127.237 156.113C119.739 156.134 112.352 154.3 105.734 150.774L115.635 140.878C120.594 142.755 125.934 143.4 131.197 142.759C136.461 142.117 141.49 140.208 145.853 137.194C150.215 134.181 153.782 130.153 156.245 125.458C158.708 120.763 159.995 115.54 159.995 110.237C159.993 109.104 159.93 107.972 159.808 106.846C159.42 103.064 158.375 99.3791 156.72 95.9568C156.535 95.5851 156.264 95.2625 155.931 95.0154C155.597 94.7683 155.21 94.6038 154.8 94.5354C154.391 94.4669 153.971 94.4965 153.575 94.6216C153.179 94.7467 152.819 94.9639 152.523 95.2553L146.595 101.183C146.279 101.498 146.049 101.888 145.926 102.317C145.803 102.745 145.792 103.198 145.893 103.633L146.391 105.762C147.267 109.487 147.037 113.387 145.727 116.983C144.418 120.579 142.087 123.715 139.021 126.005C135.955 128.295 132.288 129.64 128.468 129.875C124.648 130.11 120.843 129.225 117.519 127.328L114.912 125.834C114.413 125.546 113.834 125.43 113.262 125.506C112.691 125.581 112.161 125.842 111.753 126.249L87.5681 150.405C87.3043 150.669 87.0998 150.985 86.9684 151.335C86.8369 151.684 86.7815 152.057 86.8059 152.429C86.8303 152.801 86.9338 153.164 87.1097 153.493C87.2855 153.822 87.5295 154.109 87.8255 154.336L91.3873 157.068C101.658 164.984 114.27 169.258 127.237 169.218C159.758 169.218 186.219 142.758 186.219 110.237C186.221 99.9775 183.548 89.8944 178.464 80.9832Z" fill="url(#cg1)"/>
      <path d="M163.083 63.403C152.814 55.4876 140.203 51.213 127.237 51.2522C94.712 51.2522 68.252 77.7124 68.252 110.238C68.2502 120.497 70.9229 130.58 76.0065 139.492L78.5637 143.958C78.7632 144.312 79.0422 144.615 79.3787 144.842C79.7151 145.069 80.0999 145.215 80.5025 145.269C80.9051 145.322 81.3146 145.281 81.6986 145.148C82.0825 145.016 82.4305 144.796 82.7149 144.506L88.5516 138.67C88.9817 138.239 89.2494 137.673 89.3092 137.068C89.369 136.462 89.2172 135.855 88.8795 135.349C86.747 132.089 85.0381 128.571 83.7943 124.879C81.4735 117.981 80.8266 110.63 81.907 103.433C82.9875 96.2362 85.7643 89.3992 90.0082 83.4869C94.2521 77.5747 99.8414 72.7566 106.315 69.4305C112.788 66.1044 119.959 64.3656 127.237 64.3578C134.734 64.3371 142.12 66.1711 148.736 69.6963L138.823 79.5971C133.865 77.7187 128.524 77.0723 123.26 77.7134C117.997 78.3545 112.968 80.2639 108.605 83.2777C104.242 86.2914 100.676 90.3194 98.2135 95.0154C95.751 99.7114 94.4653 104.935 94.4671 110.238C94.4671 110.781 94.6124 113.264 94.6581 113.691C95.0587 117.449 96.1035 121.11 97.7466 124.514C97.9289 124.891 98.1987 125.22 98.5337 125.472C98.8687 125.723 99.2591 125.892 99.6723 125.962C100.085 126.032 100.51 126.003 100.909 125.876C101.308 125.749 101.672 125.528 101.968 125.232L107.896 119.308C108.213 118.991 108.444 118.598 108.566 118.166C108.688 117.734 108.698 117.279 108.594 116.842L108.104 114.729C107.76 113.257 107.584 111.75 107.581 110.238C107.581 106.797 108.484 103.417 110.201 100.435C111.918 97.4537 114.388 94.9754 117.363 93.2482C120.339 91.521 123.716 90.6056 127.156 90.5937C130.597 90.5817 133.98 91.4736 136.968 93.18L139.579 94.6745C140.077 94.9612 140.656 95.076 141.227 95.0009C141.797 94.9259 142.326 94.6653 142.734 94.2594L166.902 70.0907C167.166 69.8267 167.371 69.5094 167.502 69.16C167.634 68.8106 167.689 68.4372 167.665 68.0647C167.64 67.6922 167.537 67.3292 167.361 66.9999C167.185 66.6706 166.941 66.3827 166.645 66.1553L163.083 63.403Z" fill="url(#cg2)"/>
      <defs>
        <linearGradient id="cg1" x1="106.436" y1="172.975" x2="189.469" y2="89.9419" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B090F5"/><stop offset="1" stopColor="#5FBFFF"/>
        </linearGradient>
        <linearGradient id="cg2" x1="68.252" y1="98.2654" x2="167.67" y2="98.2654" gradientUnits="userSpaceOnUse">
          <stop stopColor="#68D7FA"/><stop offset="1" stopColor="#7EF1B3"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function ENSLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 86 94" fill="none" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M42.4734 1.5491C42.1294 1.02598 42.7618 0.413402 43.2749 0.772602L64.7575 15.8095C78.2972 25.2867 84.5315 42.208 80.2388 58.1544C79.8987 59.4177 79.5339 60.5235 79.1912 61.45C78.9787 62.0244 78.134 61.9004 78.0914 61.2895C77.7292 56.0972 73.9905 50.1611 71.2769 45.8527C70.7925 45.0835 70.3408 44.3663 69.9467 43.7144C67.3093 39.3512 48.2169 10.2849 42.4734 1.5491ZM14.0286 43.8411L39.7425 1.53062C40.0411 1.03949 39.5038 0.466613 38.9939 0.732504C34.4986 3.07609 22.3693 9.85687 12.8466 19.3674C2.41081 29.7898 10.8445 41.225 13.1082 43.9128C13.3584 44.2098 13.8269 44.1729 14.0286 43.8411ZM39.1069 92.8848C39.4509 93.4079 38.8185 94.0205 38.3054 93.6614L16.8228 78.6244C3.28314 69.1472 -2.95117 52.2259 1.34153 36.2795C1.68156 35.0162 2.04642 33.9104 2.38911 32.9839C2.6016 32.4095 3.44632 32.5335 3.48892 33.1444C3.85109 38.3366 7.58981 44.2728 10.3034 48.5812C10.7878 49.3503 11.2395 50.0676 11.6336 50.7195C14.271 55.0827 33.3634 84.149 39.1069 92.8848ZM41.8398 92.8988L67.5538 50.5883C67.7555 50.2566 68.224 50.2196 68.4742 50.5166C70.7379 53.2044 79.1716 64.6396 68.7358 75.062C59.2131 84.5725 47.0838 91.3533 42.5886 93.6969C42.0786 93.9628 41.5413 93.3899 41.8398 92.8988Z" fill="white"/>
    </svg>
  );
}

// Social icons
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

// Features data
const features = [
  {
    title: 'State Channel Micropayments',
    description: 'Open a channel, stream thousands of instant micropayments off-chain, then settle with a single transaction. Powered by Yellow Network Nitrolite protocol.',
    tools: ['agentpay_open_channel', 'agentpay_micropay', 'agentpay_close_channel'],
    color: 'yellow',
    icon: (
      <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: 'Gas-Free Transfers',
    description: 'Circle Paymaster covers gas costs. Agents transact in USDC and never need to hold ETH for fees.',
    tools: ['agentpay_send'],
    color: 'blue',
    icon: (
      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Cross-Chain USDC',
    description: 'Unified balance across seven chains via Circle Gateway. One API call surfaces every chain.',
    tools: ['agentpay_balance'],
    color: 'purple',
    icon: (
      <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    title: 'ENS Identity',
    description: 'Send to names, not addresses. Resolve full ENS profiles including avatars, social records, and metadata for identity-aware payment routing.',
    tools: ['agentpay_resolve'],
    color: 'sky',
    icon: (
      <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string }> = {
  yellow: { border: 'border-yellow-400/[0.15]', bg: 'bg-yellow-400/[0.08]', text: 'text-yellow-400/70' },
  blue: { border: 'border-blue-500/[0.15]', bg: 'bg-blue-500/[0.08]', text: 'text-blue-400/70' },
  purple: { border: 'border-purple-500/[0.15]', bg: 'bg-purple-500/[0.08]', text: 'text-purple-400/70' },
  sky: { border: 'border-sky-500/[0.15]', bg: 'bg-sky-500/[0.08]', text: 'text-sky-400/70' },
};

function Landing() {
  const { displayed, done } = useTypewriter(
    'Send payments, stream micropayments, settle across chains. All gas-free.',
    30,
    600
  );

  // Shared scene state for terminal + architecture
  const [sceneIdx, setSceneIdx] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [visibleResults, setVisibleResults] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'results' | 'pause'>('typing');

  const scene = scenes[sceneIdx];

  const nextScene = useCallback(() => {
    setSceneIdx((i) => (i + 1) % scenes.length);
    setTypedChars(0);
    setVisibleResults(0);
    setPhase('typing');
  }, []);

  useEffect(() => {
    if (phase === 'typing') {
      if (typedChars < scene.command.length) {
        const t = setTimeout(() => setTypedChars((c) => c + 1), 30);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase('results'), 300);
        return () => clearTimeout(t);
      }
    }
    if (phase === 'results') {
      if (visibleResults < scene.results.length) {
        const t = setTimeout(() => setVisibleResults((v) => v + 1), 250);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase('pause'), 1800);
        return () => clearTimeout(t);
      }
    }
    if (phase === 'pause') {
      const t = setTimeout(nextScene, 400);
      return () => clearTimeout(t);
    }
  }, [phase, typedChars, visibleResults, scene, nextScene]);

  // Parallax for hero
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

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
          <Link to="/"><span className="text-yellow-400">Agent</span><span className="text-white/90">Pay</span></Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-5"
        >
          <Link to="/about" className="text-sm text-white/50 hover:text-white/80 transition-colors">About</Link>
          <a href="https://github.com/cassxbt" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60 transition-colors">
            <GitHubIcon />
          </a>
          <a href="https://x.com/cassxbt" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60 transition-colors">
            <XIcon />
          </a>
        </motion.div>
      </nav>

      {/* Hero */}
      <header ref={heroRef} className="relative z-10 pt-24 pb-32 px-6 lg:px-12">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-5xl mx-auto text-center">
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
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-8"
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
            className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-4 leading-relaxed"
          >
            HTTP gave agents data.{' '}
            <span className="text-white/70 font-medium">AgentPay gives them money.</span>
          </motion.p>

          {/* Typing subtitle */}
          <div className="h-8 mb-12 flex items-center justify-center">
            <span className="text-base md:text-lg text-white/30 font-mono">
              {displayed}
              {!done && <span className="inline-block w-[7px] h-[18px] bg-yellow-400/50 ml-0.5 animate-pulse align-middle" />}
            </span>
          </div>

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
        </motion.div>
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
          >
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider bg-red-500/[0.08] text-red-400/80 rounded-md border border-red-500/[0.1] mb-5">
                The Problem
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5 text-white/95">
                AI Agents Can't<br />Spend Money
              </h2>
              <p className="text-white/40 leading-relaxed text-[17px]">
                Today's AI agents browse the web, write code, and analyze data. But they can't pay for anything.
                No API purchases, no service subscriptions, no micropayments for compute.
              </p>
              <p className="text-white/25 mt-3 text-[15px] italic">
                They're economically powerless.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const, delay: 0.1 }}
            >
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

      {/* Features: scroll-reveal sliding cards */}
      <section className="relative z-10 py-28 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">How It Works</h2>
            <p className="text-white/30 text-lg font-light tracking-wide">Seven MCP tools. Complete financial capabilities.</p>
          </motion.div>

          <div className="space-y-6">
            {features.map((feature, i) => {
              const c = colorMap[feature.color];
              const fromLeft = i % 2 === 0;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: fromLeft ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const, delay: 0.05 }}
                  className={`group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:${c.border} p-8 lg:p-10 transition-colors duration-300`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3 text-white/90">{feature.title}</h3>
                      <p className="text-white/35 leading-relaxed max-w-xl">{feature.description}</p>
                      <div className="flex flex-wrap gap-2 mt-5">
                        {feature.tools.map((t) => (
                          <code key={t} className={`text-xs font-mono px-2.5 py-1 rounded-md bg-white/[0.04] ${c.text} border border-white/[0.06]`}>{t}</code>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* See It Work: terminal + architecture */}
      <section className="relative z-10 py-28 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">See It Work</h2>
            <p className="text-white/30 text-lg font-light tracking-wide">Real agent commands. Real on-chain results.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const }}
            className="grid lg:grid-cols-2 gap-8 items-start"
          >
            <AnimatedTerminal
              sceneIdx={sceneIdx}
              scene={scene}
              typedChars={typedChars}
              visibleResults={visibleResults}
              phase={phase}
            />
            <ArchitectureFlow sceneIdx={sceneIdx} />
          </motion.div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="relative z-10 py-28 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="rounded-3xl overflow-hidden border border-white/[0.06] bg-white/[0.01]"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            <div className="p-10 md:p-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">The Economics</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center p-8 rounded-2xl bg-red-500/[0.03] border border-red-500/[0.08]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-red-400/60 mb-3">Without AgentPay</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-white/90 mb-2">$250</div>
                  <div className="text-sm text-white/25">1,000 on-chain micropayments</div>
                </div>
                <div className="text-center p-8 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/[0.08]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/60 mb-3">With AgentPay</div>
                  <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent mb-2">$0.02</div>
                  <div className="text-sm text-white/25">1,000 state channel micropayments</div>
                </div>
              </div>
              <div className="text-center mt-10">
                <span className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">250x</span>
                <span className="text-xl text-white/30 ml-3 font-light">cheaper</span>
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
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm font-light uppercase tracking-[0.25em] text-white/25">Built With</h2>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-12 md:gap-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <a href="https://yellow.org" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3 opacity-50 hover:opacity-80 transition-opacity">
              <YellowLogo />
              <span className="text-xs text-white/20 font-light tracking-wide group-hover:text-white/30 transition-colors">Nitrolite Protocol</span>
            </a>

            <div className="w-px h-10 bg-white/[0.06]" />

            <a href="https://circle.com" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3 opacity-50 hover:opacity-80 transition-opacity">
              <CircleLogo className="w-12 h-12" />
              <span className="text-xs text-white/20 font-light tracking-wide group-hover:text-white/30 transition-colors">Gateway + Paymaster</span>
            </a>

            <div className="w-px h-10 bg-white/[0.06]" />

            <a href="https://ens.domains" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3 opacity-50 hover:opacity-80 transition-opacity">
              <ENSLogo className="w-10 h-10" />
              <span className="text-xs text-white/20 font-light tracking-wide group-hover:text-white/30 transition-colors">Name Resolution</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 px-6 lg:px-12">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">See It Live</h2>
          <p className="text-white/30 text-lg font-light tracking-wide mb-10">
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
            <a href="https://github.com/Cassxbt/Hackmoney2026" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">GitHub</a>
            <a href="https://x.com/cassxbt" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">
              <XIcon />
            </a>
            <span className="text-white/10">|</span>
            <span className="font-light tracking-wide">Yellow Network · Circle · ENS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
