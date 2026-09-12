# SeedLend product strategy

_Last consolidated: 12 September 2026._

This document is the durable source of truth for the broader SeedLend product thesis. It intentionally separates what exists in the hackathon MVP from product hypotheses, future mechanisms and business-model ideas so that future pitch/demo work does not depend on reconstructing prior conversations.

## Core thesis

SeedLend is a directed-investment credit product for people who do not yet have enough initial capital, credit history or collateral to begin building an investment position.

The product is not meant to hand out unrestricted cash. The capital is directed into an investment position, while the user repays over time, learns how investing works and builds verifiable repayment history.

The intended outcome is that the user builds three assets at the same time:

1. **investment capital / ownership**;
2. **financial knowledge and verifiable educational credentials**;
3. **verifiable repayment history / financial reputation**.

Working positioning:

> Your first investment should not have to wait until you already have the capital.

Working strategic close:

> SeedLend is not about helping young people borrow earlier. It is about helping them start building earlier.

## Initial market and user

The initial focus is young adults, especially university students in Latin America, roughly in the first years of financial independence.

The opportunity is not based on the claim that every young person is irresponsible. The observed problem is that many young people reach adulthood with a consumption-first financial model, little practical investing education, no meaningful credit history and a belief that investing requires much more starting capital than they currently have.

A key product insight is that the intention to save or build capital may already exist even when the normal habit is to spend. SeedLend is intended to create a practical mechanism that converts small recurring payment capacity into an investment position.

Latin America is the preferred initial narrative because the founder has direct access to university communities and the problem appears across multiple countries. Expansion to other emerging markets, including Africa, is plausible but not part of the current validated scope.

## Why SeedLend is different from conventional credit and overcollateralized DeFi lending

Conventional consumer credit normally gives the borrower money to spend. SeedLend directs financing into an investment position.

Overcollateralized DeFi lending such as borrowing against WBTC assumes the user already owns valuable collateral. SeedLend is designed for the opposite cold-start problem: a person who does not yet have sufficient capital or collateral and wants to begin building it.

This is the conceptual inversion:

- traditional credit can finance consumption;
- overcollateralized DeFi can unlock liquidity from assets the user already owns;
- **SeedLend is intended to help a user create the first asset position itself.**

## Product journey

The current working progression is:

`Learn → Simulate → Unlock → Invest → Pay → Own more → Diversify → Build`

### 1. Learn

SeedLend should run a **free public introductory investment course every month**.

Reasons:

- educate prospective users before they take investment-related credit;
- create a recurring user-acquisition channel;
- build trust and reputation;
- create cohorts of students who learn together;
- make education part of SeedLend's risk-management and product experience rather than a marketing add-on.

The course should cover at minimum risk, return, compound interest, diversification, financing cost, basic asset classes and the difference between investing and speculation.

### 2. Test and certify

Users should complete both a **theoretical and practical assessment**.

Passing users may receive a verifiable certificate that can be used as evidence of investment knowledge and potentially added to a CV or professional profile.

Longer-term, the educational credential could be anchored or registered using blockchain/verifiable-credential infrastructure, while avoiding publication of unnecessary personal data.

The important distinction is that educational credentials and repayment history are two separate proofs that may later be combined into a broader SeedLend reputation/passport experience.

### 3. Simulate

Before committing capital, users should interact with practical simulations/calculators showing:

- financing cost;
- potential asset return scenarios;
- market-loss scenarios;
- time and compounding;
- repayment schedule;
- effect of missed payments;
- diversification choices.

### 4. Unlock

Education should unlock progressively greater investment choice rather than forcing every beginner to make the same decisions from day one.

A possible structure is:

- first position: limited menu of relatively simple/lower-risk choices;
- after passing the course/exam: more autonomy to select or redistribute exposure;
- specialized education may unlock more complex sectors or strategies.

Exact asset tiers and unlock rules are not yet decided.

### 5. Invest

SeedLend directs capital into the selected investment position instead of transferring unrestricted principal to the user.

The intended production flow is conceptually:

`capital provider → SeedLend execution layer → investment position → verified position → credit activation`

The current hackathon MVP proves the trust layer between an external position and the Creditcoin loan; it does **not** yet implement production asset purchase/settlement for BTC, equities, tokenized securities or DeFi positions.

Potential future categories discussed include:

- Bitcoin;
- global equities or tokenized equities where legally/technically appropriate;
- diversified portfolios;
- lower-risk yield-bearing strategies;
- DeFi strategies.

No provider, protocol or asset partner is currently selected. References to protocols such as Aave, Morpho, Aerodrome, PancakeSwap or Uniswap are possible future integration examples, not partnerships.

### 6. Pay and progressively own more

A strong product hypothesis is to make ownership progression visible after every repayment.

Example user feedback:

> You now own X% of this investment.

