import "dotenv/config";

import {
  Contract,
  JsonRpcProvider,
  Wallet,
  getAddress,
  isHexString,
} from "ethers";

import { seedLendLoanAbi, seedLendVaultAbi } from "./contracts.js";
import {
  buildPositionActivationArgs,
  estimatePositionActivationGas,
  generateProofFor,
  submitPositionActivation,
} from "./proof.js";

const [loanIdInput, sourceTransactionHash] = process.argv.slice(2);
if (!loanIdInput || !/^\d+$/.test(loanIdInput) || BigInt(loanIdInput) === 0n) {
  throw new Error("Usage: pnpm activate-position <loanId> <sourceTransactionHash>");
}
if (!sourceTransactionHash || !isHexString(sourceTransactionHash, 32)) {
  throw new Error("A 32-byte Sepolia transaction hash is required");
}

const loanId = BigInt(loanIdInput);
const creditcoinRpcUrl = required("CREDITCOIN_RPC_URL");
const sepoliaRpcUrl = required("SEPOLIA_RPC_URL");
const proofBuilderUrl = required("CREDITCOIN_PROOF_BUILDER_URL");
const privateKey = required("DEPLOYER_PRIVATE_KEY");
const loanAddress = getAddress(required("SEEDLEND_LOAN_ADDRESS"));
const vaultAddress = getAddress(required("SEEDLEND_VAULT_ADDRESS"));
const sourceChainKey = Number(required("SOURCE_CHAIN_KEY"));
if (!Number.isSafeInteger(sourceChainKey) || sourceChainKey <= 0) {
  throw new Error("SOURCE_CHAIN_KEY must be a positive integer");
}

const creditcoinProvider = new JsonRpcProvider(creditcoinRpcUrl);
const sepoliaProvider = new JsonRpcProvider(sepoliaRpcUrl);
const wallet = new Wallet(privateKey, creditcoinProvider);
const loanContract = new Contract(loanAddress, seedLendLoanAbi, wallet);
const vaultContract = new Contract(vaultAddress, seedLendVaultAbi, sepoliaProvider);

try {
  await assertPositionEvent(vaultContract, sourceTransactionHash, loanId);
  console.log(`PositionLocked confirmed for loan ${loanId} on Sepolia`);

  const proof = await generateProofFor(
    sourceTransactionHash,
    sourceChainKey,
    proofBuilderUrl,
    creditcoinProvider,
    sepoliaProvider,
  );
  if (proof.chainKey !== sourceChainKey) {
    throw new Error(
      `Proof chain key mismatch: expected ${sourceChainKey}, received ${proof.chainKey}`,
    );
  }

  const args = buildPositionActivationArgs(loanId, proof);
  const gasLimit = await estimatePositionActivationGas(loanContract, args);
  const transaction = await submitPositionActivation(
    loanContract,
    args,
    gasLimit,
  );
  console.log(`Attestcoin proof submitted: ${transaction.hash}`);

  const receipt = await transaction.wait();
  if (!receipt || receipt.status !== 1) {
    throw new Error("Creditcoin proof transaction failed");
  }
  console.log(`Loan ${loanId} activated on Creditcoin`);
} finally {
  creditcoinProvider.destroy();
  sepoliaProvider.destroy();
}

async function assertPositionEvent(
  vaultContract: Contract,
  transactionHash: string,
  expectedLoanId: bigint,
) {
  const receipt = await sepoliaProvider.getTransactionReceipt(transactionHash);
  if (!receipt || receipt.status !== 1) {
    throw new Error("Sepolia transaction is missing or failed");
  }

  const expectedVault = (await vaultContract.getAddress()).toLowerCase();
  const found = receipt.logs.some((log) => {
    if (log.address.toLowerCase() !== expectedVault) return false;
    try {
      const parsed = vaultContract.interface.parseLog(log);
      return parsed?.name === "PositionLocked" && parsed.args.loanId === expectedLoanId;
    } catch {
      return false;
    }
  });

  if (!found) {
    throw new Error(
      `Transaction does not contain PositionLocked for loan ${expectedLoanId}`,
    );
  }
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}
