import { createPublicClient, http, formatUnits, type Hex } from "viem";
import { baseSepolia, sepolia, avalancheFuji } from "viem/chains";

const ADDRESS = "0x66d71a8612Fbf6ab69340Bf82aB431e1Ad30b5c3" as Hex;
const GATEWAY_API = "https://gateway-api-testnet.circle.com/v1";

const CHAINS = [
  { chain: baseSepolia, usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Hex, domain: 6 },
  { chain: sepolia, usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as Hex, domain: 0 },
  { chain: avalancheFuji, usdc: "0x5425890298aed601595a70AB815c96711a31Bc65" as Hex, domain: 1 },
];

const ERC20_ABI = [{ name: "balanceOf", type: "function", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" }] as const;

async function main() {
  console.log("=== Wallet Balances ===");
  for (const { chain, usdc } of CHAINS) {
    const client = createPublicClient({ chain, transport: http() });
    const balance = await client.readContract({ address: usdc, abi: ERC20_ABI, functionName: "balanceOf", args: [ADDRESS] });
    console.log(`${chain.name}: ${formatUnits(balance, 6)} USDC`);
  }

  console.log("\n=== Gateway Balances ===");
  const sources = CHAINS.map((c) => ({ domain: c.domain, depositor: ADDRESS }));
  const res = await fetch(`${GATEWAY_API}/balances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "USDC", sources }),
  });
  const data = await res.json();
  for (const bal of data.balances) {
    const chain = CHAINS.find((c) => c.domain === bal.domain);
    console.log(`${chain?.chain.name ?? bal.domain}: ${bal.balance} USDC`);
  }
}

main().catch(console.error);
