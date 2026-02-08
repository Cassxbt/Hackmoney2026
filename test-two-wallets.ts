import "dotenv/config";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import type { Hex, Address } from "viem";
import {
  connectToClearNode,
  requestFaucetFunds,
  getLedgerBalances,
  disconnect,
  type NitroliteConnection,
} from "./src/lib/nitrolite.js";
import {
  createAppSessionMessage,
  createSubmitAppStateMessage,
  createECDSAMessageSigner,
  RPCProtocolVersion,
  RPCAppStateIntent,
} from "@erc7824/nitrolite";

// Agent wallet (from env)
const AGENT_KEY = process.env.AGENT_PRIVATE_KEY as Hex;

// Service provider wallet (generate fresh)
const SERVICE_KEY = generatePrivateKey();
const serviceAccount = privateKeyToAccount(SERVICE_KEY);

console.log("=== Two-Wallet Micropayment Demo ===\n");
console.log("Agent Key: from .env");
console.log("Service Address:", serviceAccount.address);
console.log("Service Key:", SERVICE_KEY.slice(0, 20) + "...");

async function fundBothWallets() {
  console.log("\n1. Funding both wallets via faucet...");

  const agentAccount = privateKeyToAccount(AGENT_KEY);

  const [agentFaucet, serviceFaucet] = await Promise.all([
    requestFaucetFunds(agentAccount.address),
    requestFaucetFunds(serviceAccount.address),
  ]);

  console.log("   Agent faucet:", agentFaucet.success ? "OK" : agentFaucet.error);
  console.log("   Service faucet:", serviceFaucet.success ? "OK" : serviceFaucet.error);
}

async function connectBothWallets(): Promise<{ agent: NitroliteConnection; service: NitroliteConnection }> {
  console.log("\n2. Connecting both wallets to ClearNode...");

  const [agent, service] = await Promise.all([
    connectToClearNode(AGENT_KEY),
    connectToClearNode(SERVICE_KEY),
  ]);

  console.log("   Agent connected:", agent.authenticated);
  console.log("   Service connected:", service.authenticated);

  return { agent, service };
}

async function checkBalances(agent: NitroliteConnection, service: NitroliteConnection) {
  console.log("\n3. Checking Unified Balances...");

  const [agentBal, serviceBal] = await Promise.all([
    getLedgerBalances(agent),
    getLedgerBalances(service),
  ]);

  const agentAmt = agentBal.find(b => b.asset === "ytest.usd")?.amount || "0";
  const serviceAmt = serviceBal.find(b => b.asset === "ytest.usd")?.amount || "0";

  console.log("   Agent balance:", Number(agentAmt) / 1e6, "USDC");
  console.log("   Service balance:", Number(serviceAmt) / 1e6, "USDC");

  return { agentAmt, serviceAmt };
}

async function main() {
  if (!AGENT_KEY) {
    console.error("ERROR: AGENT_PRIVATE_KEY not set");
    process.exit(1);
  }

  // Step 1: Fund both wallets
  await fundBothWallets();

  // Small delay for faucet to process
  await new Promise(r => setTimeout(r, 2000));

  // Step 2: Connect both wallets
  const { agent, service } = await connectBothWallets();

  // Step 3: Check balances
  await checkBalances(agent, service);

  // Step 4: Agent opens session with Service
  console.log("\n4. Agent opening session with Service...");
  console.log("   Service address:", serviceAccount.address);

  // We need to implement proper two-party session handling
  // For now, let's test if both wallets can see each other's activity

  // The key insight: ClearNode routes messages between participants
  // When Agent creates session with Service's address, Service should receive notification

  // This requires message handlers on both sides
  await testSessionCreation(agent, service, serviceAccount.address);

  // Cleanup
  console.log("\n7. Disconnecting...");
  disconnect(agent);
  disconnect(service);
  console.log("   Done");
}

async function testSessionCreation(
  agent: NitroliteConnection,
  service: NitroliteConnection,
  serviceAddress: Address
) {
  return new Promise<void>((resolve) => {
    let sessionId: string | null = null;
    let sessionCreated = false;

    const timeout = setTimeout(() => {
      console.log("   Timeout reached");
      resolve();
    }, 30000);

    // Service listens for ALL incoming messages
    service.ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const method = msg.res?.[1] || msg.req?.[1];

        // Log ALL messages Service receives
        console.log("   [Service RX]", method || "unknown", JSON.stringify(msg).slice(0, 150));

        if (method === "create_app_session" || method === "app_session_created") {
          console.log("   >>> Service received session notification!");
        }

        if (method === "submit_app_state" || method === "app_state") {
          console.log("   >>> Service received state update request!");
          // Service needs to co-sign here
          const stateData = msg.res?.[2] || msg.req?.[2];
          if (stateData) {
            console.log("   >>> State data:", JSON.stringify(stateData).slice(0, 200));
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    });

    // Agent creates session
    const definition = {
      application: "agentpay",
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      participants: [agent.address, serviceAddress],
      weights: [1, 1],
      quorum: 1,  // EXPERIMENT 2: single-signer mode
      challenge: 3600,
      nonce: Date.now(),
    };

    const allocations = [
      { asset: "ytest.usd", amount: "100000", participant: agent.address },
      { asset: "ytest.usd", amount: "0", participant: serviceAddress },
    ];

    // Agent's message handler
    agent.ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const method = msg.res?.[1];

        if (method === "create_app_session") {
          sessionId = msg.res?.[2]?.app_session_id;
          console.log("   Agent: Session created!");
          console.log("   Session ID:", sessionId);
          sessionCreated = true;

          // Try a micropayment
          setTimeout(() => {
            if (sessionId) {
              console.log("\n5. Agent sending micropayment...");
              testMicropay(agent, service, sessionId, serviceAddress);
            }
          }, 2000);
        }

        if (method === "submit_app_state") {
          console.log("   Agent: State update confirmed!");
          console.log("   Version:", msg.res?.[2]?.version);
          clearTimeout(timeout);
          setTimeout(resolve, 3000);
        }

        if (method === "error") {
          console.log("   Agent error:", msg.res?.[2]?.error || msg.res?.[2]?.message);
        }
      } catch (e) {
        // ignore
      }
    });

    console.log("   Creating session...");
    createAppSessionMessage(agent.signer, { definition, allocations })
      .then((msg: string) => agent.ws.send(msg))
      .catch((err: Error) => console.error("   Send error:", err));
  });
}

async function testMicropay(
  agent: NitroliteConnection,
  service: NitroliteConnection,
  sessionId: string,
  serviceAddress: Address
) {
  const allocations = [
    { asset: "ytest.usd", amount: "99000", participant: agent.address },  // -1000
    { asset: "ytest.usd", amount: "1000", participant: serviceAddress },  // +1000
  ];

  createSubmitAppStateMessage(agent.signer, {
    app_session_id: sessionId as `0x${string}`,
    intent: RPCAppStateIntent.Operate,
    version: 2,
    allocations,
  })
    .then((msg: string) => {
      console.log("   Sending micropayment state update...");
      agent.ws.send(msg);
    })
    .catch((err: Error) => console.error("   Micropay error:", err));
}

main().catch(console.error);
