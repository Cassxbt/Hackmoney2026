import type { Address } from "viem";
import { createPublicClient, http, isAddress } from "viem";
import { normalize } from "viem/ens";
import { mainnet } from "viem/chains";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function handleResolve(name: string) {
  try {
    if (isAddress(name)) {
      const ensName = await client.getEnsName({ address: name as Address });
      const result: Record<string, string | null> = {
        address: name,
        ensName: ensName ?? null,
      };

      if (ensName) {
        const keys = ["avatar", "description", "url", "com.twitter", "com.github", "com.discord"];
        const values = await Promise.all(
          keys.map((key) => client.getEnsText({ name: normalize(ensName), key }).catch(() => null))
        );
        keys.forEach((key, i) => { if (values[i]) result[key] = values[i]; });
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }

    if (name.endsWith(".eth") || name.includes(".")) {
      const normalized = normalize(name);
      const address = await client.getEnsAddress({ name: normalized });

      if (!address) {
        return {
          content: [{ type: "text" as const, text: `ENS name "${name}" does not resolve to an address` }],
          isError: true,
        };
      }

      const keys = ["avatar", "description", "url", "com.twitter", "com.github", "com.discord"];
      const values = await Promise.all(
        keys.map((key) => client.getEnsText({ name: normalized, key }).catch(() => null))
      );

      const result: Record<string, string | null> = {
        ensName: name,
        address,
      };
      keys.forEach((key, i) => { if (values[i]) result[key] = values[i]; });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }

    return {
      content: [{ type: "text" as const, text: `Invalid input: "${name}". Provide an ENS name (e.g. vitalik.eth) or an address (0x...)` }],
      isError: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `ENS resolution error: ${message}` }],
      isError: true,
    };
  }
}
