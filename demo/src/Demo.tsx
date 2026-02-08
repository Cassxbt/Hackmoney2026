import { useState, useRef, useEffect, useCallback } from 'react';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { createWalletClient, http, type Hex, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';
import {
  createAuthRequestMessage,
  createAuthVerifyMessageFromChallenge,
  createGetLedgerBalancesMessage,
  createAppSessionMessage,
  createSubmitAppStateMessage,
  createEIP712AuthMessageSigner,
  createECDSAMessageSigner,
  RPCProtocolVersion,
  RPCAppStateIntent,
  type MessageSigner,
} from '@erc7824/nitrolite';
import './index.css';

const CLEARNODE_WS = 'wss://clearnet-sandbox.yellow.com/ws';
const FAUCET_URL = 'https://clearnet-sandbox.yellow.com/faucet/requestTokens';

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'tx' | 'dim';
}

interface WalletState {
  privateKey: Hex | null;
  address: Address | null;
  sessionKey: Address | null;
  ws: WebSocket | null;
  signer: MessageSigner | null;
  eip712Signer: any | null;
  connected: boolean;
  authenticated: boolean;
  balance: string;
}

function Terminal({ logs, title }: { logs: LogEntry[]; title: string }) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="terminal-dot red" />
        <div className="terminal-dot yellow" />
        <div className="terminal-dot green" />
        <span className="terminal-title">{title}</span>
      </div>
      <div className="terminal-body" ref={bodyRef}>
        {logs.map((log) => (
          <div key={log.id} className={`terminal-line ${log.type}`}>
            <span className="timestamp">{log.timestamp}</span>
            {log.message}
          </div>
        ))}
        {logs.length > 0 && <span className="cursor-blink" />}
      </div>
    </div>
  );
}

