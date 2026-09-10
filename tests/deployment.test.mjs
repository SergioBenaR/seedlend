import assert from "node:assert/strict";
import test from "node:test";

import {
  OFFICIAL_DECODER_ADDRESS,
  parseForgeDeployment,
  redact,
  validateBroadcastConfig,
} from "../scripts/deploy-testnets.mjs";

const validEnvironment = {
  CREDITCOIN_RPC_URL: "https://creditcoin.example",
  CREDITCOIN_CHAIN_ID: "102031",
  SEPOLIA_RPC_URL: "https://sepolia.example",
  SEPOLIA_CHAIN_ID: "11155111",
  SOURCE_CHAIN_KEY: "1",
  DEPLOYER_PRIVATE_KEY: `0x${"1".repeat(64)}`,
  DEPLOYER_ADDRESS: `0x${"2".repeat(40)}`,
  EVM_V1_DECODER_LIBRARY_ADDRESS: OFFICIAL_DECODER_ADDRESS,
  DEMO_ASSET_INITIAL_SUPPLY: "1000000000000000000000000",
};

test("parses Foundry JSON deployment output", () => {
  const parsed = parseForgeDeployment(
    JSON.stringify({
      deployer: `0x${"1".repeat(40)}`,
      deployedTo: `0x${"2".repeat(40)}`,
      transactionHash: `0x${"3".repeat(64)}`,
    }),
  );

  assert.equal(parsed.address, `0x${"2".repeat(40)}`);
  assert.equal(parsed.transactionHash, `0x${"3".repeat(64)}`);
});

test("validates all safety-critical deployment inputs", () => {
  const config = validateBroadcastConfig(validEnvironment);
  assert.equal(config.creditcoinChainId, "102031");
  assert.equal(config.sepoliaChainId, "11155111");
  assert.equal(config.decoderAddress, OFFICIAL_DECODER_ADDRESS);

  assert.throws(
    () => validateBroadcastConfig({ ...validEnvironment, DEPLOYER_PRIVATE_KEY: "unsafe" }),
    /32-byte/,
  );
  assert.throws(
    () => validateBroadcastConfig({ ...validEnvironment, SEPOLIA_RPC_URL: "file:///tmp/rpc" }),
    /http or https/,
  );
});

test("redacts private keys from command failures", () => {
  const secret = validEnvironment.DEPLOYER_PRIVATE_KEY;
  assert.equal(redact(`failure: ${secret}`, [secret]), "failure: [REDACTED]");
});
