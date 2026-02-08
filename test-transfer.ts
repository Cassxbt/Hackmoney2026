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
import { createTransferMessage } from "@erc7824/nitrolite";

const AGENT_KEY = process.env.AGENT_PRIVATE_KEY as Hex;
const SERVICE_KEY = generatePrivateKey();
const serviceAccount = privateKeyToAccount(SERVICE_KEY);

console.log("=== Yellow Transfer Test (No App Session) ===\n");
console.log("Agent Key: from .env");
console.log("Service Address:", serviceAccount.address);

async function main() {
  if (!AGENT_KEY) {
    console.error("ERROR: AGENT_PRIVATE_KEY not set");
    process.exit(1);
  }

  const agentAccount = privateKeyToAccount(AGENT_KEY);

  // Fund both
  console.log("1. Funding wallets...");
  await Promise.all([
    requestFaucetFunds(agentAccount.address),
    requestFaucetFunds(serviceAccount.address),
  ]);

  await new Promise(r => setTimeout(r, 2000));

  // Connect both
  console.log("\n2. Connecting to ClearNode...");
  const [agent, service] = await Promise.all([
    connectToClearNode(AGENT_KEY),
    connectToClearNode(SERVICE_KEY),
  ]);
  console.log("   Agent:", agent.authenticated);
  console.log("   Service:", service.authenticated);

  // Check initial balances
  console.log("\n3. Initial balances...");
  const [agentBal1, serviceBal1] = await Promise.all([
    getLedgerBalances(agent),
    getLedgerBalances(service),
  ]);
  const agentAmt1 = Number(agentBal1.find(b => b.asset === "ytest.usd")?.amount || "0") / 1e6;
  const serviceAmt1 = Number(serviceBal1.find(b => b.asset === "ytest.usd")?.amount || "0") / 1e6;
  console.log("   Agent:", agentAmt1, "USDC");
  console.log("   Service:", serviceAmt1, "USDC");

  // Transfer using createTransferMessage
  console.log("\n4. Agent transferring 1 USDC to Service...");
  console.log("   Using createTransferMessage (direct Unified Balance transfer)");

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      console.log("   Transfer timeout");
      resolve();
    }, 15000);

    agent.ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const method = msg.res?.[1];
        console.log("   [Agent RX]", method, JSON.stringify(msg.res?.[2]).slice(0, 100));

        if (method === "transfer") {
          console.log("   Transfer confirmed!");
          clearTimeout(timeout);
          resolve();
        }
        if (method === "error") {
          console.log("   Transfer error:", msg.res?.[2]?.error);
          clearTimeout(timeout);
          resolve();
        }
      } catch (e) {}
    });

    createTransferMessage(agent.signer, {
      destination: serviceAccount.address as `0x${string}`,
      allocations: [{ asset: "ytest.usd", amount: "1000000" }], // 1 USDC
    })
      .then((msg) => {
        console.log("   Sending transfer...");
        agent.ws.send(msg);
      })
      .catch((err) => console.error("   Error:", err));
  });

  // Check final balances
  console.log("\n5. Final balances...");
  await new Promise(r => setTimeout(r, 2000));

  const [agentBal2, serviceBal2] = await Promise.all([
    getLedgerBalances(agent),
    getLedgerBalances(service),
  ]);
  const agentAmt2 = Number(agentBal2.find(b => b.asset === "ytest.usd")?.amount || "0") / 1e6;
  const serviceAmt2 = Number(serviceBal2.find(b => b.asset === "ytest.usd")?.amount || "0") / 1e6;
  console.log("   Agent:", agentAmt2, "USDC (was", agentAmt1, ")");
  console.log("   Service:", serviceAmt2, "USDC (was", serviceAmt1, ")");

  if (serviceAmt2 > serviceAmt1) {
    console.log("\n   SUCCESS! Service received", serviceAmt2 - serviceAmt1, "USDC");
  }

  // Cleanup
  console.log("\n6. Disconnecting...");
  disconnect(agent);
  disconnect(service);
  console.log("   Done");
}

main().catch(console.error);
