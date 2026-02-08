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
        const [avatar, description, url] = await Promise.all([
          client.getEnsText({ name: normalize(ensName), key: "avatar" }).catch(() => null),
          client.getEnsText({ name: normalize(ensName), key: "description" }).catch(() => null),
          client.getEnsText({ name: normalize(ensName), key: "url" }).catch(() => null),
        ]);
        if (avatar) result.avatar = avatar;
        if (description) result.description = description;
        if (url) result.url = url;
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

      const [avatar, description, url] = await Promise.all([
        client.getEnsText({ name: normalized, key: "avatar" }).catch(() => null),
        client.getEnsText({ name: normalized, key: "description" }).catch(() => null),
        client.getEnsText({ name: normalized, key: "url" }).catch(() => null),
      ]);

      const result: Record<string, string | null> = {
        ensName: name,
        address,
      };
      if (avatar) result.avatar = avatar;
      if (description) result.description = description;
      if (url) result.url = url;

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
