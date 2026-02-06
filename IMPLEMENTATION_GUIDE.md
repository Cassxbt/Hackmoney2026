# Nitrolite Implementation Guide for AgentPay MCP Tools

**Purpose:** Concrete code patterns for integrating state channels into the MCP server

---

## A. WebSocket Connection & Authentication

**File Location:** Should go in `src/lib/nitrolite.ts`

```typescript
import WebSocket from 'ws';
import { ethers } from 'ethers';

interface NitroliteConfig {
  wsUrl: string;
  privateKey: string;
  chainId: number;
}

class NitroliteClient {
  private ws: WebSocket | null = null;
  private address: string;
  private privateKey: string;
  private config: NitroliteConfig;
  private messageId: number = 1;

  constructor(config: NitroliteConfig, signer: ethers.Wallet) {
    this.config = config;
    this.privateKey = config.privateKey;
    this.address = signer.address;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.config.wsUrl);

      this.ws.on('open', async () => {
        console.log('Connected to Clearnet');
        try {
          await this.authenticate();
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      this.ws.on('error', reject);
    });
  }

  private async authenticate(): Promise<void> {
    // Step 1: Request challenge
    const authReq = await this.sendRPC('auth_request', [this.address]);

    // authReq.res[2][0] contains the challenge UUID
    const challenge = authReq.res[2][0];

    // Step 2: Sign challenge
    const message = ethers.getAddress(this.address);
    const signature = await this.signMessage(message);

    // Step 3: Verify with signature
    const result = await this.sendRPC('auth_verify', [
      {
        challenge,
        signature,
        address: this.address
      }
    ]);

    console.log('Authentication successful');
  }

  private async signMessage(message: string): Promise<string> {
    const signer = new ethers.Wallet(this.privateKey);
    return signer.signMessage(message);
  }

  async sendRPC(
    method: string,
    params: any[],
    accountId?: string
  ): Promise<any> {
    if (!this.ws) throw new Error('Not connected');

    const timestamp = Math.floor(Date.now() / 1000);
    const requestId = this.messageId++;

    const req = [requestId, method, params, timestamp];
    const reqStr = JSON.stringify(req);

    // Sign the request
    const messageHash = ethers.id(reqStr);
    const signer = new ethers.Wallet(this.privateKey);
    const sig = await signer.signMessage(ethers.toBeHex(messageHash));

    const rpcRequest = {
      req,
      sig: [sig],
      ...(accountId && { acc: accountId })
    };

    return new Promise((resolve, reject) => {
      const messageHandler = (data: string) => {
        const response = JSON.parse(data);
        if (response.res && response.res[0] === requestId) {
          this.ws?.removeEventListener('message', messageHandler);
          resolve(response);
        }
      };

      this.ws?.addEventListener('message', messageHandler);
      this.ws?.send(JSON.stringify(rpcRequest));

      // Timeout after 30s
      setTimeout(() => {
        this.ws?.removeEventListener('message', messageHandler);
        reject(new Error('RPC timeout'));
      }, 30000);
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default NitroliteClient;
```

---

## B. Channel Operations

**File Location:** `src/lib/channel.ts`

