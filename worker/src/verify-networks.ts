import { chainInfo } from "@gluwa/usc-sdk";
import { JsonRpcProvider } from "ethers";

const EXPECTED_CREDITCOIN_CHAIN_ID = 102031n;
const EXPECTED_SEPOLIA_CHAIN_ID = 11155111;
const EXPECTED_SEPOLIA_CHAIN_KEY = 1;

const creditcoinRpcUrl =
  process.env.CREDITCOIN_RPC_URL ?? "https://rpc.cc3-testnet.creditcoin.network";
const proofBuilderUrl =
  process.env.CREDITCOIN_PROOF_BUILDER_URL ??
  "https://prover.cc3-testnet.creditcoin.network";

const provider = new JsonRpcProvider(creditcoinRpcUrl);
const network = await provider.getNetwork();

if (network.chainId !== EXPECTED_CREDITCOIN_CHAIN_ID) {
  throw new Error(
    `Creditcoin chain mismatch: expected ${EXPECTED_CREDITCOIN_CHAIN_ID}, received ${network.chainId}`,
  );
}

type SdkRpcProvider = ConstructorParameters<
  typeof chainInfo.PrecompileChainInfoProvider
>[0];

// The SDK and this workspace resolve the same ethers runtime through different pnpm
// module paths. The official SDK accepts JsonRpcProvider; this cast removes only that
// duplicate private-field type identity without changing the runtime object.
const chainInfoProvider = new chainInfo.PrecompileChainInfoProvider(
  provider as unknown as SdkRpcProvider,
);
const supportedChains = await chainInfoProvider.getSupportedChains();
const sepolia = supportedChains.find(
  (chain) =>
    chain.chainKey === EXPECTED_SEPOLIA_CHAIN_KEY &&
    chain.chainId === EXPECTED_SEPOLIA_CHAIN_ID,
);

if (!sepolia) {
  throw new Error("Sepolia is not reported as chainKey 1 by the Creditcoin precompile");
}

const proofBuilderResponse = await fetch(proofBuilderUrl);
if (!proofBuilderResponse.ok) {
  throw new Error(`Proof Builder returned HTTP ${proofBuilderResponse.status}`);
}

console.log(
  JSON.stringify(
    {
      creditcoin: {
        chainId: Number(network.chainId),
        rpcUrl: creditcoinRpcUrl,
      },
      sourceChain: sepolia,
      proofBuilder: {
        url: proofBuilderUrl,
        status: proofBuilderResponse.status,
      },
    },
    null,
    2,
  ),
);

provider.destroy();
