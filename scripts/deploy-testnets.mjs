import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const sepoliaRoot = path.join(projectRoot, "contracts/sepolia");
const creditcoinRoot = path.join(projectRoot, "contracts/creditcoin");
const localForge = path.join(projectRoot, ".tools/foundry/forge");
const localCast = path.join(projectRoot, ".tools/foundry/cast");
const forge = existsSync(localForge) ? localForge : "forge";
const cast = existsSync(localCast) ? localCast : "cast";

export const OFFICIAL_DECODER_ADDRESS = "0x04B9ae8562D8Cc5bbbBbBB759080dDC30B56D18B";
const decoderSource =
  "../../node_modules/@gluwa/asc-contracts/contracts/common/EvmV1Decoder.sol:EvmV1Decoder";

export function redact(text, secrets = []) {
  return secrets.reduce(
    (safe, secret) => (secret ? safe.split(secret).join("[REDACTED]") : safe),
    String(text),
  );
}

export function parseForgeDeployment(output) {
  const address = firstMatch(output, [
    /"deployedTo"\s*:\s*"(0x[a-fA-F0-9]{40})"/,
    /"deployed_to"\s*:\s*"(0x[a-fA-F0-9]{40})"/,
    /Deployed to:\s*(0x[a-fA-F0-9]{40})/,
  ]);
  const transactionHash = firstMatch(output, [
    /"transactionHash"\s*:\s*"(0x[a-fA-F0-9]{64})"/,
    /"transaction_hash"\s*:\s*"(0x[a-fA-F0-9]{64})"/,
    /Transaction hash:\s*(0x[a-fA-F0-9]{64})/,
  ]);

  if (!address || !transactionHash) {
    throw new Error("Foundry did not return a deployment address and transaction hash");
  }
  return { address, transactionHash };
}

export function validateBroadcastConfig(environment) {
  const config = {
    creditcoinRpcUrl: required(environment, "CREDITCOIN_RPC_URL"),
    creditcoinChainId: positiveInteger(environment, "CREDITCOIN_CHAIN_ID"),
    sepoliaRpcUrl: required(environment, "SEPOLIA_RPC_URL"),
    sepoliaChainId: positiveInteger(environment, "SEPOLIA_CHAIN_ID"),
    sourceChainKey: positiveInteger(environment, "SOURCE_CHAIN_KEY"),
    deployerPrivateKey: required(environment, "DEPLOYER_PRIVATE_KEY"),
    deployerAddress: required(environment, "DEPLOYER_ADDRESS"),
    decoderAddress:
      environment.EVM_V1_DECODER_LIBRARY_ADDRESS?.trim() || OFFICIAL_DECODER_ADDRESS,
    demoAssetInitialSupply: positiveInteger(environment, "DEMO_ASSET_INITIAL_SUPPLY"),
  };

  validateUrl(config.creditcoinRpcUrl, "CREDITCOIN_RPC_URL");
  validateUrl(config.sepoliaRpcUrl, "SEPOLIA_RPC_URL");
  validateAddress(config.deployerAddress, "DEPLOYER_ADDRESS");
  validateAddress(config.decoderAddress, "EVM_V1_DECODER_LIBRARY_ADDRESS");
  if (!/^0x[a-fA-F0-9]{64}$/.test(config.deployerPrivateKey)) {
    throw new Error("DEPLOYER_PRIVATE_KEY must be a 32-byte 0x-prefixed testnet key");
  }
  return config;
}

function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = String(text).match(pattern);
    if (match) return match[1];
  }
  return null;
}

function required(environment, name) {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function positiveInteger(environment, name) {
  const value = required(environment, name);
  if (!/^\d+$/.test(value) || BigInt(value) === 0n) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function validateAddress(value, name) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`${name} must be a 20-byte 0x-prefixed address`);
  }
}

