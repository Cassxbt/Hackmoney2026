import "dotenv/config";
import { createPublicClient, http, formatUnits, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { toCircleSmartAccount } from "@circle-fin/modular-wallets-core";

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Hex;
const ERC20_ABI = [{ name: "balanceOf", type: "function", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" }] as const;

async function main() {
  const privateKey = process.env.AGENT_PRIVATE_KEY as Hex;
  if (!privateKey) throw new Error("AGENT_PRIVATE_KEY not set");

  const owner = privateKeyToAccount(privateKey);
  console.log("EOA Address:", owner.address);

  const client = createPublicClient({ chain: baseSepolia, transport: http() });
  const account = await toCircleSmartAccount({ client, owner });
  console.log("Smart Account Address:", account.address);

  const eoaBalance = await client.readContract({ address: USDC_ADDRESS, abi: ERC20_ABI, functionName: "balanceOf", args: [owner.address] });
  const scaBalance = await client.readContract({ address: USDC_ADDRESS, abi: ERC20_ABI, functionName: "balanceOf", args: [account.address] });

  console.log(`\nEOA USDC Balance: ${formatUnits(eoaBalance, 6)} USDC`);
  console.log(`SCA USDC Balance: ${formatUnits(scaBalance, 6)} USDC`);

  if (scaBalance === 0n) {
    console.log(`\n⚠️  To use Paymaster, transfer USDC to your Smart Account: ${account.address}`);
  }
}

main().catch(console.error);
