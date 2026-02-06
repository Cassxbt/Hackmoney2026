import { createPublicClient, createWalletClient, http, type Hex, type Address } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import WebSocket from "ws";
import {
  NitroliteClient,
  WalletStateSigner,
  createAuthRequestMessage,
  createAuthVerifyMessageFromChallenge,
  createGetChannelsMessage,
  createGetLedgerBalancesMessage,
  createAppSessionMessage,
  createSubmitAppStateMessage,
  createCloseAppSessionMessage,
  createEIP712AuthMessageSigner,
  createECDSAMessageSigner,
  RPCProtocolVersion,
  RPCAppStateIntent,
  type MessageSigner,
  type RPCAppDefinition,
  type RPCAppSessionAllocation,
} from "@erc7824/nitrolite";

const CLEARNODE_WS = "wss://clearnet.yellow.com/ws";
const CUSTODY_ADDRESS = "0x490fb189DdE3a01B00be9BA5F41e3447FbC838b6" as Address;
const ADJUDICATOR_ADDRESS = "0xcbbc03a873c11beeFA8676146721Fa00924d7e4" as Address;

export interface ChannelInfo {
  channelId: string;
  status: string;
  counterparty: Address;
  balance: string;
}

export interface NitroliteConnection {
  ws: WebSocket;
  signer: MessageSigner;
  address: Address;
  authenticated: boolean;
}

export async function createNitroliteClient(privateKey: Hex) {
  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http() });
  const walletClient = createWalletClient({ chain: baseSepolia, account, transport: http() });
  const stateSigner = new WalletStateSigner(walletClient as any);

  return new NitroliteClient({
    publicClient: publicClient as any,
    walletClient: walletClient as any,
    stateSigner,
    addresses: {
      custody: CUSTODY_ADDRESS,
      adjudicator: ADJUDICATOR_ADDRESS,
    },
    chainId: baseSepolia.id,
    challengeDuration: 3600n,
  });
}


export async function connectToClearNode(privateKey: Hex): Promise<NitroliteConnection> {
  const account = privateKeyToAccount(privateKey);
  const sessionKey = privateKeyToAccount(generatePrivateKey());
  const walletClient = createWalletClient({ chain: baseSepolia, account, transport: http() });
  const expiresAt = BigInt(Math.floor(Date.now() / 1000) + 3600);

  const authParams = {
    scope: "console",
    session_key: sessionKey.address,
    expires_at: expiresAt,
    allowances: [] as { asset: string; amount: string }[],
  };

  const eip712Signer = createEIP712AuthMessageSigner(
    walletClient as any,
    authParams,
    { name: "agentpay" }
  );

  const ecdsaSigner = createECDSAMessageSigner(privateKey);

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(CLEARNODE_WS);
    const connection: NitroliteConnection = {
      ws,
      signer: ecdsaSigner,
      address: account.address,
      authenticated: false,
    };

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("Connection timeout"));
    }, 15000);

    ws.on("open", async () => {
      try {
        const authRequest = await createAuthRequestMessage({
          address: account.address,
          session_key: sessionKey.address,
          application: "agentpay",
          expires_at: expiresAt,
          scope: "console",
          allowances: [],
        });
        console.error("Sending auth_request");
        ws.send(authRequest);
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });

    ws.on("message", async (data) => {
      try {
        const raw = data.toString();
        const message = JSON.parse(raw);
        const method = message.res?.[1];

        console.error("Received:", method, JSON.stringify(message.res?.[2]).slice(0, 100));

        if (method === "auth_challenge") {
          const challengeData = message.res?.[2];
          const challenge = challengeData?.challenge_message;
          console.error("Challenge:", challenge);
          const authVerify = await createAuthVerifyMessageFromChallenge(eip712Signer, challenge);
          console.error("Sending auth_verify (EIP-712):", authVerify.slice(0, 300));
          ws.send(authVerify);
        } else if (method === "auth_success" || method === "auth_verify") {
          clearTimeout(timeout);
          connection.authenticated = true;
          resolve(connection);
        } else if (method === "error") {
          clearTimeout(timeout);
          reject(new Error(message.res?.[2]?.message || message.res?.[2]?.error || "Auth failed"));
        }
      } catch (err) {
        console.error("Message handling error:", err);
        clearTimeout(timeout);
        reject(err);
      }
    });

    ws.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export async function getChannels(connection: NitroliteConnection): Promise<ChannelInfo[]> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Get channels timeout")), 10000);

    const handler = (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.res?.[1] === "get_channels") {
          clearTimeout(timeout);
          connection.ws.off("message", handler);
          const result = message.res?.[2] || {};
          const channels = result.channels || [];
          resolve(channels.map((ch: any) => ({
            channelId: ch.channel_id,
            status: ch.status,
            counterparty: ch.participant,
            balance: ch.balance || "0",
          })));
        }
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    connection.ws.on("message", handler);

    createGetChannelsMessage(connection.signer, connection.address)
      .then((msg) => connection.ws.send(msg))
      .catch(reject);
  });
}

