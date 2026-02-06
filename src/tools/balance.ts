import type { Hex } from "viem";
import { getAllBalances, type BalanceResult } from "../lib/balance.js";
import type { NetworkMode } from "../lib/config.js";

const AGENT_ADDRESS = (process.env.AGENT_ADDRESS ?? "0x66d71a8612Fbf6ab69340Bf82aB431e1Ad30b5c3") as Hex;
const NETWORK = (process.env.NETWORK ?? "testnet") as NetworkMode;

export async function handleBalance(): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  try {
    const balances: BalanceResult = await getAllBalances(AGENT_ADDRESS, NETWORK);
    return {
      content: [{ type: "text", text: JSON.stringify(balances, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
}
