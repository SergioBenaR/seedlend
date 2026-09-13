# SeedLend — BUIDL CTC 2026 Fall submission sheet

_Last consolidated: 13 September 2026._

This file is the single source of truth for the final hackathon submission. Replace every `PENDING` field before submitting.

## Project

**Name:** SeedLend

**Track:** DeFi

**Working tagline:** Your first investment starts here.

**One-line description:**

SeedLend is directed investment credit for people who do not yet have enough starting capital or investment collateral: financing goes into a specific investment position, and the Creditcoin loan activates only after Attestcoin proves that the expected external position exists.

## Problem

Young adults can reach financial independence without practical investment experience, meaningful credit history or enough initial capital to start an investment position. SeedLend's first customer-discovery round with 16 university students in La Paz found signals consistent with that cold-start problem, including high perceived starting-capital requirements and limited practical financial education. These interviews are early discovery, not representative population research.

## Product thesis

SeedLend is designed to help a user build three assets over time:

1. investment capital / ownership;
2. practical financial knowledge and verifiable educational credentials;
3. verifiable repayment history / financial reputation.

Instead of transferring unrestricted principal to the borrower, the intended production model directs capital into a controlled investment position.

## Why Creditcoin + Attestcoin

The investment position may exist outside Creditcoin. That creates a trust problem: how does the lending system know the expected external position really exists before treating the credit as active?

The hackathon MVP makes Attestcoin a state-transition dependency:

**No verified position, no activated loan.**

Creditcoin stores the canonical loan lifecycle. Attestcoin verifies the Sepolia source transaction. `SeedLendLoan` then checks the expected vault, loan ID, borrower, asset, principal and committed terms before activation.

## What the public MVP proves

Completed public testnet lifecycle:

`loan created → position locked on Sepolia → Attestcoin proof → loan activated on Creditcoin → repayments recorded → LoanPaid → ReleaseEligible`

Demo values:

- principal: 100 tCTC;
- total due: 108 tCTC;
- external demo position: 100 SLDP;
- repayments: 3 × 36 tCTC;
- final remaining balance: 0;
- source: Ethereum Sepolia / Attestcoin chainKey 1;
- destination: Creditcoin CC3 testnet.

SLDP is intentionally an unbacked demonstration token. It is not an RWA, does not represent a legal claim and does not promise yield.

## Public evidence

**Product demo:** https://seedlend.vercel.app — **FINAL PRODUCTION REFRESH PENDING**

**Testnet evidence:** `docs/testnet-evidence.md`

**Final verification:** `docs/final-verification.md`

**GitHub:** https://github.com/SergioBenaR/seedlend — **REPOSITORY ACCESS FOR JUDGES PENDING**

### Key contracts

- Sepolia DemoPositionAsset: `0x442a74AC5CD4B12E61A6ce20397b2ceA97896c24`
- Sepolia SeedLendVault: `0x43120061E02461942b2aab72D4166b2df9ff3141`
- Creditcoin CC3 SeedLendLoan: `0x442a74AC5CD4B12E61A6ce20397b2ceA97896c24`
- Creditcoin CC3 EvmV1Decoder: `0x04B9ae8562D8Cc5bbbBbBB759080dDC30B56D18B`

The demo asset and loan contract have the same numerical address but exist on different EVM chains.

## Product roadmap beyond the MVP

Roadmap concepts include:

- free recurring investment education plus theoretical/practical assessment;
- verifiable educational credentials;
- progressive investment choice as users demonstrate understanding;
- user-facing ownership-progress feedback after repayments;
- university cohorts and community/network effects;
- repayment schedules, grace/restructuring and default recovery;
- secondary-market transfer/assumption concepts;
- privacy-preserving university eligibility credentials;
- real investment execution across appropriate asset rails;
- B2C financing/service economics, specialized education and B2B/B2B2C university services.

These are product direction, not features already implemented in the current smart contracts.

## Current MVP boundaries

Not implemented today:

- production investment purchase/settlement;
- real yield-bearing or legally backed asset;
- automatic reverse cross-chain release;
- due-date enforcement or late penalties;
- liquidation/default recovery or secondary market;
- production underwriting or credit score;
- KYC/AML/custody/legal framework;
- course/certificate issuance;
- university/ZK identity integration;
- progressive legal/economic ownership per repayment.

The 100 → 108 tCTC demonstration must not be described as an 8% APR because the contract does not encode a calendar/APR.

## Final submission assets

- **Track:** DeFi
- **Repository URL:** https://github.com/SergioBenaR/seedlend
- **Live product URL:** https://seedlend.vercel.app
- **Deck / whitepaper PDF URL:** `PENDING`
- **Demo video URL:** `PENDING`
- **Final submission description:** `PENDING FINAL COPY`

## Pre-submit checklist

- [x] Original SeedLend contracts and worker implemented.
- [x] Creditcoin CC3 testnet deployment completed.
- [x] Sepolia source contracts deployed.
- [x] Functional Attestcoin-gated activation completed publicly.
- [x] Public repayment lifecycle completed.
- [x] Public transaction evidence recorded.
- [x] Repository, worker, app build and both Foundry suites pass CI.
- [x] Product strategy, customer discovery, pitch and demo plan preserved in repository.
- [ ] Latest product-first web build deployed to the final production URL.
- [ ] Final public smoke test completed.
- [ ] Repository made accessible to hackathon judges.
- [ ] Deck/whitepaper PDF completed and hosted.
- [ ] Demo video completed and hosted.
- [ ] Final DoraHacks form completed and checked for claim consistency.
