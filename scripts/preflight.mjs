import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

function inspect(command, args = ["--version"]) {
  try {
    const version = execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    return { available: true, version };
  } catch {
    return { available: false, version: null };
  }
}

const localForge = fileURLToPath(new URL("../.tools/foundry/forge", import.meta.url));
const checks = {
  node: inspect(process.execPath),
  git: inspect("git"),
  pnpm: inspect("pnpm"),
  forge: existsSync(localForge) ? inspect(localForge) : inspect("forge"),
  localEnvPresent: existsSync(new URL("../.env", import.meta.url)),
};

console.log(JSON.stringify(checks, null, 2));

if (!checks.node.available || !checks.git.available || !checks.pnpm.available) {
  process.exitCode = 1;
}

if (!checks.forge.available) {
  console.error("Foundry is not installed; Solidity tests and deployments remain blocked.");
  process.exitCode = 1;
}
