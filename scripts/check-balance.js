import { createPublicClient, http, formatUnits } from "viem";
import { baseSepolia, sepolia, avalancheFuji } from "viem/chains";
const ADDRESS = "0x66d71a8612Fbf6ab69340Bf82aB431e1Ad30b5c3";
const CHAINS = [
    { chain: baseSepolia, usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", name: "Base Sepolia" },
    { chain: sepolia, usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", name: "Ethereum Sepolia" },
    { chain: avalancheFuji, usdc: "0x5425890298aed601595a70AB815c96711a31Bc65", name: "Avalanche Fuji" },
];
const abi = [{ name: "balanceOf", type: "function", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" }];
async function main() {
    for (const { chain, usdc, name } of CHAINS) {
        try {
            const client = createPublicClient({ chain, transport: http() });
            const balance = await client.readContract({ address: usdc, abi, functionName: "balanceOf", args: [ADDRESS] });
            console.log(`${name}: ${formatUnits(balance, 6)} USDC`);
        }
        catch (e) {
            console.log(`${name}: Error`);
        }
    }
}
main().catch(console.error);
//# sourceMappingURL=check-balance.js.map