function BalanceCard({
  label,
  balance,
  address,
  connected,
  highlight
}: {
  label: string;
  balance: string;
  address: string | null;
  connected: boolean;
  highlight: boolean;
}) {
  return (
    <div className={`balance-card ${highlight ? 'pulse-success' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className={`status-dot ${connected ? 'online' : 'offline'}`} />
      </div>
      <div className="balance-value text-white">
        {balance} <span className="text-lg text-gray-400">USDC</span>
      </div>
      {address && (
        <div className="mt-2 text-xs text-gray-500 font-mono">
          {address.slice(0, 10)}...{address.slice(-8)}
        </div>
      )}
    </div>
  );
}

function Demo() {
  const [agentLogs, setAgentLogs] = useState<LogEntry[]>([]);
  const [serviceLogs, setServiceLogs] = useState<LogEntry[]>([]);
  const [protocolLogs, setProtocolLogs] = useState<LogEntry[]>([]);

  const [agent, setAgent] = useState<WalletState>({
    privateKey: null, address: null, sessionKey: null, ws: null, signer: null, eip712Signer: null,
    connected: false, authenticated: false, balance: '0.00'
  });

  const [service, setService] = useState<WalletState>({
    privateKey: null, address: null, sessionKey: null, ws: null, signer: null, eip712Signer: null,
    connected: false, authenticated: false, balance: '0.00'
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stateVersion, setStateVersion] = useState(1);
  const [step, setStep] = useState(0);
  const [agentHighlight, setAgentHighlight] = useState(false);
  const [serviceHighlight, setServiceHighlight] = useState(false);

  const logIdRef = useRef(0);

  const timestamp = () => new Date().toLocaleTimeString('en-US', { hour12: false });

  const addLog = useCallback((
    target: 'agent' | 'service' | 'protocol',
    message: string,
    type: LogEntry['type'] = 'info'
  ) => {
    const entry: LogEntry = {
      id: logIdRef.current++,
      timestamp: timestamp(),
      message,
      type
    };
    if (target === 'agent') setAgentLogs(prev => [...prev, entry]);
    else if (target === 'service') setServiceLogs(prev => [...prev, entry]);
    else setProtocolLogs(prev => [...prev, entry]);
  }, []);

  const initWallets = useCallback(async () => {
    addLog('protocol', 'Initializing wallets...', 'info');

    const agentKey = generatePrivateKey();
    const serviceKey = generatePrivateKey();
    const agentSessionKey = generatePrivateKey();
    const serviceSessionKey = generatePrivateKey();

    const agentAccount = privateKeyToAccount(agentKey);
    const serviceAccount = privateKeyToAccount(serviceKey);
    const agentSession = privateKeyToAccount(agentSessionKey);
    const serviceSession = privateKeyToAccount(serviceSessionKey);

    setAgent(prev => ({
      ...prev,
      privateKey: agentKey,
      address: agentAccount.address,
      sessionKey: agentSession.address,
    }));

    setService(prev => ({
      ...prev,
      privateKey: serviceKey,
      address: serviceAccount.address,
      sessionKey: serviceSession.address,
    }));

    addLog('agent', `Address: ${agentAccount.address}`, 'success');
    addLog('service', `Address: ${serviceAccount.address}`, 'success');
    addLog('protocol', 'Wallets generated', 'success');
    setStep(1);
  }, [addLog]);

  const fundWallets = useCallback(async () => {
    if (!agent.address || !service.address) return;

    addLog('protocol', 'Requesting faucet funds...', 'info');

    try {
      const [agentRes, serviceRes] = await Promise.all([
        fetch(FAUCET_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress: agent.address })
        }),
        fetch(FAUCET_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress: service.address })
        })
      ]);

      addLog('agent', `Faucet: ${agentRes.ok ? 'funded' : 'error'}`, agentRes.ok ? 'success' : 'error');
      addLog('service', `Faucet: ${serviceRes.ok ? 'funded' : 'error'}`, serviceRes.ok ? 'success' : 'error');
      addLog('protocol', 'Faucet requests complete', 'success');
      setStep(2);
    } catch (err) {
      addLog('protocol', `Faucet error: ${err}`, 'error');
    }
  }, [agent.address, service.address, addLog]);

  const connectWallet = useCallback(async (
    wallet: 'agent' | 'service',
    privateKey: Hex,
    address: Address,
    sessionKeyAddress: Address
  ): Promise<{ ws: WebSocket; signer: MessageSigner; eip712Signer: any } | null> => {
    return new Promise((resolve) => {
      const ws = new WebSocket(CLEARNODE_WS);
      const account = privateKeyToAccount(privateKey);
      const walletClient = createWalletClient({
        chain: baseSepolia,
        account,
        transport: http()
      });

      const expiresAt = BigInt(Math.floor(Date.now() / 1000) + 3600);

      const authParams = {
        scope: 'console',
        session_key: sessionKeyAddress,
        expires_at: expiresAt,
        allowances: [] as { asset: string; amount: string }[],
      };

      const eip712Signer = createEIP712AuthMessageSigner(
        walletClient as any,
        authParams,
        { name: 'agentpay-demo' }
      );

      const ecdsaSigner = createECDSAMessageSigner(privateKey);

      ws.onopen = async () => {
        addLog(wallet, 'WebSocket connected', 'info');
        try {
          const authReq = await createAuthRequestMessage({
            address: address,
            session_key: sessionKeyAddress,
            application: 'agentpay-demo',
            expires_at: expiresAt,
            scope: 'console',
            allowances: [],
          });
          ws.send(authReq);
          addLog(wallet, 'auth_request sent', 'dim');
        } catch (err) {
          addLog(wallet, `Auth error: ${err}`, 'error');
        }
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data as string);
          const method = msg.res?.[1] || msg.req?.[1];

          addLog('protocol', `[${wallet.toUpperCase()}] ${method}: ${JSON.stringify(msg).slice(0, 80)}...`, 'tx');

          if (method === 'auth_challenge') {
            const challengeData = msg.res?.[2];
            const challenge = challengeData?.challenge_message;
            addLog(wallet, 'Received challenge, signing...', 'info');
            const verifyMsg = await createAuthVerifyMessageFromChallenge(eip712Signer, challenge);
            ws.send(verifyMsg);
            addLog(wallet, 'auth_verify sent', 'dim');
          }

          if (method === 'auth_verify' || method === 'auth_success') {
            addLog(wallet, 'Authenticated!', 'success');
            if (wallet === 'agent') {
              setAgent(prev => ({ ...prev, ws, signer: ecdsaSigner, eip712Signer, connected: true, authenticated: true }));
            } else {
              setService(prev => ({ ...prev, ws, signer: ecdsaSigner, eip712Signer, connected: true, authenticated: true }));
            }
            resolve({ ws, signer: ecdsaSigner, eip712Signer });
          }
        } catch (e) {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        addLog(wallet, 'WebSocket error', 'error');
        resolve(null);
      };

      ws.onclose = () => {
        addLog(wallet, 'WebSocket closed', 'warning');
        if (wallet === 'agent') {
          setAgent(prev => ({ ...prev, connected: false, authenticated: false }));
        } else {
          setService(prev => ({ ...prev, connected: false, authenticated: false }));
        }
      };
    });
  }, [addLog]);

  const connectBoth = useCallback(async () => {
    if (!agent.privateKey || !agent.address || !agent.sessionKey ||
        !service.privateKey || !service.address || !service.sessionKey) return;

    addLog('protocol', 'Connecting to ClearNode...', 'info');

    const [agentConn, serviceConn] = await Promise.all([
      connectWallet('agent', agent.privateKey, agent.address, agent.sessionKey),
      connectWallet('service', service.privateKey, service.address, service.sessionKey)
    ]);

    if (agentConn && serviceConn) {
      addLog('protocol', 'Both wallets authenticated', 'success');

      setTimeout(async () => {
        await fetchBalances(agentConn.ws, agentConn.signer, agent.address!, 'agent');
        await fetchBalances(serviceConn.ws, serviceConn.signer, service.address!, 'service');
      }, 1000);

      setStep(3);
    }
  }, [agent, service, connectWallet, addLog]);

  const fetchBalances = async (ws: WebSocket, signer: MessageSigner, address: Address, wallet: 'agent' | 'service') => {
    const msg = await createGetLedgerBalancesMessage(signer, address);

    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.res?.[1] === 'get_ledger_balances') {
          const balances = data.res[2]?.ledger_balances || data.res[2]?.balances || [];
          const usdBal = balances.find((b: any) => b.asset === 'ytest.usd');
          const amount = usdBal ? (Number(usdBal.amount) / 1e6).toFixed(2) : '0.00';

          if (wallet === 'agent') {
            setAgent(prev => ({ ...prev, balance: amount }));
          } else {
            setService(prev => ({ ...prev, balance: amount }));
          }
          addLog(wallet, `Balance: ${amount} USDC`, 'success');
          ws.removeEventListener('message', handler);
        }
      } catch (e) {}
    };

    ws.addEventListener('message', handler);
    ws.send(msg);
  };

  const openSession = useCallback(async () => {
    if (!agent.ws || !agent.signer || !agent.address || !service.address) return;

    addLog('protocol', 'Opening payment channel...', 'info');
    addLog('agent', 'Creating app session...', 'info');

    const definition = {
      application: 'agentpay-demo',
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      participants: [agent.address, service.address],
      weights: [1, 1],
      quorum: 1,
      challenge: 3600,
      nonce: Date.now(),
    };

    const allocations = [
      { asset: 'ytest.usd', amount: '1000000', participant: agent.address },  // 1 USDC
      { asset: 'ytest.usd', amount: '0', participant: service.address },
    ];

    const handler = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.res?.[1] === 'create_app_session') {
          const newSessionId = msg.res[2]?.app_session_id;
          if (newSessionId) {
            setSessionId(newSessionId);
            addLog('agent', `Session ID: ${newSessionId.slice(0, 18)}...`, 'success');
            addLog('protocol', 'Channel opened!', 'success');
            setStep(4);
            agent.ws?.removeEventListener('message', handler);
          }
        }
        if (msg.res?.[1] === 'error') {
          addLog('protocol', `Error: ${msg.res[2]?.message || 'unknown'}`, 'error');
        }
      } catch (e) {}
    };

    agent.ws.addEventListener('message', handler);
    const msg = await createAppSessionMessage(agent.signer, { definition, allocations });
    agent.ws.send(msg);
  }, [agent, service.address, addLog]);

  const sendMicropay = useCallback(async () => {
    if (!agent.ws || !agent.signer || !agent.address || !service.address || !sessionId) return;

    // Check WebSocket is still open
    if (agent.ws.readyState !== WebSocket.OPEN) {
      addLog('protocol', 'WebSocket disconnected - reconnect required', 'error');
      addLog('agent', 'Connection lost', 'error');
      return;
    }

    addLog('protocol', 'Sending micropayment...', 'info');
    addLog('agent', 'Submitting state update...', 'info');

    const currentAgentBal = 1000000 - ((stateVersion - 1) * 10000);  // Started with 1 USDC
    const currentServiceBal = (stateVersion - 1) * 10000;
    const payAmount = 10000;  // 0.01 USDC per micropayment

    if (currentAgentBal < payAmount) {
      addLog('protocol', 'Channel depleted - close and reopen to continue', 'warning');
      addLog('agent', 'Insufficient channel balance', 'error');
      return;
    }

    const allocations = [
      { asset: 'ytest.usd', amount: String(currentAgentBal - payAmount), participant: agent.address },
      { asset: 'ytest.usd', amount: String(currentServiceBal + payAmount), participant: service.address },
    ];

    const nextVersion = stateVersion + 1;
    let handled = false;

    const cleanup = () => {
      if (!handled) {
        handled = true;
        agent.ws?.removeEventListener('message', handler);
      }
    };

    const timeout = setTimeout(() => {
      if (!handled) {
        addLog('protocol', 'Micropayment timeout - retrying may help', 'warning');
        cleanup();
      }
    }, 10000);

    const handler = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.res?.[1] === 'submit_app_state' && !handled) {
          clearTimeout(timeout);
          cleanup();

          const version = msg.res[2]?.version;
          addLog('agent', `State v${version} confirmed`, 'success');
          addLog('protocol', 'Micropayment complete!', 'success');

          setStateVersion(nextVersion);

          setAgent(prev => {
            const newBal = (parseFloat(prev.balance) - 0.01).toFixed(2);
            return { ...prev, balance: newBal };
          });
          setService(prev => {
            const newBal = (parseFloat(prev.balance) + 0.01).toFixed(2);
            return { ...prev, balance: newBal };
          });

          setAgentHighlight(true);
          setServiceHighlight(true);
          setTimeout(() => {
            setAgentHighlight(false);
            setServiceHighlight(false);
          }, 600);
        }
        if (msg.res?.[1] === 'error' && !handled) {
          clearTimeout(timeout);
          cleanup();
          addLog('protocol', `Error: ${msg.res[2]?.message || msg.res[2]?.error || 'unknown'}`, 'error');
        }
      } catch (e) {}
    };

    agent.ws.addEventListener('message', handler);

    try {
      const msg = await createSubmitAppStateMessage(agent.signer, {
        app_session_id: sessionId as `0x${string}`,
        intent: RPCAppStateIntent.Operate,
        version: nextVersion,
        allocations,
      });
      agent.ws.send(msg);
    } catch (err) {
      clearTimeout(timeout);
      cleanup();
      addLog('protocol', `Send error: ${err}`, 'error');
    }
  }, [agent, service.address, sessionId, stateVersion, addLog]);

  useEffect(() => {
    initWallets();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AgentPay</h1>
        <p className="text-gray-400">Real-time Micropayments via Yellow Network State Channels</p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <BalanceCard
            label="Agent Wallet"
            balance={agent.balance}
            address={agent.address}
            connected={agent.authenticated}
            highlight={agentHighlight}
          />
          <Terminal logs={agentLogs} title="agent.log" />
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-center">Demo Controls</h2>
            <div className="space-y-3">
              <button
                onClick={fundWallets}
                disabled={step < 1 || step > 1}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg font-medium"
              >
                1. Fund Wallets
              </button>
              <button
                onClick={connectBoth}
                disabled={step < 2 || step > 2}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg font-medium"
              >
                2. Connect to ClearNode
              </button>
              <button
                onClick={openSession}
                disabled={step < 3 || step > 3}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg font-medium"
              >
                3. Open Channel
              </button>
              <button
                onClick={sendMicropay}
                disabled={step < 4}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg font-medium"
              >
                4. Send Micropayment
              </button>
            </div>

            {sessionId && (
              <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Session ID</div>
                <div className="font-mono text-xs text-green-400 break-all">
                  {sessionId}
                </div>
              </div>
            )}
          </div>

          <Terminal logs={protocolLogs} title="protocol.log" />
        </div>

        <div className="space-y-4">
          <BalanceCard
            label="Service Wallet"
            balance={service.balance}
            address={service.address}
            connected={service.authenticated}
            highlight={serviceHighlight}
          />
          <Terminal logs={serviceLogs} title="service.log" />
        </div>
      </div>

      <footer className="text-center mt-8 text-gray-500 text-sm">
        Built for HackMoney 2026 | Yellow Network + Circle + ENS
      </footer>
    </div>
  );
}

export default Demo;
