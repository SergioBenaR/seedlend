# SeedLend

SeedLend is a pre-MVP protocol for directed investment microcredit. Its hackathon version demonstrates how a loan on Creditcoin can be activated only after Attestcoin verifies that the corresponding investment position was created and locked on an external chain.

## Current objective

Build an original, testnet-deployed submission for BUIDL CTC 2026 Fall whose core path is:

`loan created → position locked on Sepolia → Attestcoin proof → loan activated on Creditcoin → repayments recorded → release eligibility`

The prototype does not use real money, does not promise returns and does not claim that its demonstration asset is a legally backed RWA.

## Public testnet result

The complete vertical slice has been executed on public testnets:

`Creditcoin loan → Sepolia PositionLocked → Attestcoin proof → Creditcoin activation → 3 × 36 tCTC repayments → LoanPaid → ReleaseEligible`

- Principal: 100 tCTC.
- Total due: 108 tCTC.
- Demonstration position: 100 SLDP.
- Final balance: 0 tCTC.
- Source chain: Ethereum Sepolia, Attestcoin chainKey 1.
- Destination: Creditcoin CC3 testnet.
- Evidence: [`docs/testnet-evidence.md`](docs/testnet-evidence.md).

## Why Attestcoin is core

Attestcoin is a state-transition dependency, not an analytics add-on. `SeedLendLoan` refuses to activate unless the proof from Sepolia matches the expected vault, loan ID, borrower, asset, principal and committed `termsHash`.

That makes the cross-chain proof part of the credit control path itself: **no valid position proof, no active loan**.

## Implementation status

- T01–T06: repository scaffold, contracts, Attestcoin worker and guarded deployment preparation complete.
- T07–T10: native-tCTC repayment flow, payment evidence, completion events and repayment protections complete.
- T11–T19: public Sepolia + Creditcoin deployment and complete Attestcoin-gated E2E lifecycle complete.
- T20: judge-facing static product demo implemented in `app/`.
- T21: Vercel deployment pending connection of the deployment account.
- T23–T24: judge-facing pitch narrative and technical evidence documentation prepared.

## Demo interface

The web demo is deliberately product-first rather than a generic hackathon landing page. It exposes the real completed lifecycle and links directly to the public transactions and contracts used in the demo.

Build it locally with:

```bash
pnpm --filter @seedlend/app build
```

The app is static and contains no private keys or signing material. Vercel deployment uses `app/` as the project root.

## MVP boundary

Included:

- `SeedLendLoan` on Creditcoin CC3 testnet;
- `SeedLendVault` and the unbacked SLDP demo asset on Ethereum Sepolia;
- functional Attestcoin proof-gated activation;
- native tCTC repayment history inside SeedLend;
- `LoanPaid` and `ReleaseEligible` completion evidence;
- reproducible E2E scripts, public transaction evidence and a judge-facing web demo.

Excluded until separately designed and validated:

- automatic Creditcoin-to-Sepolia asset release;
- defaults, liquidation and secondary-market economics;
- production credit scoring or external credit-bureau integration;
- real users, real funds, KYC/AML and legal RWA rights;
- DCA, social incentives and a production financial model.

## Repository layout

```text
contracts/creditcoin/  SeedLendLoan and its tests
contracts/sepolia/     SeedLendVault and its tests
worker/                Attestcoin proof workflow
app/                   Public testnet demo interface
scripts/               Checks, deployment and E2E automation
tests/                 Repository-level smoke tests
docs/                  Architecture, decisions, pitch and public evidence
```

## Local verification

Requirements:

- Node.js 20 or newer;
- pnpm 11;
- Foundry `v1.2.3`;
- Git.

Run repository checks:

```bash
pnpm check
```

Run each Solidity suite:

```bash
cd contracts/creditcoin && forge test
cd contracts/sepolia && forge test
```

Verify the public Creditcoin and Attestcoin environment:

```bash
pnpm verify:networks
```

Never commit `.env`, private keys or `.deployments/` local checkpoints.

## Key documentation

- [`docs/testnet-evidence.md`](docs/testnet-evidence.md) — public contracts and transactions from the completed lifecycle.
- [`docs/pitch.md`](docs/pitch.md) — judge-facing product and Attestcoin narrative.
- [`docs/contract-model.md`](docs/contract-model.md) — contract model.
- [`docs/decision-log.md`](docs/decision-log.md) — MVP decisions and boundaries.

## Official references

- [BUIDL CTC 2026 Fall requirements](https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail)
- [Attestcoin Protocol overview](https://creditcoin.org/USC)
- [Creditcoin guided tutorials](https://docs.creditcoin.org/creditcoin-usc/guided-tutorials)
- [Official USC examples](https://github.com/gluwa/usc-testnet-bridge-examples)

## License

No open-source license has been selected. All rights remain reserved until the project owner makes that decision.
