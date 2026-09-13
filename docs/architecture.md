# SeedLend MVP architecture

SeedLend separates the loan lifecycle from the external investment position and uses Attestcoin to connect the two states.

`Sepolia position lock → Attestcoin proof → Creditcoin loan activation → repayments → Paid + ReleaseEligible`

## Components

| Component | Responsibility |
|---|---|
| Ethereum Sepolia / `SeedLendVault` | Holds the demo investment position and emits `PositionLocked`. |
| Attestcoin proof workflow | Proves the Sepolia source transaction to Creditcoin. |
| Creditcoin CC3 / `SeedLendLoan` | Stores the canonical loan terms, lifecycle and repayment history. |
| Web app | Exposes the product flow and public testnet evidence. |

## Activation rule

A Creditcoin loan remains pending until Attestcoin proves the expected Sepolia transaction.

`SeedLendLoan` then checks that the proof matches the configured:

- source chain;
- vault;
- loan ID;
- borrower;
- asset;
- principal;
- committed `termsHash`.

If those values do not match, the loan does not activate.

## Shared identity

`loanId` is created on Creditcoin and included in the Sepolia position event. `loanId` alone is not enough: activation also requires the borrower, asset, principal, terms commitment, source chain and authorized vault to match.

## Current terminal boundary

The implemented lifecycle ends at `Paid` with `ReleaseEligible` emitted.

Automatic reverse Creditcoin-to-Sepolia release, production asset settlement, default recovery and liquidation are outside the current MVP.

## Current public demo

- Loan ID: 2
- Principal: 100 tCTC
- Total due: 105 tCTC
- Position: 100 SLDP
- Repayments: 5 × 21 tCTC
- Final balance: 0 tCTC
- Final state: `Paid` + `ReleaseEligible`

Public transactions are listed in [`testnet-evidence.md`](testnet-evidence.md).
