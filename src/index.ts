#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { handleBalance } from "./tools/balance.js";
import { handleSend } from "./tools/send.js";
import { handleGetAddress } from "./tools/address.js";
import { handleOpenChannel, handleMicropay, handleCloseChannel } from "./tools/channel.js";

const server = new McpServer({
  name: "agentpay",
  version: "0.1.0",
});

server.tool(
  "agentpay_balance",
  "Check USDC balance across all supported chains. Returns unified balance via Circle Gateway.",
  {},
  async () => handleBalance()
);

server.tool(
  "agentpay_send",
  "Send USDC to an address. Gas-free via Circle Paymaster.",
  {
    to: z.string().describe("Recipient address (0x...) or ENS name"),
    amount: z.string().describe("Amount in USDC (e.g., '10.50')"),
    chain: z.string().optional().describe("Target chain (default: base)"),
  },
  async ({ to, amount, chain }) => handleSend(to, amount, chain ?? "base")
);

server.tool(
  "agentpay_address",
  "Get the agent's wallet addresses (EOA and Smart Account).",
  {},
  async () => handleGetAddress()
);

server.tool(
  "agentpay_open_channel",
  "Open a state channel for instant micropayments. Off-chain, gas-free after opening.",
  {
    counterparty: z.string().describe("Address of the counterparty (0x...)"),
    amount: z.string().describe("Initial deposit in USDC (e.g., '5.00')"),
  },
  async ({ counterparty, amount }) => handleOpenChannel(counterparty, amount)
);

server.tool(
  "agentpay_micropay",
  "Send an instant micropayment through an open channel. No gas, no on-chain tx.",
  {
    amount: z.string().describe("Amount to send in USDC (e.g., '0.001')"),
    sessionId: z.string().optional().describe("Channel session ID (uses active channel if omitted)"),
  },
  async ({ amount, sessionId }) => handleMicropay(amount, sessionId)
);

server.tool(
  "agentpay_close_channel",
  "Close a state channel and settle on-chain. Final balances are paid out.",
  {
    sessionId: z.string().optional().describe("Channel session ID (uses active channel if omitted)"),
  },
  async ({ sessionId }) => handleCloseChannel(sessionId)
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AgentPay MCP server running");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
