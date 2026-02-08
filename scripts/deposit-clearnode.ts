import "dotenv/config";
import { createPublicClient, createWalletClient, http, parseAbi, type Hex, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY as Hex;
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address;
const CUSTODY_ADDRESS = "0x490fb189DdE3a01B00be9BA5F41e3447FbC838b6" as Address;

const ERC20_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);

async function main() {
  if (!PRIVATE_KEY) {
    console.error("ERROR: AGENT_PRIVATE_KEY not set");
    process.exit(1);
  }

  const account = privateKeyToAccount(PRIVATE_KEY);
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http() });
  const walletClient = createWalletClient({ chain: baseSepolia, account, transport: http() });

  console.log("=== ClearNode Deposit Setup ===\n");
  console.log("Wallet:", account.address);

  // Check USDC balance
  const balance = await publicClient.readContract({
    address: USDC_BASE_SEPOLIA,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [account.address],
  });
  console.log("USDC Balance:", Number(balance) / 1e6, "USDC");

  // Check allowance
  const allowance = await publicClient.readContract({
    address: USDC_BASE_SEPOLIA,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [account.address, CUSTODY_ADDRESS],
  });
  console.log("Current allowance:", Number(allowance) / 1e6, "USDC");

  // Amount to deposit (1 USDC for testing)
  const depositAmount = 1_000_000n; // 1 USDC

  if (balance < depositAmount) {
    console.error("\nInsufficient balance. Need at least 1 USDC.");
    console.log("Get testnet USDC from: https://faucet.circle.com/");
    process.exit(1);
  }

  // Approve if needed
  if (allowance < depositAmount) {
    console.log("\nApproving custody contract...");
    const approveTx = await walletClient.writeContract({
      address: USDC_BASE_SEPOLIA,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CUSTODY_ADDRESS, depositAmount * 100n], // Approve 100x for future deposits
    });
    console.log("Approve tx:", approveTx);
    await publicClient.waitForTransactionReceipt({ hash: approveTx });
    console.log("Approved!");
  }

  console.log("\n--- Ready to deposit ---");
  console.log("Custody contract:", CUSTODY_ADDRESS);
  console.log("Amount:", Number(depositAmount) / 1e6, "USDC");
  console.log("\nTo deposit, we need to call the custody contract's deposit function.");
  console.log("This requires the NitroliteClient...");

  // Import and use the deposit function
  const { depositToClearNode } = await import("../src/lib/nitrolite.js");

  console.log("\nDepositing to ClearNode...");
  const result = await depositToClearNode(PRIVATE_KEY, "1");

  if (result.success) {
    console.log("Success! TX:", result.txHash);
  } else {
    console.error("Failed:", result.error);
  }
}

main().catch(console.error);
