import type { Hex, Chain } from "viem";
import { baseSepolia, sepolia, avalancheFuji, base, mainnet, arbitrum, optimism, polygon, avalanche } from "viem/chains";

export type NetworkMode = "testnet" | "mainnet";

export interface ChainConfig {
  chain: Chain;
  usdc: Hex;
  gatewayWallet: Hex;
  gatewayMinter: Hex;
  domain: number;
}

export const TESTNET_CHAINS: ChainConfig[] = [
  {
    chain: baseSepolia,
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    gatewayWallet: "0x0077777d7EBA4688BDeF3E311b846F25870A19B9",
    gatewayMinter: "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B",
    domain: 6,
  },
  {
    chain: sepolia,
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    gatewayWallet: "0x0077777d7EBA4688BDeF3E311b846F25870A19B9",
    gatewayMinter: "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B",
    domain: 0,
  },
  {
    chain: avalancheFuji,
    usdc: "0x5425890298aed601595a70AB815c96711a31Bc65",
    gatewayWallet: "0x0077777d7EBA4688BDeF3E311b846F25870A19B9",
    gatewayMinter: "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B",
    domain: 1,
  },
];

export const MAINNET_CHAINS: ChainConfig[] = [
  {
    chain: base,
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    gatewayWallet: "0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE",
    gatewayMinter: "0x2222222d7164433c4C09B0b0D809a9b52C04C205",
    domain: 6,
  },
  {
    chain: mainnet,
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    gatewayWallet: "0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE",
    gatewayMinter: "0x2222222d7164433c4C09B0b0D809a9b52C04C205",
    domain: 0,
  },
  {
    chain: arbitrum,
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    gatewayWallet: "0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE",
    gatewayMinter: "0x2222222d7164433c4C09B0b0D809a9b52C04C205",
    domain: 3,
  },
  {
    chain: optimism,
    usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    gatewayWallet: "0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE",
    gatewayMinter: "0x2222222d7164433c4C09B0b0D809a9b52C04C205",
    domain: 2,
  },
  {
    chain: polygon,
    usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    gatewayWallet: "0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE",
    gatewayMinter: "0x2222222d7164433c4C09B0b0D809a9b52C04C205",
    domain: 7,
  },
  {
    chain: avalanche,
    usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    gatewayWallet: "0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE",
    gatewayMinter: "0x2222222d7164433c4C09B0b0D809a9b52C04C205",
    domain: 1,
  },
];

export const GATEWAY_API = {
  testnet: "https://gateway-api-testnet.circle.com/v1",
  mainnet: "https://gateway-api.circle.com/v1",
};

export function getChains(mode: NetworkMode): ChainConfig[] {
  return mode === "testnet" ? TESTNET_CHAINS : MAINNET_CHAINS;
}