The purpose is to reframe repayment psychologically from only "paying a debt" into "increasing ownership of an asset I am building."

The exact legal/economic mechanism for progressive ownership is not implemented in the hackathon MVP and must be designed carefully for production.

### 7. Diversify

After completing required education and demonstrating understanding, users should be able to decide how to redistribute or diversify their investment subject to product/risk constraints.

The product goal is increasing autonomy as financial competence increases.

## Repayment discipline and financial reputation

SeedLend should eventually have a real repayment calendar. A working hypothesis is:

- fixed monthly due dates;
- a short grace period (the current idea is up to five days);
- incentives or consequences for late payment;
- restructuring/grace mechanisms before any severe default action.

Late-payment penalties are only a hypothesis. They must be tested because punitive fees can worsen temporary financial difficulty.

The current hackathon smart contract does **not** impose dates, installment size or lateness. It records payer, amount and timestamp and reaches `Paid` when total due is repaid. Therefore current data should be described as **verifiable repayment history**, not an on-time credit score or bureau history.

A future **SeedLend Credit Passport** could show wallet/user linkage as legally appropriate, completed loans, total repaid, repayment records, educational credentials, final loan status and public proof references.

## Why lend to someone without existing credit history or collateral?

The product exists specifically because lack of initial capital, credit history and collateral creates the cold-start problem.

The risk thesis is different from unsecured cash credit because:

- financing is directed rather than freely spendable;
- the funded investment position is expected to remain controlled/locked under product rules;
- the position may begin producing market return or appreciating/depreciating from the start;
- the user receives financial education before being given increasing autonomy;
- repayment behavior becomes verifiable over time;
- underwriting, limits, reserves and recovery rules can be added around the position in production.

This structure may reduce some forms of misuse and credit risk but does **not** eliminate market risk, default risk or the possibility that the investment value falls below the outstanding debt.

## Return and reinvestment thesis

Potential return is a legitimate adoption driver and should not be hidden behind an education-only narrative.

SeedLend itself must not promise a fixed return. Return comes from the financed asset/strategy and must be presented together with risk and financing cost.

A product objective is to select/offer investment options for which the expected risk/return profile can make sense relative to financing cost. If financing cost is structurally higher than the expected return without some other compelling benefit, the product would not make economic sense on return alone.

Potential generated returns could be reinvested according to product rules, increasing the user's position over time. The same principal cannot simultaneously be counted as belonging to one user's investment and be re-lent to another user; any capital-recycling mechanism requires a separate financial design.

## Missed payments and default — product hypothesis

This is not implemented in the hackathon MVP but must not remain conceptually unanswered.

Working direction:

1. a missed due date does not trigger immediate liquidation;
2. grace/restructuring should exist;
3. persistent default may allow the controlled investment position to be sold, transferred or otherwise used to recover outstanding debt;
4. a future secondary market could allow another eligible user to assume a position and remaining payment obligations rather than forcing liquidation;
5. rules must determine how surplus value is returned to the original user and how any shortfall is absorbed if the position is worth less than the outstanding debt.

The secondary-market concept is part of the original SeedLend vision but remains a future hypothesis, not current functionality.

## Education business line

The mandatory/public introductory course should remain free because it is both a financial-education mechanism and a recurring acquisition funnel.

SeedLend could later offer **paid specialized investment education** by:

- sector;
- profession/career;
- asset class;
- interest profile;
- skill level.

These courses could have a profit margin and help position SeedLend as a fintech with recognized investment-education expertise.

## University/community strategy and network effects

The university setting is not only a demographic target; it may be a distribution and behavioral advantage.

Students often remain in the same institution and peer groups for four or five years. This creates possible mechanisms for:

- peer learning;
- social proof;
- accountability;
- referrals;
- visible progress toward first-investment milestones;
- cohort-based education;
- community investing;
- future group-based risk mechanisms.

Founder interviews already showed that group context influenced answers and spending behavior. One participant said, in substance, **"when I'm with you, I always spend."** This is qualitative evidence that financial behavior can be socially influenced, not proof that SeedLend communities will reduce default.

The founder also notes an existing analogue in group microfinance: organizations such as Pro Mujer use group/social-guarantee mechanisms in some microcredit contexts. SeedLend should study these mechanisms but should not claim its own network effects until validated.

A future product could experiment with cohorts, collective goals, peer accountability or other community mechanisms without necessarily making every loan jointly liable.

## User-acquisition thesis

The desired acquisition engine is outcome-led rather than ad-led:

- free monthly public course;
- university workshops and cohorts;
- visible investment progress;
- verifiable certificates;
- users sharing milestones/results;
- community effects and referrals;
- university partnerships.

The aspiration is that users are attracted by seeing that SeedLend lets people start building investment capital without first having a large balance, conventional credit history or traditional collateral.

