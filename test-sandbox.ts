import "dotenv/config";
import type { Hex, Address } from "viem";
import {
  connectToClearNode,
  requestFaucetFunds,
  getLedgerBalances,
  getChannels,
  openChannel,
  micropay,
  closeChannel,
  disconnect,
} from "./src/lib/nitrolite.js";

const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY as Hex;
const WALLET_ADDRESS = "0x66d71a8612Fbf6ab69340Bf82aB431e1Ad30b5c3" as Address;

// Use ClearNode's address as counterparty for sandbox testing
// This simulates a service provider
const CLEARNODE_ADDRESS = "0x0000000000000000000000000000000000000001" as Address;

async function test() {
  console.log("=== Yellow Sandbox Integration Test ===\n");

  if (!PRIVATE_KEY) {
    console.error("ERROR: AGENT_PRIVATE_KEY not set");
    process.exit(1);
  }

  // Step 1: Request faucet funds
  console.log("1. Requesting faucet funds...");
  const faucetResult = await requestFaucetFunds(WALLET_ADDRESS);
  if (faucetResult.success) {
    console.log("   Faucet request sent");
  } else {
    console.log("   Faucet error:", faucetResult.error);
  }

  // Step 2: Connect to ClearNode
  console.log("\n2. Connecting to ClearNode sandbox...");
  let connection;
  try {
    connection = await connectToClearNode(PRIVATE_KEY);
    console.log("   Connected, address:", connection.address);
    console.log("   Authenticated:", connection.authenticated);
  } catch (err) {
    console.error("   Connection failed:", err);
    process.exit(1);
  }

  // Step 3: Check ledger balance
  console.log("\n3. Checking Unified Balance...");
  try {
    const balances = await getLedgerBalances(connection);
    console.log("   Balances:", JSON.stringify(balances, null, 2));
    if (balances.length === 0) {
      console.log("   (empty - faucet may take a moment)");
    }
  } catch (err) {
    console.error("   Get balances failed:", err);
  }

  // Step 4: List existing channels
  console.log("\n4. Listing existing app sessions...");
  try {
    const channels = await getChannels(connection);
    console.log("   Found", channels.length, "sessions");
    if (channels.length > 0) {
      console.log("   Sessions:", JSON.stringify(channels, null, 2));
    }
  } catch (err) {
    console.error("   Get sessions failed:", err);
  }

  // Step 5: Open an app session (peer-to-peer channel)
  console.log("\n5. Opening app session with counterparty...");
  console.log("   Counterparty:", CLEARNODE_ADDRESS);
  console.log("   Deposit: 500000 (0.5 USDC)");

  let session;
  try {
    const result = await openChannel(connection, CLEARNODE_ADDRESS, "500000");
    if (result.success) {
      session = result.session;
      console.log("   Session opened!");
      console.log("   Session ID:", session.appSessionId);
      console.log("   Version:", session.version);
      console.log("   My allocation:", session.myAllocation);
    } else {
      console.log("   Open failed:", result.error);
    }
  } catch (err) {
    console.error("   Open error:", err);
  }

  // Step 6: Send micropayments
  if (session) {
    console.log("\n6. Sending 3 micropayments of 1000 units each...");
    for (let i = 1; i <= 3; i++) {
      try {
        const result = await micropay(connection, session, "1000");
        if (result.success) {
          session = result.session;
          console.log(`   Payment ${i}: v=${session.version}, balance=${session.myAllocation}`);
        } else {
          console.log(`   Payment ${i} failed:`, result.error);
          break;
        }
      } catch (err) {
        console.error(`   Payment ${i} error:`, err);
        break;
      }
    }

    // Step 7: Close the session
    console.log("\n7. Closing session...");
    try {
      const result = await closeChannel(connection, session);
      if (result.success) {
        console.log("   Session closed!");
        console.log("   Final my balance:", result.finalAllocations.my);
        console.log("   Final their balance:", result.finalAllocations.theirs);
      } else {
        console.log("   Close failed:", result.error);
      }
    } catch (err) {
      console.error("   Close error:", err);
    }
  }

  // Cleanup
  console.log("\n8. Disconnecting...");
  disconnect(connection);
  console.log("   Done");

  console.log("\n=== Test Complete ===");
}

test().catch(console.error);
