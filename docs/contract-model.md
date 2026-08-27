# Contract model after T03–T05

## `SeedLendLoan` — Creditcoin

Implemented responsibilities:

- originator-only loan creation;
- canonical incremental `loanId`;
- validation and storage of borrower, amounts, installments and expected source position;
- `termsHash` tied to `loanId` and every material loan term;
- states `PendingPosition`, `Active` and `Paid`;
- public Attestcoin proof entry point and internal activation hook;
- internal payment recording, history, remaining balance and release-eligibility event;
- rejection of invalid transitions, zero payments and overpayments.

Not yet exposed:

- token transfer inside public `repay`;
- deployment configuration.

Attestcoin activation now requires:

- configured Sepolia `chainKey = 1` and EVM chain ID `11155111`;
- a successful source receipt verified by the native Creditcoin precompile;
- an event emitted by the loan's exact configured vault;
- exact `loanId`, borrower, asset, principal and `termsHash` matches;
- a positive position amount;
- an unused Attestcoin query identifier.

The internal hooks are exposed only by a test harness. Production callers cannot activate loans or record payments through those hooks.

## `SeedLendVault` — Sepolia

Implemented responsibilities:

- position-manager-only creation;
- exact ERC-20 transfer from a designated funder into the vault;
- rejection of fee-on-transfer or under-delivering assets;
- one immutable position per `loanId`;
- storage of borrower, funder, asset, principal, position amount, `termsHash` and lock time;
- exact `PositionLocked` event required by the cross-chain design.

Intentionally absent:

- release, transfer, liquidation and secondary-market functions;
- any statement that the generic ERC-20 is a legally backed RWA.

## Cross-chain invariant implemented in T05

Before calling the internal activation hook, the Creditcoin contract must prove and match:

- Sepolia as source chain;
- exact deployed `SeedLendVault` as event emitter;
- `PositionLocked` event signature;
- `loanId`, borrower, asset, principal and `termsHash`;
- positive `positionAmount`;
- Attestcoin query not previously processed.

## Current automated evidence

- `SeedLendLoan`: 16/16 Foundry tests passing across lifecycle and Attestcoin suites.
- `SeedLendVault`: 7/7 Foundry tests passing.
- Worker ABI and proof mapping: 2/2 Node tests passing and TypeScript typecheck passing.
- Solidity compiler: `0.8.30`.
- EVM target: `shanghai`.
- Foundry: `v1.2.3`.
