# SeedLend demo plan

_Last consolidated: 12 September 2026._

This document is the durable recording plan for the BUIDL CTC demo. The goal is to show a product story first and then prove the technical trust layer. Do not record the final video until the public demo supports this flow clearly.

## Core demo principle

The current web app is strong as a public-evidence dashboard, but the final hackathon demo should not feel like an explorer walkthrough. A judge should understand what SeedLend does for the user before seeing hashes or contract details.

The demo therefore needs two visible layers:

1. **User/product layer** — what the student is building and why the experience is different from a normal loan.
2. **Technical proof layer** — how the current MVP enforces `no verified position, no activated loan` across Sepolia, Attestcoin and Creditcoin.

Future product hypotheses must be visually labeled as concept/roadmap and must not be presented as already implemented on-chain.

## Product layer to make visible before recording

The public demo should make these ideas understandable in a few seconds:

- SeedLend directs financing into an investment position rather than unrestricted cash.
- The user is building three things: investment capital, financial knowledge/credentials and repayment history.
- Repayment progress should be visible as a positive build-up, not only a decreasing debt balance.
- A future ownership-progress UX may show messages such as `You now own X% of your investment`; this is a product hypothesis and must be labeled accordingly until the economic/legal ownership rule is implemented.
- Free monthly financial/investment education, theory + practical assessment and verifiable certificates are product direction, not current MVP functionality.
- University cohorts/community effects are a distribution and behavior hypothesis, not an implemented credit guarantee.

## Current MVP evidence that must be demonstrated

The existing public run already proves:

- Loan #1 created on Creditcoin.
- Principal: 100 tCTC.
- Total due: 108 tCTC.
- Demonstration position: 100 SLDP on Sepolia.
- The Sepolia position is locked before activation.
- Attestcoin proof gates activation on Creditcoin.
- The destination contract matches the exact vault, loan ID, borrower, asset, principal and terms commitment before activation.
- Three 36 tCTC demonstration payments are recorded on Creditcoin.
- Final state: `Paid`, 0 tCTC remaining and `ReleaseEligible` emitted.
- SLDP is an intentionally unbacked test token; the MVP proves infrastructure, not a production investment asset or promised return.

## Target recording flow — approximately 65–75 seconds

### 0:00–0:12 — Product view

Show SeedLend name and the first-investment framing. State that this first position is financed directly rather than giving the user unrestricted cash.

### 0:12–0:23 — What the user builds

Show a concise user-facing summary: investment position, repayment progress/history and the broader product direction of financial education. If an ownership-progress concept is shown, label it clearly as an illustrative product concept rather than current on-chain ownership logic.

### 0:23–0:32 — The trust problem

Transition from the user experience to the technical question: how can the lender know the financed investment really exists when the position lives somewhere else?

### 0:32–0:47 — Position + Attestcoin gate

Show Loan #1 and the proof path. Show the Sepolia `PositionLocked` evidence, then the Attestcoin/Creditcoin activation evidence. Emphasize: **no verified position, no active loan**.

### 0:47–1:01 — Repayments

Show the three public Creditcoin repayment transactions and the repayment history. Explain that each payment amount and timestamp is recorded on-chain and forwarded to the originator.

### 1:01–1:12 — Completion

Show `Paid`, zero remaining and the final `ReleaseEligible` event. Explain that automatic reverse cross-chain release is deliberately outside the hackathon MVP.

### 1:12–1:15 — Boundary

End on the visible boundary between what works now and what comes next: production underwriting, real investment assets, default handling, legal/custody model and reverse release.

## Recording rules

- The demo must tell a continuous user story; do not spend time reading hashes aloud.
- Explorer links are proof, not the narrative.
- Keep the SeedLend UI visible as the primary surface and open explorers only to verify critical transitions.
- Do not call 100 → 108 tCTC an 8% APR; there is no on-chain repayment calendar in the MVP.
- Do not call current payment records an on-time credit history or credit score.
- Do not claim SLDP is an RWA or has yield.
- Do not present automatic asset purchase/settlement, default liquidation, ownership-percentage transfer, course/certification, university identity/ZK or community guarantees as implemented today.

## Implementation status — 12 September 2026

Completed in the repository:

- A product-experience layer now appears before the technical proof timeline.
- The product view explicitly shows the directed-financing path: no existing investment collateral → directed credit → capital goes to the investment → repay and build ownership.
- The illustrative progress UI shows `You now own 40%` and is labeled `PRODUCT CONCEPT`.
- Education/unlock, verifiable credential + repayment record, and university-cohort concepts are visibly separated from implemented MVP evidence.
- The primary hero CTA now leads to the product layer before the proof path.
- The static build script now copies the new product CSS/JS and both SeedLend logo assets into `dist/`; without this fix a Vercel build would have omitted the newly added product assets.

## Next step

Deploy the updated app, verify the rendered desktop/mobile experience, then record the 65–75 second product + proof demo using the flow above. Preserve the current technical evidence and do not expand the MVP scope before recording.
