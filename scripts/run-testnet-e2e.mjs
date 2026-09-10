import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const deploymentDir = path.join(root, ".deployments");
const env = loadEnv(path.join(root, ".env"));

const DEPLOYER_PK = required("DEPLOYER_PRIVATE_KEY");
const DEPLOYER = required("DEPLOYER_ADDRESS");
const CC_RPC = required("CREDITCOIN_RPC_URL");
const SEP_RPC = required("SEPOLIA_RPC_URL");
const CC_CHAIN = required("CREDITCOIN_CHAIN_ID");
const SEP_CHAIN = required("SEPOLIA_CHAIN_ID");
const PROOF_BUILDER = required("CREDITCOIN_PROOF_BUILDER_URL");
const SOURCE_CHAIN_KEY = required("SOURCE_CHAIN_KEY");

if (!/^0x[0-9a-fA-F]{64}$/.test(DEPLOYER_PK)) {
  fail("DEPLOYER_PRIVATE_KEY inválida");
}

const deploymentsPath = path.join(deploymentDir, "testnets.json");
if (!existsSync(deploymentsPath)) fail("Falta .deployments/testnets.json");

const deployments = JSON.parse(readFileSync(deploymentsPath, "utf8"));

const ASSET = deployments.contracts.demoPositionAsset.address;
const VAULT = deployments.contracts.seedLendVault.address;
const LOAN = deployments.contracts.seedLendLoan.address;
const DECODER = deployments.contracts.evmV1Decoder.address;

const PRINCIPAL = 100n * 10n ** 18n;
const TOTAL_DUE = 108n * 10n ** 18n;
const INSTALLMENT = 36n * 10n ** 18n;
const POSITION = 100n * 10n ** 18n;

mkdirSync(deploymentDir, { recursive: true });

const statePath = path.join(deploymentDir, "e2e.json");
const borrowerKeyPath = path.join(deploymentDir, "borrower-private-key.txt");

let state = existsSync(statePath)
  ? JSON.parse(readFileSync(statePath, "utf8"))
  : { version: 1, repaymentTxs: [] };

