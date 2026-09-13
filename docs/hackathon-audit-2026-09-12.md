# SeedLend — final hackathon audit

_Last audited: 12 September 2026._

Purpose: judge-facing readiness review before the final production deployment, video recording and BUIDL CTC submission. This is a hackathon readiness/security review, not a formal production smart-contract audit.

## Executive verdict

SeedLend has a credible, differentiated product thesis and a real Attestcoin-gated public-testnet vertical slice. The technical core should be preserved rather than expanded at the last minute.

The largest remaining risks are **submission/readiness risks**, not a missing core protocol primitive:

1. the public production URL is still serving an older build;
2. the submission package does not yet contain a deck/whitepaper PDF;
3. the GitHub repository is private, creating judge-access risk unless organizer access is explicitly guaranteed;
4. the repository lacks one final judge-facing verification command / current CI evidence covering Node, worker, app build and both Solidity suites;
5. the README and verification log lag behind the latest product narrative, UI work and completed public E2E run;
6. the final hackathon track has not been closed in the decision log.

Recommended strategy: **do not add another major feature. Close the evidence, accessibility, submission and presentation gaps.**

## P0 — must close before submission / final recording

### P0.1 — Production demo is stale

Current canonical URL in the README: `https://seedlend.vercel.app`.

Audit check on 12 September returned HTTP 200, but the deployed HTML is the older version (`SeedLend — Proof-gated investment credit`) and does not include the latest product layer, current branding/copy, `product-concept.css` or `product-layout.js`.

The repository build bug that previously omitted the new product assets from `dist/` has already been fixed in `app/build-static.mjs`.

**Required:** deploy the current audited commit to the existing `seedlend` production project, then smoke-test the canonical URL, assets, navigation, explorer links and mobile/desktop layout.

### P0.2 — Deck / whitepaper submission artifact is missing

The verified hackathon requirements recorded in `docs/verification-log.md` require a deck or whitepaper PDF URL. The repository tree currently contains no PDF.

**Required:** create a concise judge-facing deck/whitepaper and host it at a stable URL before submission. It should cover problem, customer discovery, product, differentiation, Attestcoin architecture, public evidence, roadmap, business model and team.

### P0.3 — Repository is private

GitHub reports `SergioBenaR/seedlend` visibility as `private`.

The submission requires a GitHub URL. A private repository is a material judging risk if reviewers cannot inspect it without special access.

**Required:** before submission, either make the repository publicly accessible or verify an explicit organizer-approved private-repository access mechanism. Do not assume judges have access.

### P0.4 — Final submission package is not centralized

There is no single `SUBMISSION.md` / equivalent file containing the final title, tagline, track, description, Attestcoin summary, production URL, GitHub URL, video URL, deck URL, deployed contract addresses and reproducibility instructions.

**Required:** create this after the final URLs are known. The submission page and repository should tell the same story.

### P0.5 — Run and record a final verification pass on HEAD

Historical evidence records:

- Creditcoin Foundry: 20/20 passing;
- Sepolia Foundry: 13/13 passing;
- repository + worker Node tests: 8/8 passing;
- TypeScript typecheck passing;
- complete public E2E lifecycle completed.

However, the current root `pnpm check` only runs repository Node tests, worker tests and TypeScript typecheck. It does **not** run the app build or either Foundry suite. There is also no `.github/workflows` CI directory.

**Required:** before final deployment, run/record at minimum:

```bash
pnpm check
pnpm --filter @seedlend/app build
cd contracts/creditcoin && forge test
cd ../sepolia && forge test
```

Then append the current results and audited commit SHA to `docs/verification-log.md`.

## P1 — high-value improvements to winning probability

### P1.1 — Close the final track

Current official BUIDL CTC site lists DeFi, RWA, DePIN, Gaming and AI. SeedLend is fundamentally a lending/investment-credit product and the current demo intentionally does **not** claim SLDP is an RWA.

**Audit recommendation: DeFi is the strongest current track fit.**

RWA would weaken the submission because the demo asset is explicitly unbacked and there is no legally backed real-world asset in the MVP.

The final choice should be recorded in the decision log before submission.

### P1.2 — Surface Attestcoin depth more aggressively

The integration is technically load-bearing and should be easy for a judge to verify.

Current contract protections include rejection of:

- wrong source chain key;
- replayed proof/query;
- failed source transaction;
- event from the wrong vault;
- wrong `termsHash`;
- wrong borrower;
- wrong asset;
- wrong principal;
- unverified proof.

This is stronger than simply saying “we use Attestcoin.” The README/submission should expose this negative-case matrix in a compact table.

Do **not** broaden the Attestcoin integration merely to increase API surface. The strongest argument is that a verified external position is a mandatory state-transition dependency: **no valid position proof, no active loan.**

### P1.3 — Update the README for the product we are actually pitching

README is technically solid but predates the latest product strategy. It should link the durable product/customer-discovery/demo documents and reflect:

- capital + knowledge/credential + repayment-history thesis;
- university distribution/network hypothesis;
- progressive ownership as a roadmap concept;
- free course + assessment/certification roadmap;
- business-model hypotheses;
- explicit current-vs-roadmap boundary.

Keep the technical evidence near the top. Do not turn the README into a long marketing page.

### P1.4 — Update verification history

