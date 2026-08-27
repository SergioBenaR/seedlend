import { proofProvider } from "@gluwa/usc-sdk";
import {
  Contract,
  type JsonRpcApiProvider,
  type TransactionResponse,
} from "ethers";

export type PositionProofData = proofProvider.ContinuityResponse;

export interface PositionActivationArgs {
  loanId: bigint;
  chainKey: number;
  blockHeight: number;
  encodedTransaction: string;
  merkleRoot: string;
  siblings: PositionProofData["merkleProof"]["siblings"];
  lowerEndpointDigest: string;
  continuityRoots: string[];
}

export async function generateProofFor(
  transactionHash: string,
  chainKey: number,
  proofBuilderUrl: string,
  creditcoinProvider: JsonRpcApiProvider,
  sourceProvider: JsonRpcApiProvider,
): Promise<PositionProofData> {
  const transaction = await sourceProvider.getTransaction(transactionHash);
  if (!transaction) {
    throw new Error(`Source transaction not found: ${transactionHash}`);
  }
  if (transaction.blockNumber === null) {
    throw new Error(`Source transaction is not mined: ${transactionHash}`);
  }

  const proofBuilder = new proofProvider.service.ProofBuilder(
    chainKey,
    proofBuilderUrl,
  );

  await proofBuilder.waitUntilHeightAttested(
    chainKey,
    transaction.blockNumber,
  );

  const proofResult = await proofBuilder.getProof(transactionHash);
  if (!proofResult.success || !proofResult.data) {
    throw new Error(
      `Attestcoin proof generation failed: ${proofResult.error ?? "unknown error"}`,
    );
  }

  return proofResult.data;
}

export function buildPositionActivationArgs(
  loanId: bigint,
  proof: PositionProofData,
): PositionActivationArgs {
  return {
    loanId,
    chainKey: proof.chainKey,
    blockHeight: proof.headerNumber,
    encodedTransaction: proof.txBytes,
    merkleRoot: proof.merkleProof.root,
    siblings: proof.merkleProof.siblings,
    lowerEndpointDigest: proof.continuityProof.lowerEndpointDigest,
    continuityRoots: proof.continuityProof.roots,
  };
}

export async function estimatePositionActivationGas(
  contract: Contract,
  args: PositionActivationArgs,
): Promise<bigint> {
  try {
    const estimate = await contract.activateFromPositionProof.estimateGas(
      ...activationValues(args),
    );
    return (estimate * 135n) / 100n;
  } catch {
    // Creditcoin's official example notes that estimation may fail for precompile calls.
    // Keep a conservative floor while still scaling with the continuity proof length.
    const proofSizedEstimate = 41_000n + BigInt(args.continuityRoots.length || 1) * 5_000n;
    return proofSizedEstimate > 500_000n ? proofSizedEstimate : 500_000n;
  }
}

export async function submitPositionActivation(
  contract: Contract,
  args: PositionActivationArgs,
  gasLimit: bigint,
): Promise<TransactionResponse> {
  return contract.activateFromPositionProof(...activationValues(args), {
    gasLimit,
  }) as Promise<TransactionResponse>;
}

function activationValues(args: PositionActivationArgs) {
  return [
    args.loanId,
    args.chainKey,
    args.blockHeight,
    args.encodedTransaction,
    args.merkleRoot,
    args.siblings,
    args.lowerEndpointDigest,
    args.continuityRoots,
  ] as const;
}