```typescript
import { ethers } from 'ethers';
import NitroliteClient from './nitrolite';

export interface ChannelParams {
  participantA: string;
  participantB: string;
  tokenAddress: string;
  amountA: string;  // Wei
  amountB: string;  // Wei
  adjudicator?: string;
  challenge?: number;  // Seconds, default 86400
  nonce?: number;
}

export interface ResizeParams {
  channelId: string;
  participantChange: string;  // Wei (can be negative)
  fundsDestination: string;
}

export class ChannelManager {
  constructor(private client: NitroliteClient) {}

  async openChannel(params: ChannelParams): Promise<string> {
    const response = await this.client.sendRPC('create_virtual_channel', [
      {
        participantA: ethers.getAddress(params.participantA),
        participantB: ethers.getAddress(params.participantB),
        token_address: ethers.getAddress(params.tokenAddress),
        amountA: params.amountA,
        amountB: params.amountB,
        adjudicator: params.adjudicator || ethers.ZeroAddress,
        challenge: params.challenge || 86400,
        nonce: params.nonce || Math.floor(Date.now() / 1000)
      }
    ]);

    // Extract channel ID from response
    // Response format: { res: [requestId, method, [{ channel_id: '0x...' }], timestamp] }
    const channelId = response.res[2][0].channel_id;
    console.log('Channel created:', channelId);
    return channelId;
  }

  async resizeChannel(params: ResizeParams): Promise<{
    channelId: string;
    version: string;
    stateHash: string;
    signature: {
      v: number;
      r: string;
      s: string;
    };
  }> {
    const response = await this.client.sendRPC('resize_channel', [
      {
        channel_id: params.channelId,
        participant_change: params.participantChange,
        funds_destination: ethers.getAddress(params.fundsDestination)
      }
    ]);

    // Response contains server signature + state hash
    const data = response.res[2][0];
    return {
      channelId: data.channel_id,
      version: data.version,
      stateHash: data.state_hash,
      signature: {
        v: parseInt(data.server_signature.v),
        r: data.server_signature.r,
        s: data.server_signature.s
      }
    };
  }

  async closeChannel(
    channelId: string,
    fundsDestination: string
  ): Promise<{
    channelId: string;
    finalAllocations: Array<{
      participant: string;
      token: string;
      amount: string;
    }>;
  }> {
    const response = await this.client.sendRPC('close_channel', [
      {
        channel_id: channelId,
        funds_destination: ethers.getAddress(fundsDestination)
      }
    ]);

    const data = response.res[2][0];
    return {
      channelId: data.channel_id,
      finalAllocations: data.final_allocations.map((alloc: any) => ({
        participant: alloc.participant,
        token: alloc.token,
        amount: alloc.amount.toString()
      }))
    };
  }

  async getChannelBalance(channelId: string): Promise<{
    balances: Array<{
      address: string;
      amount: string;
    }>;
  }> {
    const response = await this.client.sendRPC('get_ledger_balances', [
      { acc: channelId }
    ]);

    return {
      balances: response.res[2][0].map((bal: any) => ({
        address: bal.address,
        amount: bal.amount.toString()
      }))
    };
  }
}

export default ChannelManager;
```

---

## C. Virtual Apps (Multi-Agent)

**File Location:** `src/lib/virtual-app.ts`

```typescript
import { ethers } from 'ethers';
import NitroliteClient from './nitrolite';

export interface CreateAppParams {
  participants: string[];
  weights: bigint[];
  quorum: bigint;
  token: string;
  allocations: string[];  // Wei for each participant
  challenge?: number;
  nonce?: number;
}

export interface CloseAppParams {
  appId: string;
  finalAllocations: string[];  // Wei for each participant
}

export class VirtualAppManager {
  constructor(private client: NitroliteClient) {}

  async createApplication(params: CreateAppParams): Promise<string> {
    const definition = {
      protocol: 'NitroRPC/0.2',
      participants: params.participants.map(p => ethers.getAddress(p)),
      weights: params.weights.map(w => w.toString()),
      quorum: params.quorum.toString(),
      challenge: params.challenge || 86400,
      nonce: params.nonce || Math.floor(Date.now() / 1000)
    };

    const response = await this.client.sendRPC('create_application', [
      {
        definition,
        token: ethers.getAddress(params.token),
        allocations: params.allocations
      }
    ]);

    const appId = response.res[2][0].app_id;
    console.log('Virtual app created:', appId);
    return appId;
  }

  async closeApplication(params: CloseAppParams): Promise<{
    appId: string;
    status: string;
  }> {
    const response = await this.client.sendRPC('close_application', [
      {
        app_id: params.appId,
        allocations: params.finalAllocations
      }
    ]);

    return {
      appId: response.res[2][0].app_id,
      status: response.res[2][0].status
    };
  }

  async getAppBalance(appId: string): Promise<{
    balances: Array<{
      address: string;
      amount: string;
    }>;
  }> {
    const response = await this.client.sendRPC('get_ledger_balances', [
      { acc: appId }
    ]);

    return {
      balances: response.res[2][0].map((bal: any) => ({
        address: bal.address,
        amount: bal.amount.toString()
      }))
    };
  }

  async getAppDefinition(appId: string): Promise<{
    protocol: string;
    participants: string[];
    weights: bigint[];
    quorum: bigint;
  }> {
    const response = await this.client.sendRPC('get_app_definition', [
      { acc: appId }
    ]);

    const def = response.res[2][0];
    return {
      protocol: def.protocol,
      participants: def.participants,
      weights: def.weights.map((w: any) => BigInt(w)),
      quorum: BigInt(def.quorum)
    };
  }
}

export default VirtualAppManager;
```

