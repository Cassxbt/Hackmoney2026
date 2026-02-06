import "dotenv/config";
import type { Hex } from "viem";
import { sendUsdcWithPaymaster } from "../src/lib/paymaster.js";

async function main() {
  const privateKey = process.env.AGENT_PRIVATE_KEY as Hex;
  if (!privateKey) throw new Error("AGENT_PRIVATE_KEY not set");

  // Send 0.01 USDC back to the EOA as a test
  const recipient = "0x66d71a8612Fbf6ab69340Bf82aB431e1Ad30b5c3" as Hex;
  const amount = "0.01";

  console.log(`Sending ${amount} USDC to ${recipient} via Circle Paymaster...`);
  console.log("Gas will be paid in USDC (not ETH)");

  const result = await sendUsdcWithPaymaster(privateKey, recipient, amount);

  if (result.success) {
    console.log("\n✅ SUCCESS");
    console.log(`TX Hash: ${result.txHash}`);
    console.log(`Smart Account: ${result.scaAddress}`);
    console.log(`\nView on BaseScan: https://sepolia.basescan.org/tx/${result.txHash}`);
  } else {
    console.log("\n❌ FAILED");
    console.log(`Error: ${result.error}`);
    console.log(`Smart Account: ${result.scaAddress}`);
  }
}

main().catch(console.error);
