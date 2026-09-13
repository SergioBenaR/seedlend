# SeedLend — working hackathon video script

_Last consolidated: 13 September 2026._

Target final duration: **3:45–3:55**. SeedLend must appear from the first second. Product story first; blockchain appears only when the trust problem has been established. The technical demo should receive roughly **65–75 seconds**.

## 0:00–0:18 — Opening

**Narration**

> SeedLend starts with one question: what if you could make your first investment before you had the capital — without depending on traditional credit?
>
> We are building a new way for young people to start building wealth earlier.

**Screen**

SeedLend branding from frame one. Show the idea of a first investment becoming accessible before the user has accumulated the full initial capital.

## 0:18–0:43 — Latin America problem

**Narration**

> Across Latin America, many young people reach adulthood prepared to study and work, but not necessarily to build capital. Recent evidence still shows major gaps in financial literacy.
>
> In Brazil, 45.1% of 15-year-old students in PISA 2022 performed below the baseline level of financial literacy. In Colombia, a representative 2023 survey found that only 16.4% of adults could correctly answer three basic questions about interest, inflation and diversification.

**Sources**

- OECD, PISA 2022 Financial Literacy — Brazil: https://www.oecd.org/en/publications/pisa-2022-results-volume-iv-factsheets_34d60137-en/brazil_1c815ef9-en.html
- Banco de la República de Colombia, 2023 Invamer survey / Big Three: https://banrep.gov.co/es/blog/educacion-financiera-evidencia-colombia-entorno-alta-inflacion

Do not present the Brazil and Colombia percentages as directly comparable metrics; they measure different populations and tests.

## 0:43–1:08 — First customer discovery

**Narration**

> We wanted to see what this looks like around us, so we interviewed 16 university students in La Paz, Bolivia.
>
> Eleven said they normally spend the money they have left. Eleven reported receiving no practical financial education. And ten believed they needed at least 500 dollars just to begin investing.

**Screen**

Show `16 interviews · La Paz, Bolivia`, then only the three strongest figures. Clearly label this as **early customer discovery**, not population research.

## 1:08–1:22 — Key discovery

**Narration**

> But when we gave them a concrete scenario with just ten extra dollars, 15 out of 16 wanted to save at least part of it.
>
> The intention to build capital is there. What is missing is a practical path to start.

**Screen**

Contrast `11/16 normally spend` with `15/16 would save at least part of an extra $10`.

## 1:22–1:48 — SeedLend product

**Narration**

> SeedLend creates that path. Instead of handing the user unrestricted cash, financing is directed into a specific investment position.
>
> The user can begin without already owning the capital or investment collateral, repay over time, and build three things together: investment capital, financial knowledge and a verifiable repayment record.

**Screen**

Use the product flow now implemented in the demo:

`No existing investment collateral → Directed credit → Capital goes to the investment → Repay and build ownership`

## 1:48–2:08 — Progress and ownership concept

**Narration**

> And every payment should feel different from paying a normal debt. Instead of only seeing a balance fall, the user should see progress grow: “You now own 20%, 40%, 60% of your investment.”

**Screen**

Show the illustrative ownership-progress card. Keep the visible label **PRODUCT CONCEPT**. Progressive legal/economic ownership per payment is not implemented in the hackathon contract.

## 2:08–2:28 — Education, credentials and autonomy

**Narration**

> SeedLend is also designed to teach before giving users more investment freedom. A free monthly course can combine practical and theoretical assessment. Passing it can unlock more choice over how the investment is allocated.
>
> The user can eventually leave with two separate verifiable signals: what they learned, and how they repaid.

**Screen**

Show `Learn → Pass → Unlock → Invest → Pay → Own more → Diversify`, plus education credential and repayment record as separate concepts.

Do not claim current blockchain certification or university integration is already implemented.

## 2:28–2:43 — University network effect

**Narration**

> Universities are more than an acquisition channel. Students spend four or five years together, influence what their friends try and can motivate each other. SeedLend can turn part of that social effect toward learning and building capital together.

**Screen**

Show a cohort/community concept, not a claim that peer pressure already reduces SeedLend defaults.

## 2:43–2:58 — Why blockchain appears

**Narration**

> But financing an investment creates a critical trust problem. How does the lender know the financed money actually became the investment it was supposed to finance — especially when that position can live somewhere else?

**Screen**

Transition from product view to proof architecture.

## 2:58–3:08 — Creditcoin + Attestcoin

**Narration**

> That is why we built the first SeedLend infrastructure with Creditcoin and Attestcoin. Creditcoin manages the loan lifecycle, the investment position can exist on another chain, and Attestcoin proves that position before the loan can activate.
>
> No verified position, no activated loan.

## 3:08–3:48 — Technical demo

**Narration**

> Here is the SeedLend MVP. Loan number two is created on Creditcoin for 100 tCTC, with a total due of 105 tCTC, but it cannot activate yet.
>
> First, the corresponding 100-token demonstration position is locked on Sepolia. Attestcoin then proves that source transaction to Creditcoin. The destination contract checks the exact vault, loan ID, borrower, asset, principal and committed terms before changing the loan to Active.
>
> The borrower then repays in five demonstration payments of 21 tCTC. Each payment, amount and timestamp is recorded on Creditcoin and forwarded to the originator. Those five payments complete the 105 tCTC total due.
>
> The loan reaches Paid, the remaining balance becomes zero, and the contract emits ReleaseEligible.

**Screen order**

1. Loan #2 / 100 tCTC principal / 105 tCTC total due.
2. Sepolia `PositionLocked` transaction.
3. Attestcoin activation transaction on Creditcoin.
4. `ACTIVE` state and `sourceQueryId` evidence.
5. Five repayment transactions of 21 tCTC each.
6. Final `Paid · 0 remaining · ReleaseEligible` state.

Do not read hashes aloud. Explorer links are evidence, not the story.

## 3:48–4:00 — Vision and close

If the edit is running long, prioritize the closing lines below and cut earlier exposition rather than the technical proof.

**Narration**

> Today the investment is intentionally only a test asset. What we proved is the trust layer for a much larger idea: helping someone who does not yet have capital or collateral begin building an investment, knowledge and financial reputation at the same time.
>
> SeedLend is not about helping young people borrow earlier. It is about helping them start building earlier.
>
> SeedLend. Your first investment starts here.

## Optional demand signal if timing allows

Use only if there are roughly 6–8 seconds available without weakening the close:

> When we asked eight students whether they wanted us to keep them updated, all eight gave us their number.

Exact interpretation: the founder asked those eight students for their numbers and all eight agreed. Do **not** present this as “8 of 16 converted” because the other interviewees were not asked.

## Non-negotiable accuracy rules

- SLDP is an unbacked demonstration ERC-20, not an RWA and not a yield-bearing asset.
- The approved public demo uses 100 tCTC principal, five repayments of 21 tCTC and 105 tCTC total due. The extra 5 tCTC is total demo interest; do not call it a 5% APR because no repayment period is defined on-chain.
- Current payment records are verifiable SeedLend repayment history, not a bureau credit score and not verified on-time history.
- Progressive ownership, monthly due dates/grace penalties, automatic asset purchase, real investment yield, course certification, ZK university identity, default liquidation/secondary market and automatic cross-chain release are product direction/roadmap, not current MVP functionality.
- Aave/Morpho/other protocols or asset providers must never be presented as partners or existing integrations unless independently established later.
