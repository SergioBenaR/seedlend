# T05 — Attestcoin position verification

## Verified implementation basis

Reviewed on 27 August 2026:

- official repository: <https://github.com/gluwa/attestcoin-protocol-examples>, commit `40541b1063d7795ac153a09d9d72f2b2feef10f6`;
- official loan-flow contract and worker;
- `@gluwa/usc-sdk@0.18.0`;
- `@gluwa/usc-contracts@0.1.2`;
- Creditcoin native verifier address: `0x0000000000000000000000000000000000000FD2`;
- Sepolia Attestcoin key: `1`;
- Sepolia EVM chain ID: `11155111`.

## Destination verification

`SeedLendLoan.activateFromPositionProof` accepts the official proof fields:

- source chain key and block height;
- encoded source transaction;
- Merkle root and siblings;
- lower continuity endpoint and continuity roots.

The contract calls the native Creditcoin verifier, computes and consumes the official query identifier, decodes the proven EVM receipt and activates the loan only when the receipt contains the exact expected `PositionLocked` event.

The match covers the configured vault address, `loanId`, borrower, asset, principal, positive position amount and `termsHash`. Failed receipts, wrong chains, mismatched events, rejected proofs and replayed queries revert.

## Worker flow

`worker/src/activate-position.ts` receives a loan ID and Sepolia transaction hash. It first confirms the expected source event, waits for attestation, obtains the proof from the official Proof Builder and submits it to Creditcoin. The destination contract remains the security boundary; the worker's preliminary event check improves failure reporting but is not trusted for activation.

## Verification boundary

Local contract compilation, unit tests and worker typechecking are complete. A live proof cannot be claimed until the contracts are deployed and an actual `PositionLocked` transaction is executed on Sepolia.

`EvmV1Decoder` contains public library functions, so its deployed address must be linked when deploying `SeedLendLoan`, as required by the official example.
