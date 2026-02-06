import { createPublicClient, createWalletClient, http, type Hex, type Chain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

export interface WalletConfig {
  privateKey: Hex;
  chain: Chain;
}

export function createWallet(config: WalletConfig) {
  const account = privateKeyToAccount(config.privateKey);

  const publicClient = createPublicClient({
    chain: config.chain,
    transport: http(),
  });

  const walletClient = createWalletClient({
    chain: config.chain,
    account,
    transport: http(),
  });

  return { account, publicClient, walletClient };
}

export function getDefaultWalletConfig(): WalletConfig {
  const privateKey = process.env.AGENT_PRIVATE_KEY as Hex;
  if (!privateKey) {
    throw new Error("AGENT_PRIVATE_KEY not set in environment");
  }
  return { privateKey, chain: baseSepolia };
}
