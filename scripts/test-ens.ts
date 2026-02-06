import "dotenv/config";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

async function main() {
  const name = "vitalik.eth";
  console.log(`Resolving ${name}...`);
  const address = await client.getEnsAddress({ name: normalize(name) });
  console.log(`${name} => ${address}`);
}

main().catch(console.error);