This remains a growth hypothesis to validate.

## Business model hypotheses

No final production pricing is selected. Candidate revenue streams are:

### B2C

- a percentage of investment return generated for the user;
- a financing/service fee, potentially represented as a percentage of annual interest/payment economics;
- paid specialized investment courses;
- optional premium services later.

### B2B / B2B2C

Universities could pay for services or benefits related to financial education, student cohorts, verified credentials, analytics or student financial-wellness/investment programs.

The hackathon pitch should present monetization as plausible business-model hypotheses, not finalized economics.

## Identity, universities and privacy

Universities already possess identity/enrollment information for their students. A future architecture could use university-issued credentials, selective disclosure or zero-knowledge proofs to verify claims such as:

- active student status;
- age/eligibility threshold;
- membership in a specific institution or program;

without exposing all of the student's underlying documents to SeedLend.

A social-profile link could also be requested as a product/reputation signal, but its relevance, privacy implications and underwriting value are unvalidated.

Do not claim that a university integration or ZK identity system currently exists.

## Community segmentation and gender observations

Founder interviews produced a visible qualitative pattern: in the sampled groups, betting/crypto risk-taking appeared more often among men, while women more often expressed caution and information-seeking before acting.

This should be treated as a **segmentation hypothesis**, not a population claim and not a credit criterion. Gender is not proposed as an underwriting criterion.

A more useful product segmentation is likely:

- cautious / information-seeking users;
- return-seeking / risk-tolerant users.

The current sample suggests these profiles may correlate with gender in some university contexts, but more research across institutions, cities and socioeconomic segments is required.

## Current hackathon MVP boundary

The implemented hackathon vertical slice proves:

- canonical loan state on Creditcoin;
- external demo position on Sepolia;
- Attestcoin verification as a mandatory gate before activation;
- exact matching of source chain, vault, loan ID, borrower, asset, principal and committed terms;
- replay protection through Attestcoin query ID;
- native tCTC repayment history;
- transition to `Paid` and emission of `ReleaseEligible`.

The demo does **not** currently implement:

- production asset purchase/settlement;
- automatic cross-chain release after full repayment;
- real investment assets;
- formal due dates/late penalties;
- liquidation/default recovery;
- secondary market;
- production underwriting;
- KYC/AML or legal custody;
- university identity/ZK integration;
- educational credential issuance;
- progressive ownership UI/mechanics;
- production APR/economic model.

These boundaries must be stated honestly while showing that the MVP proves the hardest trust primitive: the loan cannot activate unless the expected external investment position is cryptographically verified.

## Pitch/storytelling rules

1. **SeedLend appears from the first second.** Do not wait more than a minute to reveal the product name.
2. Open with the opportunity, not blockchain: **"What if you could make your first investment before you had the capital — without depending on traditional credit?"**
3. Establish the Latin American problem with recent, defensible data plus SeedLend's own interviews.
4. Show the three-value stack: capital + financial knowledge/credential + repayment history.
5. Explain why starting earlier matters: time, compounding and access to broader investment opportunities.
6. Explain the directed-capital model before introducing blockchain.
7. Introduce the trust question naturally: how does the lender know the financed position actually exists?
8. Only then introduce Creditcoin + Attestcoin as the necessary trust infrastructure.
9. Give the live/product demo enough time. The demo should tell the user's story, not merely show transaction hashes.
10. Distinguish clearly between what is implemented and what is roadmap.
11. Do not call 100 tCTC → 108 tCTC an 8% APR; the demo has no on-chain calendar/APR.
12. Do not imply SLDP is a real RWA or has legal backing/yield.
13. Do not imply partnerships with investment protocols/providers that do not exist.
14. Do not claim current payment data is a formal credit score or bureau record.
15. Do not claim 16 interviews prove product-market fit. They are early validation signals and hypothesis refinement.

## Near-term validation plan

Continue interviews across:

- public and private universities;
- universities with different tuition/cost profiles;
- different academic disciplines;
- additional cities;
- ideally later additional LATAM countries.

The planned public-university workshop on 14 September 2026 is an opportunity to ask the same core questions to a different cohort and compare results with the first private-university sample.

Keep in-person group observations separate from anonymous online survey results because peer influence is itself a variable.

## Questions still genuinely open

- production underwriting model;
- capital-provider structure;
- target financing cost/APR and unit economics;
- exact low-risk starting asset(s);
- exact ownership-transfer mechanism while repayments occur;
- treatment of investment gains/losses during the loan;
- default shortfall allocation;
- grace/restructuring policy and whether late fees help or hurt;
- production jurisdiction and regulatory classification;
- KYC/AML/custody requirements;
- exact university/B2B offering;
- credential standard and identity/privacy architecture;
- whether community/network effects materially improve acquisition or repayment;
- final revenue mix.
