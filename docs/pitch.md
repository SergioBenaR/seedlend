# SeedLend pitch narrative

## One sentence

SeedLend is directed investment microcredit: it finances an investment position instead of handing out unrestricted cash, and the Creditcoin loan activates only after Attestcoin proves that the corresponding position exists on another chain.

## Live demo

https://seedlend.vercel.app

## Problem

For a young person without meaningful savings or credit history, the first investment is often delayed because the initial capital is inaccessible. Conventional consumer credit also solves a different problem: it delivers cash, not a verifiable investment position.

## Product thesis

SeedLend separates the credit state from the investment position.

- Creditcoin stores the canonical loan lifecycle.
- Sepolia hosts the hackathon demonstration position.
- Attestcoin proves the source-chain position to Creditcoin.
- The Creditcoin contract refuses to activate unless the proof matches the exact vault, loan ID, borrower, asset, principal and committed terms.
- Native tCTC repayments are recorded on-chain and forwarded to the originator.
- Full repayment emits `ReleaseEligible`; automatic reverse cross-chain release is intentionally outside this MVP.

The structural idea is that the borrower receives exposure to the financed investment position and its potential upside, while the lender finances a directed position rather than unrestricted consumption. The hackathon demo does not model or promise investment returns.

## Why Attestcoin is core

Attestcoin is not an analytics widget or a post-hoc verification badge. It is a state-transition dependency.

The public testnet lifecycle is:

`loan created → 100 SLDP locked on Sepolia → Attestcoin proof → loan activated on Creditcoin → 3 × 36 tCTC repaid → LoanPaid → ReleaseEligible`

If the Sepolia transaction is missing, failed, emitted by the wrong vault, belongs to another loan, or has mismatched borrower / asset / principal / terms, activation reverts.

## Demo facts

- Principal: 100 tCTC.
- Total due: 108 tCTC.
- Demonstration position: 100 SLDP.
- Demonstration repayments: 3 × 36 tCTC.
- Source chain: Ethereum Sepolia, Attestcoin chainKey 1.
- Destination: Creditcoin CC3 testnet.
- Final verified state: 3 payment records, 0 tCTC remaining, `LoanPaid` and `ReleaseEligible` emitted.

SLDP is a fixed-supply unbacked test token. It represents no legal claim, no production RWA and no promised yield.

## What is deliberately not in the MVP

No automatic cross-chain release, liquidation/default marketplace, production underwriting, KYC/AML, legal custody model, real investment assets or return assumptions. These are product and regulatory layers to validate after the infrastructure vertical slice.

## Judge-facing demo order

1. Open https://seedlend.vercel.app and state the thesis in one sentence.
2. Show Loan #1 and the two-chain architecture.
3. Open `PositionLocked` on Sepolia.
4. Show the Attestcoin activation transaction on Creditcoin and emphasize: no proof, no activation.
5. Show the three repayment transactions.
6. Open the final repayment and point to `LoanPaid` / `ReleaseEligible`.
7. End with the expansion thesis: replace the unbacked demo asset with validated production investment rails without changing the proof-gated credit architecture.

## 30-second version

SeedLend finances an investment position rather than unrestricted cash. The loan lives on Creditcoin, the position can live on another chain, and Attestcoin is the gate: the Creditcoin contract will not activate until it cryptographically verifies the exact external position. We ran the complete lifecycle on public testnets — position locked on Sepolia, proof consumed on Creditcoin, 108 tCTC repaid in three transactions, and release eligibility emitted on-chain. The demo asset is intentionally unbacked; what we are proving is the cross-chain credit infrastructure.
