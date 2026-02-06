import { createPublicClient, http, formatUnits, type Hex } from "viem";
import { getChains, GATEWAY_API, type NetworkMode } from "./config.js";

const ERC20_ABI = [
  { name: "balanceOf", type: "function", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
] as const;

export interface BalanceResult {
  address: Hex;
  network: NetworkMode;
  wallet: { total: string; chains: Record<string, string> };
  gateway: { total: string; chains: Record<string, string> };
}

async function getWalletBalances(address: Hex, network: NetworkMode): Promise<{ total: string; chains: Record<string, string> }> {
  const chains = getChains(network);
  const results: Record<string, string> = {};
  let total = 0;

  await Promise.all(
    chains.map(async ({ chain, usdc }) => {
      try {
        const client = createPublicClient({ chain, transport: http() });
        const balance = await client.readContract({ address: usdc, abi: ERC20_ABI, functionName: "balanceOf", args: [address] });
        const formatted = parseFloat(formatUnits(balance, 6));
        results[chain.name] = formatted.toFixed(2);
        total += formatted;
      } catch {
        results[chain.name] = "error";
      }
    })
  );

  return { total: total.toFixed(2), chains: results };
}

async function getGatewayBalances(address: Hex, network: NetworkMode): Promise<{ total: string; chains: Record<string, string> }> {
  const chains = getChains(network);
  const apiUrl = GATEWAY_API[network];

  const sources = chains.map((c) => ({ domain: c.domain, depositor: address }));

  const response = await fetch(`${apiUrl}/balances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "USDC", sources }),
  });

  if (!response.ok) {
    throw new Error(`Gateway API error: ${response.status}`);
  }

  const data = await response.json();
  const results: Record<string, string> = {};
  let total = 0;

  for (const bal of data.balances) {
    const chainConfig = chains.find((c) => c.domain === bal.domain);
    const name = chainConfig?.chain.name ?? `domain-${bal.domain}`;
    const value = parseFloat(bal.balance);
    results[name] = value.toFixed(2);
    total += value;
  }

  return { total: total.toFixed(2), chains: results };
}

export async function getAllBalances(address: Hex, network: NetworkMode): Promise<BalanceResult> {
  const [wallet, gateway] = await Promise.all([
    getWalletBalances(address, network),
    getGatewayBalances(address, network),
  ]);

  return { address, network, wallet, gateway };
}
