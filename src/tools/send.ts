import "dotenv/config";
import type { Hex, Address } from "viem";
import { createPublicClient, http } from "viem";
import { normalize } from "viem/ens";
import { mainnet } from "viem/chains";
import { sendUsdcWithPaymaster, getSmartAccountAddress } from "../lib/paymaster.js";

const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY as Hex;

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

async function resolveAddress(input: string): Promise<{ address: Address; ensName?: string } | { error: string }> {
  if (input.startsWith("0x") && input.length === 42) {
    return { address: input as Address };
  }

  if (input.endsWith(".eth")) {
    try {
      const address = await mainnetClient.getEnsAddress({ name: normalize(input) });
      if (!address) {
        return { error: `ENS name "${input}" does not resolve to an address` };
      }
      return { address, ensName: input };
    } catch {
      return { error: `Failed to resolve ENS name "${input}"` };
    }
  }

  return { error: `Invalid address or ENS name: "${input}"` };
}

export async function handleSend(to: string, amount: string, chain: string) {
  if (!PRIVATE_KEY) {
    return {
      content: [{ type: "text" as const, text: "Error: AGENT_PRIVATE_KEY not configured" }],
      isError: true,
    };
  }

  const resolved = await resolveAddress(to);
  if ("error" in resolved) {
    return {
      content: [{ type: "text" as const, text: `Error: ${resolved.error}` }],
      isError: true,
    };
  }

  const { address: toAddress, ensName } = resolved;

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return {
      content: [{ type: "text" as const, text: `Error: Invalid amount "${amount}"` }],
      isError: true,
    };
  }

  try {
    const result = await sendUsdcWithPaymaster(PRIVATE_KEY, toAddress, amount);

    if (!result.success) {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            status: "failed",
            error: result.error,
            smartAccount: result.scaAddress,
          }, null, 2),
        }],
        isError: true,
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          status: "success",
          txHash: result.txHash,
          smartAccount: result.scaAddress,
          to: toAddress,
          ...(ensName && { ensName }),
          amount: `${amount} USDC`,
          gasPayment: "USDC (via Circle Paymaster)",
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
