# SeedLend

**Your first investment starts here.**

SeedLend is a directed-investment credit product for people who do not yet have enough starting capital, credit history or investment collateral to begin building an investment position.

Instead of handing the borrower unrestricted cash, the intended model directs financing into a specific investment position. The hackathon MVP proves the cross-chain trust layer required for that model: a loan on Creditcoin cannot activate until Attestcoin verifies that the expected investment position exists on an external chain.

> **No verified position, no activated loan.**

## Product thesis

SeedLend is designed around the cold-start problem: the user wants to begin building an investment but does not yet own the capital or collateral normally required to access financing.

The broader product aims to help the user build three things together:

1. **investment capital / ownership**;
2. **practical financial knowledge and verifiable educational credentials**;
3. **verifiable repayment history / financial reputation**.

Working progression:

`Learn → Simulate → Unlock → Invest → Pay → Own more → Diversify → Build`

The education, credential, progressive-ownership and community layers are product-roadmap concepts. The current smart-contract MVP focuses on the cross-chain financing trust primitive.

## Current public MVP

The complete testnet vertical slice has been executed:

`Creditcoin loan → Sepolia PositionLocked → Attestcoin proof → Creditcoin activation → 5 × 21 tCTC repayments → LoanPaid → ReleaseEligible`

Demo values:

- Loan ID: 2.
- Principal: 100 tCTC.
- Total due: 105 tCTC.
- Demonstration position: 100 SLDP.
- Repayments: 5 × 21 tCTC.
- Final balance: 0 tCTC.
- Source: Ethereum Sepolia, Attestcoin chainKey 1.
- Destination: Creditcoin CC3 testnet.
- Public evidence: [`docs/testnet-evidence.md`](docs/testnet-evidence.md).

SLDP is an intentionally unbacked test ERC-20. It represents no legal claim, production RWA or promised return. The extra 5 tCTC is total demo interest; it is not described as a 5% APR because the MVP does not encode a repayment calendar or APR.

## Why Attestcoin is core

Attestcoin is a state-transition dependency rather than an analytics add-on.

`SeedLendLoan` refuses to activate unless the proven Sepolia transaction contains the expected `PositionLocked` event and matches the configured:

- source chain;
- vault;
- loan ID;
- borrower;
- asset;
- principal;
- committed `termsHash`.

The proof query is replay-protected. Failed source transactions, mismatched position data and invalid/unverified proofs are rejected.

## Architecture

`Sepolia position lock → Attestcoin proof → Creditcoin loan activation → repayments → Paid + ReleaseEligible`

| Stage | Component | Role |
|---|---|---|
| 1 | Ethereum Sepolia / `SeedLendVault` | Locks the 100 SLDP demo position and emits `PositionLocked`. |
| 2 | Attestcoin | Proves the Sepolia source transaction. |
| 3 | Creditcoin CC3 / `SeedLendLoan` | Validates the exact vault, loan ID, borrower, asset, principal and `termsHash` before activation. |
| 4 | Creditcoin CC3 | Records repayments and reaches `Paid`, then emits `ReleaseEligible`. |

Creditcoin stores the canonical loan lifecycle. The financed position may live elsewhere. Attestcoin provides the proof that connects the two states.

For more detail, see [`docs/architecture.md`](docs/architecture.md).

## Public demo

https://seedlend.vercel.app

Build locally with:

```bash
pnpm --filter @seedlend/app build
```

The app is static and contains no private keys or signing material.

## Verification

GitHub Actions verification is defined at `.github/workflows/verify.yml` and covers:

- repository Node tests;
- Attestcoin worker tests;
- TypeScript typecheck;
- judge-facing app build;
- Creditcoin Foundry tests;
- Sepolia Foundry tests.

The latest verification status is recorded in [`docs/final-verification.md`](docs/final-verification.md).

Local checks:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm --filter @seedlend/app build
cd contracts/creditcoin && forge test
cd ../../contracts/sepolia && forge test
```

## MVP boundary

### Implemented

- `SeedLendLoan` on Creditcoin CC3 testnet;
- `SeedLendVault` and unbacked SLDP demo asset on Ethereum Sepolia;
- functional Attestcoin proof-gated activation;
- exact source-position matching and replay protection;
- native tCTC repayment records;
- `LoanPaid` and `ReleaseEligible` completion evidence;
- reproducible deployment/E2E scripts;
- public transaction evidence;
- judge-facing product/demo interface.

### Roadmap / not implemented in the hackathon MVP

- production asset purchase/settlement;
- real investment assets or yield products;
- automatic Creditcoin-to-source-chain asset release;
- repayment due dates, grace periods or late penalties;
- default liquidation or secondary-market mechanics;
- progressive legal/economic ownership per repayment;
- production underwriting / formal credit scoring;
- KYC/AML, custody and jurisdictional design;
- educational course/certificate issuance;
- university/ZK identity integration.

## Repository layout

```text
contracts/creditcoin/  SeedLendLoan, Attestcoin verifier and tests
contracts/sepolia/     SeedLendVault, demo asset and tests
worker/                Attestcoin proof workflow
app/                   Judge-facing product + testnet evidence interface
scripts/               Deployment and E2E automation
tests/                 Repository-level checks
docs/                  Product, architecture, research and evidence
```

## Key documentation

- [`docs/architecture.md`](docs/architecture.md) — MVP architecture and trust boundary.
- [`docs/product-strategy.md`](docs/product-strategy.md) — broader product thesis.
- [`docs/customer-discovery.md`](docs/customer-discovery.md) — interview design, evidence and limits.
- [`docs/video-script.md`](docs/video-script.md) — final timed video script.
- [`docs/testnet-evidence.md`](docs/testnet-evidence.md) — current public contracts and transactions.
- [`docs/final-verification.md`](docs/final-verification.md) — CI and submission-readiness verification.

## Official references

- [Attestcoin Protocol](https://creditcoin.org/USC)
- [Creditcoin guided tutorials](https://docs.creditcoin.org/creditcoin-usc/guided-tutorials)
- [Official Attestcoin examples](https://github.com/gluwa/attestcoin-protocol-examples)

## License

No open-source license has been selected. All rights remain reserved until the project owner makes that decision.
