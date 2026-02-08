import "dotenv/config";
import type { Hex, Address } from "viem";
import {
  connectToClearNode,
  openChannel,
  micropay,
  closeChannel,
  getChannels,
  getLedgerBalances,
  disconnect,
} from "./src/lib/nitrolite.js";

const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY as Hex;
const TEST_COUNTERPARTY = "0x0000000000000000000000000000000000000001" as Address;

async function test() {
  console.log("=== Yellow Nitrolite Integration Test ===\n");

  if (!PRIVATE_KEY) {
    console.error("ERROR: AGENT_PRIVATE_KEY not set");
    process.exit(1);
  }

  // Step 1: Connect
  console.log("1. Connecting to ClearNode...");
  let connection;
  try {
    connection = await connectToClearNode(PRIVATE_KEY);
    console.log("   ✅ Connected, address:", connection.address);
    console.log("   ✅ Authenticated:", connection.authenticated);
  } catch (err) {
    console.error("   ❌ Connection failed:", err);
    process.exit(1);
  }

  // Step 2: Check ledger balance
  console.log("\n2. Checking ClearNode ledger balance...");
  try {
    const balances = await getLedgerBalances(connection);
    console.log("   ✅ Ledger balances:", balances.length > 0 ? JSON.stringify(balances) : "(empty - need to deposit USDC to ClearNode)");
  } catch (err) {
    console.error("   ❌ Get ledger balances failed:", err);
  }

  // Step 3: List existing channels
  console.log("\n3. Querying existing channels...");
  try {
    const channels = await getChannels(connection);
    console.log("   ✅ Found", channels.length, "channels");
    if (channels.length > 0) {
      console.log("   Channels:", JSON.stringify(channels, null, 2));
    }
  } catch (err) {
    console.error("   ❌ Get channels failed:", err);
  }

  // Step 4: Open channel
  console.log("\n4. Opening channel with test counterparty...");
  console.log("   Note: Using 500000 wei (0.5 USDC)");
  const depositAmount = "500000"; // 0.5 USDC
  let session;
  try {
    const result = await openChannel(connection, TEST_COUNTERPARTY, depositAmount);
    if (result.success) {
      session = result.session;
      console.log("   ✅ Channel opened!");
      console.log("   Session ID:", session.appSessionId);
      console.log("   Version:", session.version);
      console.log("   My allocation:", session.myAllocation, "(wei)");
    } else {
      console.log("   ❌ Open failed:", result.error);
    }
  } catch (err) {
    console.error("   ❌ Open channel error:", err);
  }

  // Step 5: Send micropayments (only if channel opened)
  if (session) {
    console.log("\n5. Sending 3 micropayments...");
    const microAmount = "1000"; // 0.001 USDC

    for (let i = 1; i <= 3; i++) {
      try {
        const result = await micropay(connection, session, microAmount);
        if (result.success) {
          session = result.session;
          console.log(`   ✅ Micropayment ${i}: version=${session.version}, remaining=${session.myAllocation}`);
        } else {
          console.log(`   ❌ Micropayment ${i} failed:`, result.error);
          break;
        }
      } catch (err) {
        console.error(`   ❌ Micropayment ${i} error:`, err);
        break;
      }
    }

    // Step 6: Close channel
    console.log("\n6. Closing channel...");
    try {
      const result = await closeChannel(connection, session);
      if (result.success) {
        console.log("   ✅ Channel closed!");
        console.log("   Final my balance:", result.finalAllocations.my);
        console.log("   Final their balance:", result.finalAllocations.theirs);
      } else {
        console.log("   ❌ Close failed:", result.error);
      }
    } catch (err) {
      console.error("   ❌ Close channel error:", err);
    }
  }

  // Cleanup
  console.log("\n7. Disconnecting...");
  disconnect(connection);
  console.log("   ✅ Done");

  console.log("\n=== Test Complete ===");
}

test().catch(console.error);
