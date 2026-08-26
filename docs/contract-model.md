# Contract model after T03–T04

## `SeedLendLoan` — Creditcoin

Implemented responsibilities:

- originator-only loan creation;
- canonical incremental `loanId`;
- validation and storage of borrower, amounts, installments and expected source position;
- `termsHash` tied to `loanId` and every material loan term;
- states `PendingPosition`, `Active` and `Paid`;
- internal activation hook reserved for verified Attestcoin data;
- internal payment recording, history, remaining balance and release-eligibility event;
- rejection of invalid transitions, zero payments and overpayments.

Not yet exposed:

- Attestcoin proof entry point;
- token transfer inside public `repay`;
- deployment configuration.

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

## Cross-chain invariant for T05

Before calling the internal activation hook, the Creditcoin contract must prove and match:

- Sepolia as source chain;
- exact deployed `SeedLendVault` as event emitter;
- `PositionLocked` event signature;
- `loanId`, borrower, asset, principal and `termsHash`;
- positive `positionAmount`;
- source transaction not previously processed.

## Current automated evidence

- `SeedLendLoan`: 7/7 Foundry tests passing.
- `SeedLendVault`: 7/7 Foundry tests passing.
- Solidity compiler: `0.8.30`.
- EVM target: `shanghai`.
- Foundry: `v1.2.3`.