---

## D. MCP Tool Implementations

**File Location:** `src/tools/agentpay-channels.ts`

```typescript
import { Tool } from '@modelcontextprotocol/sdk/types';
import { ethers } from 'ethers';
import NitroliteClient from '../lib/nitrolite';
import ChannelManager from '../lib/channel';
import VirtualAppManager from '../lib/virtual-app';

class ChannelTools {
  private nitroliteClient: NitroliteClient;
  private channelManager: ChannelManager;
  private virtualAppManager: VirtualAppManager;

  constructor(config: any) {
    this.nitroliteClient = new NitroliteClient(
      {
        wsUrl: config.NITROLITE_WS_URL || 'wss://clearnet.yellow.com/ws',
        privateKey: config.AGENT_PRIVATE_KEY,
        chainId: config.CHAIN_ID || 84532
      },
      new ethers.Wallet(config.AGENT_PRIVATE_KEY)
    );

    this.channelManager = new ChannelManager(this.nitroliteClient);
    this.virtualAppManager = new VirtualAppManager(this.nitroliteClient);
  }

  getTools(): Tool[] {
    return [
      {
        name: 'agentpay_open_channel',
        description: 'Open a state channel for micropayments',
        inputSchema: {
          type: 'object',
          properties: {
            recipient_address: {
              type: 'string',
              description: 'Recipient Ethereum address'
            },
            amount_usdc: {
              type: 'string',
              description: 'Amount in USDC (decimal, e.g. "10.5")'
            },
            chain: {
              type: 'string',
              enum: ['base-sepolia', 'base-mainnet'],
              description: 'Target blockchain'
            }
          },
          required: ['recipient_address', 'amount_usdc', 'chain']
        }
      },
      {
        name: 'agentpay_micropay',
        description: 'Send a micropayment through an open channel',
        inputSchema: {
          type: 'object',
          properties: {
            channel_id: {
              type: 'string',
              description: 'Channel ID from agentpay_open_channel'
            },
            amount_usdc: {
              type: 'string',
              description: 'Amount to send in USDC'
            }
          },
          required: ['channel_id', 'amount_usdc']
        }
      },
      {
        name: 'agentpay_close_channel',
        description: 'Close a state channel and settle final balance',
        inputSchema: {
          type: 'object',
          properties: {
            channel_id: {
              type: 'string',
              description: 'Channel ID to close'
            }
          },
          required: ['channel_id']
        }
      },
      {
        name: 'agentpay_channel_balance',
        description: 'Get current balance in a state channel',
        inputSchema: {
          type: 'object',
          properties: {
            channel_id: {
              type: 'string',
              description: 'Channel ID'
            }
          },
          required: ['channel_id']
        }
      }
    ];
  }

  async handleTool(name: string, input: Record<string, string>): Promise<string> {
    switch (name) {
      case 'agentpay_open_channel':
        return await this.openChannel(input);
      case 'agentpay_micropay':
        return await this.micropay(input);
      case 'agentpay_close_channel':
        return await this.closeChannel(input);
      case 'agentpay_channel_balance':
        return await this.getBalance(input);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async openChannel(input: {
    recipient_address: string;
    amount_usdc: string;
    chain: string;
  }): Promise<string> {
    // Connect if not already
    if (!this.nitroliteClient['ws']) {
      await this.nitroliteClient.connect();
    }

    const amountWei = ethers.parseUnits(input.amount_usdc, 6);  // USDC is 6 decimals

    try {
      const channelId = await this.channelManager.openChannel({
        participantA: ethers.Wallet.createRandom().address,  // Replace with agent address
        participantB: input.recipient_address,
        tokenAddress: '0xXXXXXX',  // USDC address on target chain
        amountA: amountWei.toString(),
        amountB: '0'
      });

      return JSON.stringify({
        success: true,
        channel_id: channelId,
        amount: input.amount_usdc,
        status: 'open'
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: (error as Error).message
      });
    }
  }

  private async micropay(input: {
    channel_id: string;
    amount_usdc: string;
  }): Promise<string> {
    const amountWei = ethers.parseUnits(input.amount_usdc, 6);

    try {
      const result = await this.channelManager.resizeChannel({
        channelId: input.channel_id,
        participantChange: amountWei.toString(),
        fundsDestination: ethers.ZeroAddress  // Broker determines destination
      });

      return JSON.stringify({
        success: true,
        channel_id: result.channelId,
        amount: input.amount_usdc,
        version: result.version,
        state_hash: result.stateHash,
        signature: result.signature
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: (error as Error).message
      });
    }
  }

  private async closeChannel(input: {
    channel_id: string;
  }): Promise<string> {
    try {
      const result = await this.channelManager.closeChannel(
        input.channel_id,
        ethers.ZeroAddress
      );

      return JSON.stringify({
        success: true,
        channel_id: result.channelId,
        final_allocations: result.finalAllocations,
        status: 'closed'
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: (error as Error).message
      });
    }
  }

  private async getBalance(input: { channel_id: string }): Promise<string> {
    try {
      const result = await this.channelManager.getChannelBalance(input.channel_id);

      return JSON.stringify({
        success: true,
        channel_id: input.channel_id,
        balances: result.balances
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: (error as Error).message
      });
    }
  }
}

export default ChannelTools;
```