`docs/verification-log.md` currently stops before the completed Sepolia/Creditcoin public E2E lifecycle and before the latest product UI/build work.

Append the final public deployment/E2E evidence and the final pre-submission checks so a judge can follow chronological progress without reconstructing it from commits.

### P1.5 — Make current technical limits easy to understand

These are **not audit failures** if stated accurately:

- `installmentAmount` and `installmentCount` are committed into the loan terms but are not enforced as a calendar or mandatory payment size;
- there is no due-date/default logic in the MVP;
- any address may pay an active loan and the payer is recorded;
- payments are immediately forwarded to the originator;
- the Sepolia vault has no release/liquidation function;
- `ReleaseEligible` is a terminal signal, not automatic reverse cross-chain execution;
- asset purchase/settlement is not implemented;
- progressive ownership is product UX/economic roadmap, not current contract state.

The pitch/video already observes most of these boundaries. Preserve that accuracy.

## Technical audit findings

### Smart-contract core

No critical defect was identified in this static hackathon review of the current core contracts.

`SeedLendLoan`:

- originator-only loan creation;
- immutable source chain configuration;
- material terms committed in `termsHash`;
- Attestcoin proof required before activation;
- receipt status and exact `PositionLocked` event validation;
- exact vault / loanId / borrower / asset / principal / terms matching;
- replay protection through consumed query IDs;
- repayment state checks, zero/overpayment rejection, forwarding failure rollback and reentrancy guard;
- final `Paid`, `LoanPaid` and `ReleaseEligible` transition.

`SeedLendVault`:

- position-manager-only lock;
- one position per loan ID;
- exact balance-delta check prevents accepting fee-on-transfer/under-delivering assets as the expected position;
- immutable stored position metadata for the MVP;
- intentionally no release/liquidation path.

`DemoPositionAsset` explicitly states that it is an unbacked fixed-supply test asset with no legal claim or promised yield.

### Test quality

The Attestcoin suite covers the important failure modes listed above. The repayment suite covers payment before activation, payment after `Paid`, zero payment, overpayment, rejected forwarding and reentry.

The main weakness is **presentation/current execution evidence**, not absence of negative-path tests.

### Secrets / repository hygiene

- `.env` and `.env.*` are ignored while `.env.example` is retained;
- `.deployments/` is ignored;
- no committed private key was found by the audit search;
- no obvious `TODO` marker was found in repository search.

Do not relax these protections for judge convenience.

## Product / judge audit

The latest product strategy now answers the major questions that were previously underdeveloped:

- why someone without collateral/history can be considered;
- why capital is directed instead of handed out as cash;
- what happens conceptually after missed/persistent default;
- how a future secondary market may fit;
- why education is mandatory and how it can unlock more autonomy;
- how theory/practical exams and verifiable credentials add value;
- why progressive ownership feedback can motivate repayment;
- why university cohorts may create acquisition/social/accountability effects;
- how SeedLend can plausibly monetize B2C, specialized education and B2B university services;
- how university-issued/selective-disclosure/ZK credentials could become an identity layer later.

These are roadmap/product hypotheses, not claims of current implementation. That separation is a strength and should remain explicit.

## Strategic fit with Creditcoin / CEIP

Current official Creditcoin material says CEIP favors cross-chain compatibility, clear roadmaps/live projects, transparent milestones/use of funds, emerging-market fit, sustainable business and measurable real-world impact.

SeedLend now has a credible argument on each axis:

- **cross-chain:** Attestcoin-gated Sepolia → Creditcoin state transition;
- **roadmap:** durable product strategy and clear MVP boundary;
- **emerging markets:** initial LATAM/university focus;
- **business:** financing/service economics, specialized education and B2B university hypotheses;
- **real-world impact:** access to first investment capital + education + repayment evidence;
- **measurability:** cohort completion, first-position creation, repayments, course/exam completion and retention can become concrete metrics.

The weakest CEIP-related item today is not the thesis but the absence of a concise final roadmap/milestone/use-of-funds presentation in the submission deck.

## Recommended execution order

1. **Freeze contracts/features.** No new major protocol feature unless a blocker is found.
2. Run final local checks on current HEAD; fix only actual failures.
3. Update `verification-log.md` and README with current truth.
4. Close the track decision (audit recommendation: **DeFi**).
5. Deploy current app to the existing production `seedlend` Vercel project.
6. Smoke-test `https://seedlend.vercel.app` and every critical explorer link.
7. Create the deck/whitepaper PDF.
8. Create final `SUBMISSION.md` with all canonical links/evidence.
9. Ensure GitHub judge accessibility.
10. Record/edit the video using `docs/video-script.md` and `docs/demo-plan.md`.
11. Final submission cross-check: every claim in DoraHacks, video, README, deck and live demo must agree.

## Do not change before submission unless required by a failing check

- Attestcoin proof model;
- testnet contract addresses / completed public lifecycle;
- 100 tCTC / 108 tCTC / 100 SLDP evidence facts;
- current MVP terminal state `Paid + ReleaseEligible`;
- SLDP boundary (unbacked test asset);
- no-APR claim;
- no formal on-time credit-score claim;
- no production partnership claims.

The highest-value work now is **making the existing proof impossible for a judge to miss and the submission impossible to misunderstand**.
