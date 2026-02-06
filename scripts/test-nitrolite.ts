import "dotenv/config";
import type { Hex } from "viem";
import { connectToClearNode, getChannels, disconnect, createNitroliteClient } from "../src/lib/nitrolite.js";

async function main() {
  const privateKey = process.env.AGENT_PRIVATE_KEY as Hex;
  if (!privateKey) throw new Error("AGENT_PRIVATE_KEY not set");

  console.log("Creating Nitrolite client...");
  const client = await createNitroliteClient(privateKey);
  console.log("Nitrolite client created");

  console.log("\nConnecting to ClearNode...");
  try {
    const connection = await connectToClearNode(privateKey);
    console.log("Connected and authenticated to ClearNode");
    console.log(`Address: ${connection.address}`);

    console.log("\nFetching channels...");
    const channels = await getChannels(connection);

    if (channels.length === 0) {
      console.log("No channels found. This is expected for a new account.");
    } else {
      console.log(`Found ${channels.length} channel(s):`);
      channels.forEach((ch, i) => {
        console.log(`  ${i + 1}. ID: ${ch.channelId}`);
        console.log(`     Status: ${ch.status}`);
        console.log(`     Balance: ${ch.balance}`);
      });
    }

    disconnect(connection);
    console.log("\nDisconnected from ClearNode");
  } catch (err) {
    console.error("Error:", err);
  }
}

main().catch(console.error);