---

## E. Integration into MCP Server

**File Location:** `src/index.ts` (updated)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/stdio';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import { TextContent, Tool } from '@modelcontextprotocol/sdk/types';
import { CallToolRequest, ListToolsRequest } from '@modelcontextprotocol/sdk/types';
import ChannelTools from './tools/agentpay-channels';

const server = new Server(
  {
    name: 'agentpay',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

const channelTools = new ChannelTools({
  NITROLITE_WS_URL: process.env.NITROLITE_WS_URL,
  AGENT_PRIVATE_KEY: process.env.AGENT_PRIVATE_KEY,
  CHAIN_ID: process.env.CHAIN_ID || '84532',
  USDC_ADDRESS: process.env.USDC_ADDRESS
});

// List tools handler
server.setRequestHandler(ListToolsRequest, async () => {
  return {
    tools: [
      ...channelTools.getTools(),
      // ... existing tools (balance, send, address)
    ]
  };
});

// Tool execution handler
server.setRequestHandler(CallToolRequest, async (request: CallToolRequest) => {
  const { name, arguments: args } = request;

  try {
    // Existing tools
    if (name === 'agentpay_balance') {
      return { /* ... existing */ };
    }

    // New channel tools
    const result = await channelTools.handleTool(name, args);
    return {
      content: [
        {
          type: 'text',
          text: result
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(error as Error).message}`
        }
      ],
      isError: true
    };
  }
});

// Run server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('AgentPay MCP server running...');
}

main().catch(console.error);
```

---

## F. Database Schema (for channel tracking)

**File Location:** `src/db/schema.sql`

```sql
-- Channels table
CREATE TABLE channels (
  id SERIAL PRIMARY KEY,
  channel_id VARCHAR(66) UNIQUE NOT NULL,
  participant_a VARCHAR(42) NOT NULL,
  participant_b VARCHAR(42) NOT NULL,
  token_address VARCHAR(42) NOT NULL,
  amount_wei VARCHAR(80) NOT NULL,
  status VARCHAR(20) NOT NULL,
  version INTEGER DEFAULT 1,
  challenge_period INTEGER DEFAULT 86400,
  nonce BIGINT,
  adjudicator VARCHAR(42),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ledger entries
CREATE TABLE ledger_entries (
  id SERIAL PRIMARY KEY,
  channel_id VARCHAR(66) NOT NULL,
  from_address VARCHAR(42) NOT NULL,
  to_address VARCHAR(42) NOT NULL,
  amount_wei VARCHAR(80) NOT NULL,
  intent INTEGER,  -- 1=RESIZE, 2=FINALIZE
  transaction_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (channel_id) REFERENCES channels(channel_id)
);

-- Virtual apps
CREATE TABLE virtual_apps (
  id SERIAL PRIMARY KEY,
  app_id VARCHAR(66) UNIQUE NOT NULL,
  participants TEXT[] NOT NULL,
  weights BIGINT[] NOT NULL,
  quorum BIGINT NOT NULL,
  token_address VARCHAR(42) NOT NULL,
  status VARCHAR(20) NOT NULL,
  protocol VARCHAR(50) DEFAULT 'NitroRPC/0.2',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_channels_participant ON channels(participant_a);
CREATE INDEX idx_channels_status ON channels(status);
CREATE INDEX idx_ledger_channel ON ledger_entries(channel_id);
CREATE INDEX idx_vapp_status ON virtual_apps(status);
```

---

## G. Testing

**File Location:** `src/test/channels.test.ts`

```typescript
import { ChannelManager } from '../lib/channel';
import NitroliteClient from '../lib/nitrolite';

describe('ChannelManager', () => {
  let manager: ChannelManager;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      sendRPC: jest.fn()
    };
    manager = new ChannelManager(mockClient as NitroliteClient);
  });

  test('openChannel should call RPC with correct parameters', async () => {
    mockClient.sendRPC.mockResolvedValue({
      res: [1, 'create_virtual_channel', [{ channel_id: '0xABC123' }], 0]
    });

    const result = await manager.openChannel({
      participantA: '0x1111111111111111111111111111111111111111',
      participantB: '0x2222222222222222222222222222222222222222',
      tokenAddress: '0x3333333333333333333333333333333333333333',
      amountA: '1000000000',
      amountB: '0'
    });

    expect(result).toBe('0xABC123');
    expect(mockClient.sendRPC).toHaveBeenCalledWith(
      'create_virtual_channel',
      expect.any(Array)
    );
  });

  test('resizeChannel should encode and sign state', async () => {
    mockClient.sendRPC.mockResolvedValue({
      res: [
        1,
        'resize_channel',
        [
          {
            channel_id: '0xABC123',
            version: '2',
            state_hash: '0xHASH',
            server_signature: { v: '27', r: '0xR', s: '0xS' }
          }
        ],
        0
      ]
    });

    const result = await manager.resizeChannel({
      channelId: '0xABC123',
      participantChange: '500000000',
      fundsDestination: '0x1111111111111111111111111111111111111111'
    });

    expect(result.channelId).toBe('0xABC123');
    expect(result.stateHash).toBe('0xHASH');
  });
});
```

---

## Notes

1. **Authentication:** The WebSocket handler automatically signs all RPC messages with the agent's private key
2. **State Signing:** Resize operations include server signatures; verify them before posting to chain
3. **Ledger Tracking:** Keep a local copy of channel balances for quick querying
4. **Chain Selection:** Base Sepolia is testnet (84532), Base Mainnet is 8453
5. **USDC Decimals:** USDC uses 6 decimals, not 18

---

**End of Implementation Guide**