export function disconnect(connection: NitroliteConnection) {
  if (connection.ws.readyState === WebSocket.OPEN) {
    connection.ws.close(1000, "Client disconnect");
  }
}

export interface LedgerBalance {
  asset: string;
  amount: string;
}

export async function getLedgerBalances(connection: NitroliteConnection): Promise<LedgerBalance[]> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Get ledger balances timeout")), 10000);

    const handler = (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.res?.[1] === "get_ledger_balances") {
          clearTimeout(timeout);
          connection.ws.off("message", handler);
          const result = message.res?.[2] || {};
          resolve(result.ledger_balances || result.balances || []);
        }
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    connection.ws.on("message", handler);

    createGetLedgerBalancesMessage(connection.signer, connection.address)
      .then((msg) => connection.ws.send(msg))
      .catch(reject);
  });
}

export interface ChannelSession {
  appSessionId: string;
  counterparty: Address;
  asset: string;
  version: number;
  myAllocation: string;
  theirAllocation: string;
}

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address;

export async function openChannel(
  connection: NitroliteConnection,
  counterparty: Address,
  amount: string
): Promise<{ success: true; session: ChannelSession } | { success: false; error: string }> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      connection.ws.off("message", handler);
      resolve({ success: false, error: "Open channel timeout" });
    }, 15000);

    const handler = (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        const method = message.res?.[1];

        if (method === "create_app_session") {
          clearTimeout(timeout);
          connection.ws.off("message", handler);
          const result = message.res?.[2];
          if (result?.app_session_id) {
            resolve({
              success: true,
              session: {
                appSessionId: result.app_session_id,
                counterparty,
                asset: USDC_BASE_SEPOLIA,
                version: 0,
                myAllocation: amount,
                theirAllocation: "0",
              },
            });
          } else {
            resolve({ success: false, error: "No app_session_id in response" });
          }
        } else if (method === "error") {
          clearTimeout(timeout);
          connection.ws.off("message", handler);
          resolve({ success: false, error: message.res?.[2]?.message || message.res?.[2]?.error || "Unknown error" });
        }
      } catch (err) {
        clearTimeout(timeout);
        connection.ws.off("message", handler);
        resolve({ success: false, error: String(err) });
      }
    };

    connection.ws.on("message", handler);

    const definition: RPCAppDefinition = {
      application: "agentpay",
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      participants: [connection.address, counterparty],
      weights: [1, 1],
      quorum: 2,
      challenge: 3600,
      nonce: Date.now(),
    };

    const allocations: RPCAppSessionAllocation[] = [
      { asset: USDC_BASE_SEPOLIA, amount, participant: connection.address },
      { asset: USDC_BASE_SEPOLIA, amount: "0", participant: counterparty },
    ];

    createAppSessionMessage(connection.signer, { definition, allocations })
      .then((msg) => connection.ws.send(msg))
      .catch((err) => {
        clearTimeout(timeout);
        connection.ws.off("message", handler);
        resolve({ success: false, error: String(err) });
      });
  });
}

