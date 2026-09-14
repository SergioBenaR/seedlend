# SeedLend pitch narrative

_Last consolidated: 14 September 2026._

This file is the current judge-facing narrative. For the full product thesis and research context, read `docs/product-strategy.md` and `docs/customer-discovery.md` before editing this pitch.

## Core opening

**SeedLend appears from the first second.** Do not begin with blockchain, Creditcoin or Attestcoin.

Working opening:

> **SeedLend starts with one question: what if you could make your first investment before you had the capital — without depending on traditional credit?**

Supporting idea:

> We are building a new way for young people to start building wealth earlier.

## Problem framing

Initial focus: young adults/university students in Latin America.

The problem is not “young people are irresponsible.” The stronger framing is that many reach adulthood with little practical financial education, no meaningful credit history/collateral and a financial model centered on receiving income and spending it, while the idea of deliberately building an investment position early is often absent or perceived as requiring substantial starting capital.

The story should contrast the old expected sequence:

`graduate → stable job → salary → start building wealth`

with the SeedLend opportunity:

`learn → start investing earlier → build capital + reputation while studying/starting work`

Use recent defensible LATAM financial-literacy evidence in the final video, not the old 2014 S&P figures. Keep external statistics few and high-confidence.

## SeedLend's own early validation

First in-person round: **16 private-university students in La Paz**.

Current useful signals:

- 11/16 said they normally spend money left after necessary expenses;
- 11/16 reported no practical financial education;
- 10/16 believed at least USD 500 was needed to begin investing;
- 4/16 believed USD 10,000 or more was needed;
- when given a concrete extra-USD-10 scenario, 15/16 said they would save at least part of it.

Core insight:

> **The intention to build capital may already be there. What is missing is a practical path to start.**

Follow-up signal:

> We asked eight specific interviewees whether they wanted us to keep them updated on SeedLend, and all eight gave us their number.

Do **not** say “8 of 16 showed interest,” because only those eight were asked.

These interviews are early validation/hypothesis refinement, not product-market fit or a representative LATAM sample.

## Product thesis

SeedLend turns future repayment capacity into the opportunity to build an investment position today.

Instead of handing the user unrestricted cash, financing is directed into an investment position.

The intended user builds three assets at once:

1. **investment capital / ownership**;
2. **practical financial knowledge + verifiable educational credentials**;
3. **verifiable repayment history / financial reputation**.

Working product progression:

`Learn → Simulate → Unlock → Invest → Pay → Own more → Diversify → Build`

## Education is part of the product

SeedLend should run a **free public introductory investment course every month**. It is both a user-acquisition mechanism and a risk/education layer.

Users should complete theoretical and practical assessments. Passing can lead to a verifiable certificate useful as evidence of investment knowledge and potentially valuable for a CV/professional profile.

Education can progressively unlock greater investment autonomy. Specialized courses by sector, profession/career, asset class or interest may later become a paid business line.

The current hackathon MVP does not yet implement certification, course gating or credential issuance; these are product-roadmap components.

## Progressive ownership UX

A central product hypothesis is to show the user how much of the investment they have progressively acquired after each payment.

Example:

> **You now own X% of this investment.**

The purpose is to make repayment feel like increasing ownership of an asset rather than only servicing debt.

This is a product hypothesis and is not yet implemented as a production legal/economic ownership mechanism.

## Why start earlier?

The pitch should explain:

- more time to learn how risk and return actually work;
- more time in markets;
- more time for compounding;
- access to a broader set of investment opportunities than many young users currently consider available to them;
- the ability to build repayment history before needing larger financial products later in life.

Potential return matters as an adoption driver. Do not hide it behind an education-only narrative. But SeedLend does not itself manufacture or guarantee a fixed return; return and risk come from the financed asset/strategy and must be compared transparently with financing cost.

## Why give credit without existing history or collateral?

This is not conventional unsecured cash lending.

SeedLend is designed for the cold-start problem precisely because the user may not yet have meaningful capital, credit history or traditional collateral.

The intended risk structure is:

- capital is directed rather than freely spendable;
- an investment position is created/controlled under product rules;
- education precedes greater investment autonomy;
- the position can potentially appreciate/depreciate or generate return from the start;
- repayment behavior becomes verifiable over time;
- production underwriting, limits, reserves and recovery mechanisms can surround the position.

Key comparison:

> **Overcollateralized DeFi lending assumes you already own collateral. SeedLend is designed to help you create the first investment position itself.**

Do not imply any partnership with Aave or another protocol when making this comparison.

## The trust problem that leads naturally to blockchain

Do not jump abruptly from youth finance to blockchain.

First explain the directed-capital model. Then ask:

> **How does the lender know that the financed money actually became the investment it was supposed to finance?**

And, if investment opportunities may exist across different platforms/protocols/chains:

> How can SeedLend verify that external position before treating the credit as active?

Only then introduce the technical architecture.

## Why Creditcoin + Attestcoin

Creditcoin holds the canonical loan lifecycle.

The financed investment position can exist outside that Creditcoin contract. In the hackathon demo it exists on Ethereum Sepolia.

Attestcoin is the mandatory proof bridge: the Creditcoin loan cannot activate until the source position is verified and matches the exact configured vault, loan ID, borrower, asset, principal and committed terms.

