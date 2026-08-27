import assert from "node:assert/strict";
import test from "node:test";

import type { proofProvider } from "@gluwa/usc-sdk";
import { Interface } from "ethers";

import { seedLendLoanAbi } from "../src/contracts.js";
import { buildPositionActivationArgs } from "../src/proof.js";

test("exposes the exact proof-submission function in the worker ABI", () => {
  const contractInterface = new Interface(seedLendLoanAbi);
  const activation = contractInterface.getFunction("activateFromPositionProof");

  assert.ok(activation);
  assert.equal(activation.inputs.length, 8);
});

test("maps the official Attestcoin proof response to SeedLend activation arguments", () => {
  const proof = {
    chainKey: 1,
    headerNumber: 12_345,
    txIndex: 7,
    txHash: `0x${"11".repeat(32)}`,
    txBytes: "0x1234",
    merkleProof: {
      root: `0x${"22".repeat(32)}`,
      siblings: [{ hash: `0x${"33".repeat(32)}`, isLeft: true }],
    },
    continuityProof: {
      lowerEndpointDigest: `0x${"44".repeat(32)}`,
      roots: [`0x${"55".repeat(32)}`],
    },
    cached: true,
    generatedAt: new Date("2026-08-27T00:00:00Z"),
  } satisfies proofProvider.ContinuityResponse;

  assert.deepEqual(buildPositionActivationArgs(9n, proof), {
    loanId: 9n,
    chainKey: 1,
    blockHeight: 12_345,
    encodedTransaction: "0x1234",
    merkleRoot: `0x${"22".repeat(32)}`,
    siblings: [{ hash: `0x${"33".repeat(32)}`, isLeft: true }],
    lowerEndpointDigest: `0x${"44".repeat(32)}`,
    continuityRoots: [`0x${"55".repeat(32)}`],
  });
});
