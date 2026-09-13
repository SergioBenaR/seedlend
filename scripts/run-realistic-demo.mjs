import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourcePath = path.join(root, "scripts/run-testnet-e2e.mjs");
const generatedPath = path.join(root, "scripts/.generated-realistic-demo.mjs");

let source = readFileSync(sourcePath, "utf8");

function replaceOnce(from, to) {
  const count = source.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`Expected exactly one match for: ${from.slice(0, 80)} (found ${count})`);
  }
  source = source.replace(from, to);
}

function replaceAllExact(from, to, expectedCount) {
  const count = source.split(from).length - 1;
  if (count !== expectedCount) {
    throw new Error(`Expected ${expectedCount} matches for: ${from.slice(0, 80)} (found ${count})`);
  }
  source = source.split(from).join(to);
}

// Testnet demo terms only. These are deliberately NOT production pricing terms.
// Approved demo terms: 100 tCTC principal, 5 payments of 21 tCTC, 105 tCTC total due.
// The extra 5 tCTC is total interest; no APR is claimed because no repayment period is defined.
replaceOnce(
  "const TOTAL_DUE = 108n * 10n ** 18n;",
  "const TOTAL_DUE = 105n * 10n ** 18n;",
);
replaceOnce(
  "const INSTALLMENT = 36n * 10n ** 18n;",
  "const INSTALLMENT = 21n * 10n ** 18n;",
);
replaceOnce(
  'const statePath = path.join(deploymentDir, "e2e.json");',
  'const statePath = path.join(deploymentDir, "e2e-realistic.json");',
);
replaceOnce(
  "    const target = 110n * 10n ** 18n;",
  "    const target = 110n * 10n ** 18n;",
);
replaceOnce(
  '        "Fund borrower 110 tCTC",',
  '        "Fund borrower for 5 × 21 tCTC demo repayments",',
);
replaceOnce(
  '    if (countBefore !== 0n) {\n      fail(`Loan contract already contains ${countBefore} loan(s) without local checkpoint`);\n    }\n\n',
  "",
);
replaceAllExact(
  '${INSTALLMENT},3,${SEP_CHAIN}',
  '${INSTALLMENT},5,${SEP_CHAIN}',
  2,
);
replaceOnce(
  '  console.log("=== T18 THREE REPAYMENTS ===");',
  '  console.log("=== T18 FIVE REPAYMENTS ===");',
);
replaceOnce(
  "  for (let i = Number(paymentCountBefore); i < 3; i++) {",
  "  for (let i = Number(paymentCountBefore); i < 5; i++) {",
);
replaceOnce(
  "      `Repayment ${i + 1}/3`,",
  "      `Repayment ${i + 1}/5`,",
);
replaceOnce(
  "  if (finalPaymentCount !== 3n) fail(`Expected 3 payments, got ${finalPaymentCount}`);",
  "  if (finalPaymentCount !== 5n) fail(`Expected 5 payments, got ${finalPaymentCount}`);",
);
replaceOnce(
  "  const finalTx = state.repaymentTxs[2];",
  "  const finalTx = state.repaymentTxs[4];",
);
replaceOnce(
  '  console.log("Payments: 3");',
  '  console.log("Payments: 5");',
);
replaceOnce(
  '    "- Total due: 108 tCTC",',
  '    "- Total due: 105 tCTC",',
);
replaceOnce(
  '    "- Demonstration payments: 3 × 36 tCTC",',
  '    "- Demonstration payments: 5 × 21 tCTC",',
);
replaceOnce(
  '    `8. Repayment 1: ${ccExplorer}/tx/${state.repaymentTxs[0]}`,\n    `9. Repayment 2: ${ccExplorer}/tx/${state.repaymentTxs[1]}`,\n    `10. Repayment 3 / LoanPaid / ReleaseEligible: ${ccExplorer}/tx/${state.repaymentTxs[2]}`,',
  '    `8. Repayment 1: ${ccExplorer}/tx/${state.repaymentTxs[0]}`,\n    `9. Repayment 2: ${ccExplorer}/tx/${state.repaymentTxs[1]}`,\n    `10. Repayment 3: ${ccExplorer}/tx/${state.repaymentTxs[2]}`,\n    `11. Repayment 4: ${ccExplorer}/tx/${state.repaymentTxs[3]}`,\n    `12. Repayment 5 / LoanPaid / ReleaseEligible: ${ccExplorer}/tx/${state.repaymentTxs[4]}`,',
);
replaceOnce(
  '    "- Payment records: 3",',
  '    "- Payment records: 5",',
);

source = source.replace(
  '"This is a testnet-only hackathon demonstration. SLDP is an unbacked demo asset and represents no legal claim or promised return.",',
  '"This is a testnet-only hackathon demonstration. The demo uses 100 tCTC principal repaid as 5 × 21 tCTC, for 5 tCTC total interest. No APR is claimed because no repayment period is defined. These are not SeedLend production pricing terms. SLDP is an unbacked demo asset and represents no legal claim or promised return.",',
);

writeFileSync(generatedPath, source);

console.log("Running SeedLend realistic testnet demo:");
console.log("- Principal: 100 tCTC");
console.log("- Position: 100 SLDP");
console.log("- Repayments: 5 × 21 tCTC");
console.log("- Total due: 105 tCTC");
console.log("- Total demo interest: 5 tCTC · no APR claim");
console.log("");

const result = spawnSync(process.execPath, [generatedPath], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
