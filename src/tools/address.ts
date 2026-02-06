import "dotenv/config";
import type { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getSmartAccountAddress } from "../lib/paymaster.js";

const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY as Hex;

export async function handleGetAddress() {
  if (!PRIVATE_KEY) {
    return {
      content: [{ type: "text" as const, text: "Error: AGENT_PRIVATE_KEY not configured" }],
      isError: true,
    };
  }

  try {
    const account = privateKeyToAccount(PRIVATE_KEY);
    const scaAddress = await getSmartAccountAddress(PRIVATE_KEY);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          eoa: account.address,
          smartAccount: scaAddress,
          note: "Use smartAccount for receiving USDC payments",
        }, null, 2),
      }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error: ${message}` }],
      isError: true,
    };
  }
}
