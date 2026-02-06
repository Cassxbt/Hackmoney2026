import {
  createPublicClient,
  http,
  getContract,
  encodePacked,
  parseUnits,
  maxUint256,
  erc20Abi,
  parseErc6492Signature,
  hexToBigInt,
  type Hex,
  type Chain,
  type PublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createBundlerClient } from "viem/account-abstraction";
import { toCircleSmartAccount } from "@circle-fin/modular-wallets-core";
import { baseSepolia } from "viem/chains";
import { TESTNET_CHAINS } from "./config.js";

const PAYMASTER_V07_ADDRESS = "0x31BE08D380A21fc740883c0BC434FcFc88740b58" as Hex;
const BUNDLER_URL = "https://public.pimlico.io/v2/84532/rpc";

const EIP2612_ABI = [
  ...erc20Abi,
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "nonces",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

async function signPermit(
  client: PublicClient,
  usdcAddress: Hex,
  account: Awaited<ReturnType<typeof toCircleSmartAccount>>,
  spenderAddress: Hex,
  permitAmount: bigint
): Promise<Hex> {
  const name = await client.readContract({ address: usdcAddress, abi: EIP2612_ABI, functionName: "name" });
  const version = await client.readContract({ address: usdcAddress, abi: EIP2612_ABI, functionName: "version" });
  const nonce = await client.readContract({ address: usdcAddress, abi: EIP2612_ABI, functionName: "nonces", args: [account.address] });

  const permitData = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Permit" as const,
    domain: {
      name: name as string,
      version: version as string,
      chainId: client.chain!.id,
      verifyingContract: usdcAddress,
    },
    message: {
      owner: account.address,
      spender: spenderAddress,
      value: permitAmount.toString(),
      nonce: (nonce as bigint).toString(),
      deadline: maxUint256.toString(),
    },
  };

  const wrappedSig = await account.signTypedData(permitData);
  const { signature } = parseErc6492Signature(wrappedSig);
  return signature;
}

export interface SendResult {
  success: boolean;
  txHash?: Hex;
  scaAddress?: Hex;
  error?: string;
}

export async function sendUsdcWithPaymaster(
  privateKey: Hex,
  to: Hex,
  amount: string,
  chain: Chain = baseSepolia
): Promise<SendResult> {
  const chainConfig = TESTNET_CHAINS.find((c) => c.chain.id === chain.id);
  if (!chainConfig) {
    return { success: false, error: `Chain ${chain.name} not supported` };
  }

  const usdcAddress = chainConfig.usdc;
  const owner = privateKeyToAccount(privateKey);
  const client = createPublicClient({ chain, transport: http() });

  const account = await toCircleSmartAccount({ client, owner });
  console.error(`Smart Account Address: ${account.address}`);

  const scaBalance = await client.readContract({
    address: usdcAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
  });

  const amountWei = parseUnits(amount, 6);
  if (scaBalance < amountWei) {
    return {
      success: false,
      scaAddress: account.address,
      error: `Insufficient USDC in Smart Account. Balance: ${scaBalance}. Fund ${account.address} with USDC first.`,
    };
  }

  const permitAmount = parseUnits("10", 6);
  const paymaster = {
    async getPaymasterData() {
      const permitSig = await signPermit(client, usdcAddress, account, PAYMASTER_V07_ADDRESS, permitAmount);
      const paymasterData = encodePacked(
        ["uint8", "address", "uint256", "bytes"],
        [0, usdcAddress, permitAmount, permitSig]
      );
      return {
        paymaster: PAYMASTER_V07_ADDRESS,
        paymasterData,
        paymasterVerificationGasLimit: 200000n,
        paymasterPostOpGasLimit: 15000n,
        isFinal: true,
      };
    },
  };

  const bundlerClient = createBundlerClient({
    account,
    client,
    paymaster,
    userOperation: {
      estimateFeesPerGas: async ({ bundlerClient }) => {
        const result = await bundlerClient.request({
          method: "pimlico_getUserOperationGasPrice" as any,
        }) as { standard: { maxFeePerGas: Hex; maxPriorityFeePerGas: Hex } };
        return {
          maxFeePerGas: hexToBigInt(result.standard.maxFeePerGas),
          maxPriorityFeePerGas: hexToBigInt(result.standard.maxPriorityFeePerGas),
        };
      },
    },
    transport: http(BUNDLER_URL),
  });

  const hash = await bundlerClient.sendUserOperation({
    account,
    calls: [
      {
        to: usdcAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [to, amountWei],
      },
    ],
  });

  const receipt = await bundlerClient.waitForUserOperationReceipt({ hash });

  return {
    success: true,
    txHash: receipt.receipt.transactionHash,
    scaAddress: account.address,
  };
}

export async function getSmartAccountAddress(privateKey: Hex, chain: Chain = baseSepolia): Promise<Hex> {
  const owner = privateKeyToAccount(privateKey);
  const client = createPublicClient({ chain, transport: http() });
  const account = await toCircleSmartAccount({ client, owner });
  return account.address;
}