try {
  console.log("=== T13 VERIFY DEPLOYMENTS ===");

  checkEqual(
    run("cast", ["chain-id", "--rpc-url", SEP_RPC], "Sepolia chain"),
    SEP_CHAIN,
    "Sepolia chain ID",
  );
  checkEqual(
    run("cast", ["chain-id", "--rpc-url", CC_RPC], "Creditcoin chain"),
    CC_CHAIN,
    "Creditcoin chain ID",
  );

  assertCode(SEP_RPC, ASSET, "DemoPositionAsset");
  assertCode(SEP_RPC, VAULT, "SeedLendVault");
  assertCode(CC_RPC, LOAN, "SeedLendLoan");
  assertCode(CC_RPC, DECODER, "EvmV1Decoder");

  const contractOriginator = firstToken(
    run("cast", ["call", LOAN, "originator()(address)", "--rpc-url", CC_RPC], "originator"),
  );

  if (contractOriginator.toLowerCase() !== DEPLOYER.toLowerCase()) {
    fail("SeedLendLoan originator no coincide con deployer");
  }

  console.log("Deployments: VERIFIED");

  console.log("=== BORROWER TESTNET ===");

  const borrowerPk = ensureBorrowerKey();
  const borrower = firstToken(
    run(
      "cast",
      ["wallet", "address", "--private-key", borrowerPk],
      "derive borrower",
      [borrowerPk],
    ),
  );

  if (state.borrower && state.borrower.toLowerCase() !== borrower.toLowerCase()) {
    fail("Borrower local no coincide con checkpoint");
  }

  state.borrower = borrower;
  saveState();

  console.log(`Borrower: ${borrower}`);

  if (!state.fundingTx) {
    const currentBalance = toBigInt(
      run("cast", ["balance", borrower, "--rpc-url", CC_RPC], "borrower balance"),
    );

    const target = 110n * 10n ** 18n;

    if (currentBalance < target) {
      state.fundingTx = send(
        borrower,
        ["--value", (target - currentBalance).toString()],
        CC_RPC,
        DEPLOYER_PK,
        "Fund borrower 110 tCTC",
      );
    } else {
      state.fundingTx = "already-funded";
    }

    saveState();
  }

  console.log("=== T14 CREATE LOAN ===");

  let loanId;

  if (state.loanId) {
    loanId = BigInt(state.loanId);
    console.log(`Loan already checkpointed: ${loanId}`);
  } else {
    const countBefore = toBigInt(
      run("cast", ["call", LOAN, "loanCount()(uint256)", "--rpc-url", CC_RPC], "loanCount"),
    );

    if (countBefore !== 0n) {
      fail(`Loan contract already contains ${countBefore} loan(s) without local checkpoint`);
    }

    const termsTuple =
      `(${borrower},${PRINCIPAL},${TOTAL_DUE},${INSTALLMENT},3,${SEP_CHAIN},${VAULT},${ASSET})`;

    state.createLoanTx = send(
      LOAN,
      [
        "createLoan((address,uint256,uint256,uint256,uint16,uint64,address,address))",
        termsTuple,
      ],
      CC_RPC,
      DEPLOYER_PK,
      "Create loan",
    );

    loanId = toBigInt(
      run("cast", ["call", LOAN, "loanCount()(uint256)", "--rpc-url", CC_RPC], "loanCount"),
    );

    if (loanId !== countBefore + 1n) fail("loanCount no incrementó correctamente");

    state.loanId = loanId.toString();
    saveState();
  }

  const termsTuple =
    `(${borrower},${PRINCIPAL},${TOTAL_DUE},${INSTALLMENT},3,${SEP_CHAIN},${VAULT},${ASSET})`;

  const termsHash = firstToken(
    run(
      "cast",
      [
        "call",
        LOAN,
        "computeTermsHash(uint256,(address,uint256,uint256,uint256,uint16,uint64,address,address))(bytes32)",
        loanId.toString(),
        termsTuple,
        "--rpc-url",
        CC_RPC,
      ],
      "termsHash",
    ),
  );

  state.termsHash = termsHash;
  saveState();

  console.log(`Loan ID: ${loanId}`);
  console.log(`termsHash: ${termsHash}`);

  console.log("=== T15 LOCK POSITION ON SEPOLIA ===");

  if (!state.approveTx) {
    const allowance = toBigInt(
      run(
        "cast",
        [
          "call",
          ASSET,
          "allowance(address,address)(uint256)",
          DEPLOYER,
          VAULT,
          "--rpc-url",
          SEP_RPC,
        ],
        "SLDP allowance",
      ),
    );

    if (allowance < POSITION) {
      state.approveTx = send(
        ASSET,
        ["approve(address,uint256)", VAULT, POSITION.toString()],
        SEP_RPC,
        DEPLOYER_PK,
        "Approve 100 SLDP",
      );
    } else {
      state.approveTx = "already-approved";
    }

    saveState();
  }

  if (!state.lockTx) {
    const positionTuple =
      `(${loanId},${borrower},${DEPLOYER},${ASSET},${PRINCIPAL},${POSITION},${termsHash})`;

    state.lockTx = send(
      VAULT,
      [
        "lockPosition((uint256,address,address,address,uint256,uint256,bytes32))",
        positionTuple,
      ],
      SEP_RPC,
      DEPLOYER_PK,
      "Lock 100 SLDP",
    );

    saveState();
  }

  console.log(`PositionLocked TX: ${state.lockTx}`);

  console.log("=== T16–T17 ATTESTCOIN → ACTIVATE ===");

  if (!state.activationTx) {
    console.log("Esperando confirmación/attestation de Sepolia; esto puede tardar varios minutos...");

    const activationOutput = run(
      "pnpm",
      [
        "--filter",
        "@seedlend/worker",
        "activate-position",
        loanId.toString(),
        state.lockTx,
      ],
      "Attestcoin activation",
      [DEPLOYER_PK],
      3_600_000,
    );

    console.log(redact(activationOutput, [DEPLOYER_PK]));

    const match = activationOutput.match(
      /Attestcoin proof submitted:\s*(0x[0-9a-fA-F]{64})/,
    );

    if (!match) fail("No pude recuperar el hash de la activación Attestcoin");

    state.activationTx = match[1];
    saveState();
  }

  console.log(`Activation TX: ${state.activationTx}`);

  console.log("=== T18 THREE REPAYMENTS ===");

  const paymentCountBefore = toBigInt(
    run(
      "cast",
      [
        "call",
        LOAN,
        "getPaymentCount(uint256)(uint256)",
        loanId.toString(),
        "--rpc-url",
        CC_RPC,
      ],
      "payment count",
    ),
  );

  state.repaymentTxs ??= [];

  if (paymentCountBefore !== BigInt(state.repaymentTxs.length)) {
    fail(
      `Checkpoint/payment mismatch: chain=${paymentCountBefore}, local=${state.repaymentTxs.length}. No se enviaron pagos adicionales.`,
    );
  }

  for (let i = Number(paymentCountBefore); i < 3; i++) {
    const tx = send(
      LOAN,
      [
        "repay(uint256)",
        loanId.toString(),
        "--value",
        INSTALLMENT.toString(),
      ],
      CC_RPC,
      borrowerPk,
      `Repayment ${i + 1}/3`,
    );

    state.repaymentTxs.push(tx);
    saveState();
  }

  console.log("=== T19 FINAL VERIFICATION ===");

  const finalPaymentCount = toBigInt(
    run(
      "cast",
      [
        "call",
        LOAN,
        "getPaymentCount(uint256)(uint256)",
        loanId.toString(),
        "--rpc-url",
        CC_RPC,
      ],
      "final payment count",
    ),
  );

  const remaining = toBigInt(
    run(
      "cast",
      [
        "call",
        LOAN,
        "remainingBalance(uint256)(uint256)",
        loanId.toString(),
        "--rpc-url",
        CC_RPC,
      ],
      "remaining balance",
    ),
  );

  if (finalPaymentCount !== 3n) fail(`Expected 3 payments, got ${finalPaymentCount}`);
  if (remaining !== 0n) fail(`Expected zero balance, got ${remaining}`);

  const finalTx = state.repaymentTxs[2];
  const receiptRaw = run(
    "cast",
    ["receipt", finalTx, "--rpc-url", CC_RPC, "--json"],
    "final repayment receipt",
  );

  const receipt = JSON.parse(receiptRaw);
  const releaseTopic = firstToken(
    run(
      "cast",
      ["keccak", "ReleaseEligible(uint256,address,address,uint256)"],
      "ReleaseEligible topic",
    ),
  ).toLowerCase();

  const loanPaidTopic = firstToken(
    run("cast", ["keccak", "LoanPaid(uint256,uint256)"], "LoanPaid topic"),
  ).toLowerCase();

  const topics = (receipt.logs ?? [])
    .map((log) => log.topics?.[0]?.toLowerCase())
    .filter(Boolean);

  if (!topics.includes(releaseTopic)) fail("Final repayment lacks ReleaseEligible event");
  if (!topics.includes(loanPaidTopic)) fail("Final repayment lacks LoanPaid event");

  state.completed = true;
  state.completedAt = new Date().toISOString();
  state.finalPaymentCount = finalPaymentCount.toString();
  state.remainingBalance = remaining.toString();
  state.releaseEligible = true;
  saveState();

  writeEvidence({
    borrower,
    loanId,
    termsHash,
  });

  console.log("");
  console.log("=== E2E COMPLETE ===");
  console.log(`Loan ID: ${loanId}`);
  console.log(`Borrower: ${borrower}`);
  console.log(`PositionLocked: ${state.lockTx}`);
  console.log(`Attestcoin activation: ${state.activationTx}`);
  state.repaymentTxs.forEach((tx, i) =>
    console.log(`Repayment ${i + 1}: ${tx}`),
  );
  console.log("Payments: 3");
  console.log("Remaining: 0");
  console.log("ReleaseEligible: YES");
  console.log("Evidence: docs/testnet-evidence.md");
} catch (error) {
  console.error("");
  console.error("=== E2E STOPPED ===");
  console.error(redact(error instanceof Error ? error.message : String(error), [DEPLOYER_PK]));
  console.error("No vuelvas a ejecutar el script hasta revisar este punto.");
  process.exitCode = 1;
}

