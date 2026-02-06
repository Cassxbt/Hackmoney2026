import "dotenv/config";
import { handleBalance } from "../src/tools/balance.js";
import { handleSend } from "../src/tools/send.js";
import { handleGetAddress } from "../src/tools/address.js";

async function main() {
  console.log("=== Testing agentpay_address ===");
  const addr = await handleGetAddress();
  console.log(addr.content[0].text);

  console.log("\n=== Testing agentpay_balance ===");
  const bal = await handleBalance();
  console.log(bal.content[0].text);

  console.log("\n=== Tools OK ===");
}

main().catch(console.error);