export async function micropay(
  connection: NitroliteConnection,
  session: ChannelSession,
  paymentAmount: string
): Promise<{ success: true; session: ChannelSession } | { success: false; error: string }> {
  const currentMy = BigInt(session.myAllocation);
  const payment = BigInt(paymentAmount);

  if (payment > currentMy) {
    return { success: false, error: "Insufficient channel balance" };
  }

  const newMyAllocation = (currentMy - payment).toString();
  const newTheirAllocation = (BigInt(session.theirAllocation) + payment).toString();
  const newVersion = session.version + 1;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      connection.ws.off("message", handler);
      resolve({ success: false, error: "Micropay timeout" });
    }, 10000);

    const handler = (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        const method = message.res?.[1];

        if (method === "submit_app_state") {
          clearTimeout(timeout);
          connection.ws.off("message", handler);
          const result = message.res?.[2];
          if (result?.version !== undefined) {
            resolve({
              success: true,
              session: {
                ...session,
                version: newVersion,
                myAllocation: newMyAllocation,
                theirAllocation: newTheirAllocation,
              },
            });
          } else {
            resolve({ success: false, error: "Invalid response" });
          }
        } else if (method === "error") {
          clearTimeout(timeout);
          connection.ws.off("message", handler);
          resolve({ success: false, error: message.res?.[2]?.message || message.res?.[2]?.error || "Unknown error" });
        }
      } catch (err) {
        clearTimeout(timeout);
        connection.ws.off("message", handler);
        resolve({ success: false, error: String(err) });
      }
    };

    connection.ws.on("message", handler);

    const allocations: RPCAppSessionAllocation[] = [
      { asset: session.asset, amount: newMyAllocation, participant: connection.address },
      { asset: session.asset, amount: newTheirAllocation, participant: session.counterparty },
    ];

    createSubmitAppStateMessage(connection.signer, {
      app_session_id: session.appSessionId as `0x${string}`,
      intent: RPCAppStateIntent.Operate,
      version: newVersion,
      allocations,
    })
      .then((msg) => connection.ws.send(msg))
      .catch((err) => {
        clearTimeout(timeout);
        connection.ws.off("message", handler);
        resolve({ success: false, error: String(err) });
      });
  });
}

export async function closeChannel(
  connection: NitroliteConnection,
  session: ChannelSession
): Promise<{ success: true; finalAllocations: { my: string; theirs: string } } | { success: false; error: string }> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      connection.ws.off("message", handler);
      resolve({ success: false, error: "Close channel timeout" });
    }, 15000);

    const handler = (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        const method = message.res?.[1];

        if (method === "close_app_session") {
          clearTimeout(timeout);
          connection.ws.off("message", handler);
          resolve({
            success: true,
            finalAllocations: {
              my: session.myAllocation,
              theirs: session.theirAllocation,
            },
          });
        } else if (method === "error") {
          clearTimeout(timeout);
          connection.ws.off("message", handler);
          resolve({ success: false, error: message.res?.[2]?.message || message.res?.[2]?.error || "Unknown error" });
        }
      } catch (err) {
        clearTimeout(timeout);
        connection.ws.off("message", handler);
        resolve({ success: false, error: String(err) });
      }
    };

    connection.ws.on("message", handler);

    const allocations: RPCAppSessionAllocation[] = [
      { asset: session.asset, amount: session.myAllocation, participant: connection.address },
      { asset: session.asset, amount: session.theirAllocation, participant: session.counterparty },
    ];

    createCloseAppSessionMessage(connection.signer, {
      app_session_id: session.appSessionId as `0x${string}`,
      allocations,
    })
      .then((msg) => connection.ws.send(msg))
      .catch((err) => {
        clearTimeout(timeout);
        connection.ws.off("message", handler);
        resolve({ success: false, error: String(err) });
      });
  });
}
