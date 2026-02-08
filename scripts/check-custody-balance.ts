import "dotenv/config";
import type { Hex } from "viem";
import { createNitroliteClient } from "../src/lib/nitrolite.js";

const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY as Hex;
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

async function main() {
  const client = await createNitroliteClient(PRIVATE_KEY);

  console.log("Checking custody contract balance...");

  const balance = await client.getAccountBalance(
    "0x66d71a8612Fbf6ab69340Bf82aB431e1Ad30b5c3",
    USDC_BASE_SEPOLIA as any
  );

  console.log("Custody balance:", Number(balance) / 1e6, "USDC");
}

main().catch(console.error);
