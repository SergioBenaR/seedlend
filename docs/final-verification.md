# SeedLend final verification

_Last verified: 14 September 2026._

This file records the final verified technical state and hackathon closeout state for BUIDL CTC 2026 Fall.

## CI verification

GitHub Actions workflow: `Verify SeedLend`

Latest full run checked before the closeout documentation updates:

- Run: https://github.com/SergioBenaR/seedlend/actions/runs/34804414537
- Commit verified: `3d053979ef94e8ac7e456c6e5b055686ad008d6e`
- Result: **PASS**

That commit added only the final deck PDF on top of the already-audited technical/documentation state. The workflow completed successfully after the upload.

The verification workflow covers:

- dependency installation with the locked pnpm graph;
- repository Node tests;
- Attestcoin worker tests;
- TypeScript typecheck;
- judge-facing static app build;
- Foundry setup;
- Creditcoin Solidity test suite;
- Sepolia Solidity test suite.

Subsequent 14 September closeout commits update documentation/status only; they do not change contracts, worker logic, app code or testnet evidence.

## Public deployment

- Repository: https://github.com/SergioBenaR/seedlend
- Repository visibility: public.
- Production demo: https://seedlend.vercel.app
- Production deployment state: ready.
- Final hackathon deck PDF: https://raw.githubusercontent.com/SergioBenaR/seedlend/main/SeedLend_BUIDL_CTC_2026_Deck.pdf

## Current public testnet evidence

The final public run is documented in `docs/testnet-evidence.md`:

`Creditcoin loan → Sepolia PositionLocked → Attestcoin proof → Creditcoin activation → 5 × 21 tCTC repayments → LoanPaid → ReleaseEligible`

Key facts:

- loan ID: 2;
- principal: 100 tCTC;
- total due: 105 tCTC;
- demo position: 100 SLDP;
- payment records: 5;
- remaining balance: 0;
- source: Ethereum Sepolia, Attestcoin chainKey 1;
- destination: Creditcoin CC3 testnet.

## Accuracy boundary

The verification above confirms the repository builds and tests successfully. It does not turn roadmap concepts into implemented features.

Still outside the hackathon MVP:

- real investment-asset purchase/settlement;
- automatic reverse cross-chain release;
- repayment due dates and late-payment policy;
- liquidation/default/secondary-market mechanics;
- progressive legal/economic ownership per payment;
- educational credential issuance;
- university/ZK identity;
- production underwriting, KYC/AML, custody and jurisdictional design;
- production APR/unit economics.

SLDP remains an intentionally unbacked demonstration token with no legal claim or promised return.

The extra 5 tCTC in the current demo is total demo interest. It is not a 5% APR because the contract does not encode a repayment period or APR.

## Hackathon closeout status

Completed and preserved:

1. Public repository and passing verification workflow.
2. Public production demo.
3. Complete public testnet lifecycle and transaction evidence.
4. Final seven-slide deck PDF hosted publicly.
5. Submission copy and technical USC/Attestcoin explanation preserved in `SUBMISSION.md` and the repository documentation.

Not confirmed in the repository:

1. Final public demo-video URL.
2. Whether DoraHacks accepted a final submission before/at the deadline.

The DoraHacks deadline elapsed during the final submission flow. No repository document should claim that a final submission was accepted unless that status is independently confirmed later.

SeedLend remains active after the hackathon window; this closeout records the milestone rather than ending the project.
