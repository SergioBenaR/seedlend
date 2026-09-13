# SeedLend hackathon deck — final content

_Last consolidated: 13 September 2026._

This file preserves the content of the 7-slide hackathon deck so the final PDF/PPTX can be regenerated without reconstructing the story from chat.

## Slide 1 — SeedLend

**Your first investment starts here.**

Before you have the full capital. Before you have traditional collateral. With the investment itself verified before credit activates.

Core frame: **capital + knowledge + repayment history**.

Closing line on slide: **Not earlier debt. An earlier start.**

## Slide 2 — The LATAM problem

Young people are entering adulthood without the financial tools — or capital — to start building early.

Use two recent, defensible figures:

- Brazil, PISA 2022: **45.1%** of 15-year-old students performed below the baseline level of financial literacy.
- Colombia, representative 2023 survey: **16.4%** of adults answered the “Big Three” questions on interest, inflation and diversification correctly.

Do not present these percentages as directly comparable metrics because they measure different populations/tests.

Core SeedLend framing: the cold start is **no meaningful capital, no traditional collateral, little practical investing experience**.

Sources:

- OECD PISA 2022 Financial Literacy, Brazil factsheet.
- Banco de la República de Colombia / Invamer 2023 financial-literacy survey.

## Slide 3 — Early customer discovery

**16 university students interviewed in La Paz, Bolivia.**

Early discovery signals:

- 11/16 normally spend money left after necessary expenses;
- 11/16 reported no practical financial education;
- 10/16 believed at least USD 500 was needed to begin investing;
- when given a concrete extra-USD-10 scenario, 15/16 wanted to save at least part of it.

Core insight:

> The intention to build capital appears to exist. What is missing may be a practical path to start.

Follow-up signal:

> Eight specific students were asked whether they wanted updates; all eight gave their number.

Do not present the 16-person sample as representative or as product-market fit.

## Slide 4 — The product

**Turn future repayment capacity into an investment position today.**

Flow:

`capital provider → SeedLend directed credit → specific investment → locked/controlled position → user repays and builds`

The user is intended to build three assets at once:

1. **investment capital / ownership**;
2. **knowledge + verifiable educational credential**;
3. **verifiable repayment history / financial reputation**.

Key product hypothesis:

> You now own 40% of your investment.

Progressive legal/economic ownership is a product concept, not implemented in the hackathon contracts.

## Slide 5 — Distribution + network effect

**Universities can become both the learning layer and the growth engine.**

Flywheel:

`free monthly course → theory/practical assessment → invest + repay → visible outcomes / peer proof → next cohort`

Reasons this may compound:

- students spend four or five years in the same institutions and peer groups;
- visible milestones may create social proof and referrals;
- recurring course cohorts create an acquisition channel before relying on paid ads;
- specialized paid courses can emerge as SeedLend builds trust;
- B2B/B2B2C university services create a second revenue path.

Business-model hypotheses shown in the deck:

- B2C: financing/service economics + specialized education;
- B2B2C: university education, cohorts, credentials and related services.

Network effects, partnerships and pricing remain hypotheses to validate.

## Slide 6 — Why blockchain

**The lender must know the financed position actually exists before the loan becomes active.**

Architecture:

`Sepolia PositionLocked → Attestcoin proof gate → Creditcoin loan lifecycle`

Central rule:

> **NO VERIFIED POSITION, NO ACTIVATED LOAN.**

The proof must match the expected vault, loan ID, borrower, asset, principal and committed terms.

Public MVP demonstration facts:

- principal: 100 tCTC;
- total due: 108 tCTC;
- position: 100 SLDP;
- repayments: 3 × 36 tCTC;
- final remaining balance: 0;
- final state: `Paid` + `ReleaseEligible`.

SLDP is an unbacked test token. Attestcoin is a state-transition dependency, not an analytics add-on.

## Slide 7 — From hackathon MVP to fintech

**We proved the trust primitive. Now the product can expand around it.**

Working now:

- Creditcoin loan lifecycle on CC3 testnet;
- Sepolia financed-position lock;
- Attestcoin proof-gated activation;
- replay protection + exact terms matching;
- verifiable repayment records;
- `Paid` + `ReleaseEligible` completion evidence.

Next product layers:

- production investment execution / settlement;
- monthly schedules + grace/default rules;
- progressive ownership mechanics;
- education credentials + university identity;
- underwriting, reserves and recovery;
- multiple investment rails / diversified assets.

Final close:

> SeedLend is not about helping young people borrow earlier.
>
> **It is about helping them start building earlier.**

## Accuracy rules

- Demo is testnet-only and uses no real funds.
- SLDP is not an RWA and has no promised return.
- 100 → 108 tCTC is not an 8% APR; no calendar/APR is encoded.
- Current payment records are SeedLend repayment history, not a bureau credit score.
- Course certification, ZK university identity, progressive ownership, default recovery and real asset execution are roadmap concepts, not current MVP functionality.
