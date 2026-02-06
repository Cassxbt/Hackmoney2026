import "dotenv/config";
import type { Hex, Address } from "viem";
import {
  connectToClearNode,
  openChannel,
  micropay,
  closeChannel,
  disconnect,
  type NitroliteConnection,
  type ChannelSession,
} from "../lib/nitrolite.js";

const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY as Hex;

let activeConnection: NitroliteConnection | null = null;
let activeSession: ChannelSession | null = null;

async function ensureConnection(): Promise<NitroliteConnection> {
  if (activeConnection?.authenticated && activeConnection.ws.readyState === 1) {
    return activeConnection;
  }
  activeConnection = await connectToClearNode(PRIVATE_KEY);
  return activeConnection;
}

function formatUsdc(weiAmount: string): string {
  const num = BigInt(weiAmount);
  const whole = num / BigInt(1e6);
  const frac = num % BigInt(1e6);
  return `${whole}.${frac.toString().padStart(6, "0")} USDC`;
}

function parseUsdc(amount: string): string {
  const num = parseFloat(amount);
  return Math.floor(num * 1e6).toString();
}

export async function handleOpenChannel(counterparty: string, amount: string) {
  if (!PRIVATE_KEY) {
    return {
      content: [{ type: "text" as const, text: "Error: AGENT_PRIVATE_KEY not configured" }],
      isError: true,
    };
  }

  if (!counterparty.startsWith("0x") || counterparty.length !== 42) {
    return {
      content: [{ type: "text" as const, text: `Error: Invalid counterparty address "${counterparty}"` }],
      isError: true,
    };
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return {
      content: [{ type: "text" as const, text: `Error: Invalid amount "${amount}"` }],
      isError: true,
    };
  }

  try {
    const connection = await ensureConnection();
    const weiAmount = parseUsdc(amount);
    const result = await openChannel(connection, counterparty as Address, weiAmount);

    if (!result.success) {
      return {
        content: [{ type: "text" as const, text: `Error: ${result.error}` }],
        isError: true,
      };
    }

    activeSession = result.session;

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          status: "channel_opened",
          appSessionId: result.session.appSessionId,
          counterparty: result.session.counterparty,
          initialDeposit: formatUsdc(result.session.myAllocation),
          version: result.session.version,
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

export async function handleMicropay(amount: string, sessionId?: string) {
  if (!PRIVATE_KEY) {
    return {
      content: [{ type: "text" as const, text: "Error: AGENT_PRIVATE_KEY not configured" }],
      isError: true,
    };
  }

  if (!activeSession && !sessionId) {
    return {
      content: [{ type: "text" as const, text: "Error: No active channel. Open a channel first or provide sessionId." }],
      isError: true,
    };
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return {
      content: [{ type: "text" as const, text: `Error: Invalid amount "${amount}"` }],
      isError: true,
    };
  }

  try {
    const connection = await ensureConnection();
    const session = activeSession!;
    const weiAmount = parseUsdc(amount);

    const result = await micropay(connection, session, weiAmount);

    if (!result.success) {
      return {
        content: [{ type: "text" as const, text: `Error: ${result.error}` }],
        isError: true,
      };
    }

    activeSession = result.session;

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          status: "micropayment_sent",
          amount: formatUsdc(weiAmount),
          newVersion: result.session.version,
          remainingBalance: formatUsdc(result.session.myAllocation),
          counterpartyBalance: formatUsdc(result.session.theirAllocation),
          onChainTx: false,
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

export async function handleCloseChannel(sessionId?: string) {
  if (!PRIVATE_KEY) {
    return {
      content: [{ type: "text" as const, text: "Error: AGENT_PRIVATE_KEY not configured" }],
      isError: true,
    };
  }

  if (!activeSession && !sessionId) {
    return {
      content: [{ type: "text" as const, text: "Error: No active channel to close." }],
      isError: true,
    };
  }

  try {
    const connection = await ensureConnection();
    const session = activeSession!;

    const result = await closeChannel(connection, session);

    if (!result.success) {
      return {
        content: [{ type: "text" as const, text: `Error: ${result.error}` }],
        isError: true,
      };
    }

    const closedSession = activeSession;
    activeSession = null;

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          status: "channel_closed",
          appSessionId: closedSession?.appSessionId,
          finalVersion: closedSession?.version,
          settlement: {
            myBalance: formatUsdc(result.finalAllocations.my),
            counterpartyBalance: formatUsdc(result.finalAllocations.theirs),
          },
          onChainSettlement: true,
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