function writeEvidence({ borrower, loanId, termsHash }) {
  const ccExplorer = "https://creditcoin-testnet.blockscout.com";
  const sepExplorer = "https://sepolia.etherscan.io";

  const lines = [
    "# SeedLend public testnet evidence",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "This is a testnet-only hackathon demonstration. SLDP is an unbacked demo asset and represents no legal claim or promised return.",
    "",
    "## Actors",
    "",
    `- Originator / position funder: \`${DEPLOYER}\``,
    `- Borrower / payer: \`${borrower}\``,
    "",
    "## Deployed contracts",
    "",
    `- Sepolia DemoPositionAsset (SLDP): \`${ASSET}\``,
    `  - ${sepExplorer}/address/${ASSET}`,
    `- Sepolia SeedLendVault: \`${VAULT}\``,
    `  - ${sepExplorer}/address/${VAULT}`,
    `- Creditcoin CC3 SeedLendLoan: \`${LOAN}\``,
    `  - ${ccExplorer}/address/${LOAN}`,
    `- Creditcoin CC3 EvmV1Decoder: \`${DECODER}\``,
    "",
    "The SLDP and SeedLendLoan addresses are identical numerically but exist on different EVM chains.",
    "",
    "## End-to-end lifecycle",
    "",
    `- Loan ID: \`${loanId}\``,
    "- Principal: 100 tCTC",
    "- Total due: 108 tCTC",
    "- Demonstration payments: 3 × 36 tCTC",
    "- Position: 100 SLDP",
    `- Terms hash: \`${termsHash}\``,
    "",
    `1. Demo asset deployment: ${sepExplorer}/tx/${deployments.contracts.demoPositionAsset.transactionHash}`,
    `2. Vault deployment: ${sepExplorer}/tx/${deployments.contracts.seedLendVault.transactionHash}`,
    `3. Creditcoin loan deployment: ${ccExplorer}/tx/${deployments.contracts.seedLendLoan.transactionHash}`,
    ...(state.fundingTx && state.fundingTx !== "already-funded"
      ? [`4. Borrower funding: ${ccExplorer}/tx/${state.fundingTx}`]
      : []),
    ...(state.approveTx && state.approveTx !== "already-approved"
      ? [`5. SLDP approval: ${sepExplorer}/tx/${state.approveTx}`]
      : []),
    `6. PositionLocked: ${sepExplorer}/tx/${state.lockTx}`,
    `7. Attestcoin proof / activation: ${ccExplorer}/tx/${state.activationTx}`,
    `8. Repayment 1: ${ccExplorer}/tx/${state.repaymentTxs[0]}`,
    `9. Repayment 2: ${ccExplorer}/tx/${state.repaymentTxs[1]}`,
    `10. Repayment 3 / LoanPaid / ReleaseEligible: ${ccExplorer}/tx/${state.repaymentTxs[2]}`,
    "",
    "## Verified final state",
    "",
    "- Payment records: 3",
    "- Remaining balance: 0 tCTC",
    "- LoanPaid emitted: yes",
    "- ReleaseEligible emitted: yes",
    `- Attestcoin Proof Builder: ${PROOF_BUILDER}`,
    `- Source chain: Sepolia, chainKey ${SOURCE_CHAIN_KEY}`,
    "",
  ];

  writeFileSync(path.join(root, "docs/testnet-evidence.md"), `${lines.join("\n")}\n`);
}

