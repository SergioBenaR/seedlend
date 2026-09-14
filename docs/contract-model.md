# Contract model after T03–T10

## `SeedLendLoan` — Creditcoin

Implemented responsibilities:

- originator-only loan creation;
- canonical incremental `loanId`;
- validation and storage of borrower, amounts, installments and expected source position;
- `termsHash` tied to `loanId` and every material loan term;
- states `PendingPosition`, `Active` and `Paid`;
- public Attestcoin proof entry point and internal activation hook;
- public native-tCTC repayment through `repay(uint256 loanId) payable`;
- immediate forwarding of each successful payment to the `originator`;
- on-chain payer, amount and timestamp history plus remaining balance;
- transition to `Paid` with `LoanPaid` and `ReleaseEligible` events at `totalDue`;
- rejection of inactive-loan payments, zero payments, overpayments, failed forwarding and
  repayment reentry.

Not yet exposed:

- deployment configuration.

Attestcoin activation now requires:

- configured Sepolia `chainKey = 1` and EVM chain ID `11155111`;
- a successful source receipt verified by the native Creditcoin precompile;
- an event emitted by the loan's exact configured vault;
- exact `loanId`, borrower, asset, principal and `termsHash` matches;
- a positive position amount;
- an unused Attestcoin query identifier.

The internal activation hook is exposed only by a test harness. Production callers cannot activate
loans through that hook.

The final public demo uses 100 tCTC principal, 105 tCTC total due and five demonstration payments of
21 tCTC. The contract does not impose payment dates or require each payment to equal 21 tCTC.

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

- Creditcoin contracts: 20/20 Foundry tests passing across lifecycle, repayment and Attestcoin
  suites.
- Sepolia contracts: 13/13 Foundry tests passing across demo asset and vault suites.
- Repository and worker: 8/8 Node tests passing and TypeScript typecheck passing.
- Solidity compiler: `0.8.30`.
- EVM target: `shanghai`.
- Foundry: `v1.2.3`.