function validateUrl(value, name) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${name} must use http or https`);
  }
}

function loadLocalEnvironment() {
  const envPath = path.join(projectRoot, ".env");
  if (!existsSync(envPath)) return;

  for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^("|')(.*)\1$/, "$2");
  }
}

function run(command, args, label, secrets = []) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
    timeout: 180_000,
  });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();

  if (result.error || result.status !== 0) {
    const detail = redact(output || result.error?.message || "unknown error", secrets);
    throw new Error(`${label} failed: ${detail}`);
  }
  return output;
}

function build(decoderAddress) {
  run(forge, ["build", "--root", sepoliaRoot], "Sepolia contract build");
  run(
    forge,
    [
      "build",
      "--root",
      creditcoinRoot,
      "--libraries",
      `${decoderSource}:${decoderAddress}`,
    ],
    "Creditcoin contract build",
  );
}

function assertNetwork(rpcUrl, expectedChainId, name, secrets) {
  const actual = run(cast, ["chain-id", "--rpc-url", rpcUrl], `${name} chain check`, secrets).trim();
  if (actual !== expectedChainId) {
    throw new Error(`${name} chain mismatch: expected ${expectedChainId}, received ${actual}`);
  }
}

function assertFunded(rpcUrl, account, name, secrets) {
  const balance = run(
    cast,
    ["balance", account, "--rpc-url", rpcUrl],
    `${name} balance check`,
    secrets,
  ).trim();
  if (!/^\d+$/.test(balance) || BigInt(balance) === 0n) {
    throw new Error(`${name} deployer has no native testnet gas token`);
  }
}

function assertContractCode(rpcUrl, address, name, secrets) {
  const code = run(
    cast,
    ["code", address, "--rpc-url", rpcUrl],
    `${name} code check`,
    secrets,
  ).trim();
  if (!/^0x[a-fA-F0-9]+$/.test(code) || code === "0x") {
    throw new Error(`${name} has no deployed bytecode at ${address}`);
  }
}

function deploy({ root, contract, rpcUrl, privateKey, constructorArgs = [], libraries = [] }) {
  const args = [
    "create",
    contract,
    "--root",
    root,
    "--broadcast",
    "--json",
    "--rpc-url",
    rpcUrl,
    "--private-key",
    privateKey,
  ];
  if (libraries.length) args.push("--libraries", ...libraries);
  if (constructorArgs.length) args.push("--constructor-args", ...constructorArgs);

  return parseForgeDeployment(run(forge, args, contract, [privateKey]));
}

function writeCheckpoint(deployments) {
  const directory = path.join(projectRoot, ".deployments");
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    path.join(directory, "testnets.json"),
    `${JSON.stringify(deployments, null, 2)}\n`,
    { mode: 0o600 },
  );
}

function main() {
  const allowed = new Set(["--check", "--broadcast"]);
  const unexpected = process.argv.slice(2).filter((argument) => !allowed.has(argument));
  if (unexpected.length || process.argv.includes("--check") === process.argv.includes("--broadcast")) {
    throw new Error("Use exactly one mode: --check or --broadcast");
  }

  loadLocalEnvironment();
  const decoderAddress =
    process.env.EVM_V1_DECODER_LIBRARY_ADDRESS?.trim() || OFFICIAL_DECODER_ADDRESS;
  validateAddress(decoderAddress, "EVM_V1_DECODER_LIBRARY_ADDRESS");
  build(decoderAddress);

  if (process.argv.includes("--check")) {
    console.log("Deployment preparation check passed; no transaction was sent.");
    return;
  }

  const config = validateBroadcastConfig(process.env);
  const secrets = [
    config.deployerPrivateKey,
    config.sepoliaRpcUrl,
    config.creditcoinRpcUrl,
  ];
  const derivedAddress = run(
    cast,
    ["wallet", "address", "--private-key", config.deployerPrivateKey],
    "Deployer address check",
    secrets,
  ).trim();
  if (derivedAddress.toLowerCase() !== config.deployerAddress.toLowerCase()) {
    throw new Error("DEPLOYER_ADDRESS does not match DEPLOYER_PRIVATE_KEY");
  }

  assertNetwork(config.sepoliaRpcUrl, config.sepoliaChainId, "Sepolia", secrets);
  assertNetwork(
    config.creditcoinRpcUrl,
    config.creditcoinChainId,
    "Creditcoin",
    secrets,
  );
  assertFunded(config.sepoliaRpcUrl, config.deployerAddress, "Sepolia", secrets);
  assertFunded(
    config.creditcoinRpcUrl,
    config.deployerAddress,
    "Creditcoin",
    secrets,
  );
  assertContractCode(
    config.creditcoinRpcUrl,
    config.decoderAddress,
    "EvmV1Decoder",
    secrets,
  );

  const deployments = {
    generatedAt: new Date().toISOString(),
    deployer: config.deployerAddress,
    sourceChain: {
      chainId: config.sepoliaChainId,
      chainKey: config.sourceChainKey,
    },
    creditcoin: { chainId: config.creditcoinChainId },
    contracts: {},
  };

  deployments.contracts.demoPositionAsset = deploy({
    root: sepoliaRoot,
    contract: "src/DemoPositionAsset.sol:DemoPositionAsset",
    rpcUrl: config.sepoliaRpcUrl,
    privateKey: config.deployerPrivateKey,
    constructorArgs: [config.deployerAddress, config.demoAssetInitialSupply],
  });
  writeCheckpoint(deployments);

  deployments.contracts.seedLendVault = deploy({
    root: sepoliaRoot,
    contract: "src/SeedLendVault.sol:SeedLendVault",
    rpcUrl: config.sepoliaRpcUrl,
    privateKey: config.deployerPrivateKey,
    constructorArgs: [config.deployerAddress],
  });
  writeCheckpoint(deployments);

  deployments.contracts.seedLendLoan = deploy({
    root: creditcoinRoot,
    contract: "src/SeedLendLoan.sol:SeedLendLoan",
    rpcUrl: config.creditcoinRpcUrl,
    privateKey: config.deployerPrivateKey,
    constructorArgs: [
      config.deployerAddress,
      config.sepoliaChainId,
      config.sourceChainKey,
    ],
    libraries: [`${decoderSource}:${config.decoderAddress}`],
  });
  deployments.contracts.evmV1Decoder = {
    address: config.decoderAddress,
    deployment: "official-predeployed",
  };
  writeCheckpoint(deployments);

  console.log(JSON.stringify(deployments, null, 2));
  console.log("Deployment addresses were also saved to .deployments/testnets.json.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