function ensureBorrowerKey() {
  if (existsSync(borrowerKeyPath)) {
    const existing = readFileSync(borrowerKeyPath, "utf8").trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(existing)) fail("Stored borrower key inválida");
    return existing;
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `0x${randomBytes(32).toString("hex")}`;
    const result = spawnSync(
      "cast",
      ["wallet", "address", "--private-key", candidate],
      { encoding: "utf8", env },
    );

    if (result.status === 0) {
      writeFileSync(borrowerKeyPath, `${candidate}\n`, { mode: 0o600 });
      chmodSync(borrowerKeyPath, 0o600);
      return candidate;
    }
  }

  fail("No se pudo generar borrower testnet");
}

function assertCode(rpc, address, label) {
  const code = firstToken(
    run("cast", ["code", address, "--rpc-url", rpc], `${label} bytecode`),
  );
  if (!code || code === "0x") fail(`${label} has no deployed bytecode`);
  console.log(`${label}: VERIFIED`);
}

function send(to, args, rpc, key, label) {
  const raw = run(
    "cast",
    [
      "send",
      to,
      ...args,
      "--rpc-url",
      rpc,
      "--private-key",
      key,
      "--json",
    ],
    label,
    [key],
    300_000,
  );

  let receipt;
  try {
    receipt = JSON.parse(raw);
  } catch {
    fail(`${label}: cast did not return valid JSON`);
  }

  const tx = receipt.transactionHash ?? receipt.transaction_hash;

  if (!tx || !/^0x[0-9a-fA-F]{64}$/.test(tx)) {
    fail(`${label}: transaction hash missing`);
  }

  console.log(`${label}: ${tx}`);
  return tx;
}

function run(command, args, label, secrets = [], timeout = 300_000) {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    timeout,
  });

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";

  if (result.error || result.status !== 0) {
    const detail = redact(
      `${stdout}\n${stderr}\n${result.error?.message ?? ""}`.trim(),
      secrets,
    );
    throw new Error(`${label} failed:\n${detail}`);
  }

  return stdout.trim();
}

function loadEnv(file) {
  const loaded = { ...process.env };
  if (!existsSync(file)) return loaded;

  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    const value = rawValue.trim().replace(/^(['"])(.*)\1$/, "$2");
    if (!loaded[key]) loaded[key] = value;
  }

  return loaded;
}

function required(name) {
  const value = env[name]?.trim();
  if (!value) fail(`${name} is required`);
  return value;
}

function saveState() {
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  chmodSync(statePath, 0o600);
}

function toBigInt(value) {
  return BigInt(firstToken(value));
}

function firstToken(value) {
  return String(value).trim().split(/\s+/)[0];
}

function checkEqual(actual, expected, label) {
  if (firstToken(actual) !== String(expected)) {
    fail(`${label}: expected ${expected}, received ${actual}`);
  }
}

function redact(value, secrets = []) {
  let safe = String(value);
  for (const secret of secrets) {
    if (secret) safe = safe.split(secret).join("[REDACTED]");
  }
  return safe;
}

function fail(message) {
  throw new Error(message);
}