**No verified position, no activated loan.**

This is why Attestcoin is not decorative. It is a state-transition dependency.

## Current public testnet proof

The demonstrated lifecycle is:

`loan created → 100 SLDP locked on Sepolia → Attestcoin proof → loan activated on Creditcoin → repayments → LoanPaid → ReleaseEligible`

Final public demo facts:

- loan ID: 2;
- principal: 100 tCTC;
- total due: 105 tCTC;
- demonstration position: 100 SLDP;
- repayments: 5 × 21 tCTC;
- source: Ethereum Sepolia, Attestcoin chainKey 1;
- destination: Creditcoin CC3 testnet;
- final state: 5 payment records, zero remaining, `LoanPaid` + `ReleaseEligible`.

The contract does not impose an APR, monthly due dates or mandatory 21-tCTC installments. Never describe 100 → 105 as a 5% APR.

SLDP is a fixed-supply **unbacked test token**. It is not a production RWA, legal claim or promised-yield asset.

## Demo objective

The demo must receive enough time to show a **product story**, not only transaction hashes.

Recommended demo narrative:

1. A young user wants to begin an investment but lacks the full initial capital.
2. SeedLend defines a directed loan/investment position.
3. The external position is created/locked.
4. Attestcoin verifies that the correct position exists.
5. Only then does the Creditcoin loan become active.
6. Repayments are recorded and visible.
7. The user can conceptually see ownership progress and repayment history.
8. Full repayment reaches `Paid` / `ReleaseEligible`.
9. Explain clearly that production release, real-asset execution and default mechanics are roadmap layers, not hidden demo functionality.

Explorers should serve as public evidence supporting the story, not become the story themselves.

## Missed payments/default — answer if judges ask

The current hackathon contracts do not implement a repayment calendar or default/liquidation policy.

The product direction is:

- fixed monthly due dates;
- a short grace period (working hypothesis: up to five days);
- behavioral incentives/consequences for lateness;
- grace/restructuring before severe recovery action;
- persistent default may allow the controlled investment position to be sold/transferred/recovered;
- a future secondary market may allow another eligible user to assume the position and remaining payments rather than forcing liquidation;
- any production design must define who receives surplus value and who absorbs a shortfall if the investment is worth less than the outstanding debt.

Do not present the five-day period, penalties or secondary market as implemented/final policy.

## University/community network-effect thesis

The university segment is valuable not only because of age but because students may remain in the same institution and peer groups for four or five years.

Potential mechanisms:

- peer learning;
- social proof;
- accountability;
- referrals;
- cohort-based courses;
- visible investment milestones;
- community investing;
- future group-based risk mechanisms.

The first interviews showed visible peer influence in answers/spending behavior. This supports testing the hypothesis; it does not prove that community mechanics reduce default.

This community layer should appear in the broader pitch/vision because it can also answer the acquisition question: universities + recurring courses + cohorts + visible outcomes can create a lower-cost distribution loop.

## Business model

No final pricing is selected. Defensible hypotheses include:

- B2C financing/service economics;
- SeedLend taking a percentage of investment return generated for the user, subject to final legal/economic design;
- a fee associated with financing/interest economics;
- paid specialized investment courses;
- B2B/B2B2C services for universities around education, cohorts, credentials, analytics or student financial programs.

For the hackathon, present a plausible path to revenue without pretending final unit economics are complete.

## Identity/privacy roadmap

Universities already hold student identity/enrollment information. A future SeedLend architecture could use university-issued credentials, selective disclosure or ZK proofs to verify only necessary facts such as active-student status, age/eligibility or institutional affiliation without ingesting all personal documents.

This is future architecture, not a current integration.

## Vision

The hackathon asset is deliberately a demo token. The larger thesis is that the trust architecture could support multiple validated investment rails in the future, including categories such as Bitcoin, global markets, diversified assets and DeFi strategies.

Do not imply partnerships or production availability that do not exist.

The larger SeedLend flywheel is:

`free education → new cohorts → first investment → repayments + learning → investment ownership + repayment history + credentials → visible outcomes/community → more users/universities → specialized education/services → revenue and broader investment access`

## Closing direction

Preferred strategic close:

> **SeedLend is not about helping young people borrow earlier. It is about helping them start building earlier.**

> **SeedLend. Your first investment starts here.**

## Questions the pitch/submission must not leave conceptually unanswered

- Why would a person borrow to invest?
- What if the investment loses value?
- What happens after a missed payment or persistent default?
- How is the investment actually purchased in production?
- Why can SeedLend consider users without existing collateral/history?
- Who provides capital?
- Where does user return come from?
- What if financing cost exceeds expected return?
- Why can the user not simply withdraw/spend the principal?
- Who controls/owns the position while it is being repaid?
- What does the user receive after completing repayment?
- Why blockchain instead of a normal database?
- Why is Attestcoin essential rather than decorative?
- What exactly does the current demo prove, and what does it not prove?
- How does SeedLend acquire users?
- What is the plausible business model?
- How will identity, custody, underwriting, regulation/KYC/AML eventually be handled?

These do not all need long explanations in the video. The narrative, demo and written submission together should make the important answers clear.
