import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

const requiredFiles = [
  "README.md",
  ".env.example",
  "contracts/creditcoin/foundry.toml",
  "contracts/creditcoin/src/SeedLendLoan.sol",
  "contracts/sepolia/foundry.toml",
  "contracts/sepolia/src/DemoPositionAsset.sol",
  "contracts/sepolia/src/SeedLendVault.sol",
  "docs/architecture.md",
  "docs/decision-log.md",
  "docs/t06-deployment.md",
  "scripts/deploy-testnets.mjs",
];

test("the scaffold contains every required foundation file", async () => {
  for (const path of requiredFiles) {
    const contents = await readFile(new URL(path, root), "utf8");
    assert.ok(contents.length > 0, `${path} must not be empty`);
  }
});

test("the environment template separates public defaults from private inputs", async () => {
  const template = await readFile(new URL(".env.example", root), "utf8");
  const entries = template
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=", 2));
  const values = Object.fromEntries(entries);

  assert.equal(values.CREDITCOIN_CHAIN_ID, "102031");
  assert.equal(values.SOURCE_CHAIN_KEY, "1");
  assert.equal(values.SEPOLIA_CHAIN_ID, "11155111");

  for (const key of [
    "DEPLOYER_PRIVATE_KEY",
    "DEPLOYER_ADDRESS",
    "SEPOLIA_RPC_URL",
    "SEEDLEND_LOAN_ADDRESS",
    "SEEDLEND_VAULT_ADDRESS",
    "DEMO_ASSET_ADDRESS",
  ]) {
    assert.equal(values[key], "", `${key} must remain unset`);
  }

  assert.equal(
    values.EVM_V1_DECODER_LIBRARY_ADDRESS,
    "0x04B9ae8562D8Cc5bbbBbBB759080dDC30B56D18B",
  );
});

test("real environment files are ignored", async () => {
  const gitignore = await readFile(new URL(".gitignore", root), "utf8");
  assert.match(gitignore, /^\.env$/m);
  assert.match(gitignore, /^!\.env\.example$/m);
});
