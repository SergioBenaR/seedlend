# Decision log

## Closed for the hackathon MVP

- SeedLend remains the project name, provisionally.
- The immediate objective is to maximize the probability of winning a BUIDL CTC prize.
- The product is directed investment microcredit, not a cash consumption loan.
- Creditcoin holds loan state; Sepolia holds the demonstration position.
- Attestcoin verification must gate loan activation.
- The MVP ends at release eligibility, not automatic cross-chain release.
- Payment history means history inside SeedLend, not automatic Credal integration.
- The demo asset must never be represented as a legally backed RWA unless that backing is separately verified.
- Secondary-market and community effects remain hypotheses outside the main demo.
- `termsHash` commits `loanId` and all material loan terms so an otherwise identical position cannot be silently reused for a different loan.
- `SeedLendVault` rejects fee-on-transfer assets because the verified position amount must equal the quantity actually received.
- The production contracts expose no manual activation or release shortcut; test-only hooks exist only in the Foundry harness.
- The verified source evidence is stored as Attestcoin's replay-protected `queryId`; the Sepolia transaction hash remains worker/UI metadata because it is not directly authenticated as a field by the destination contract.
- T05 follows the official one-shot proof flow using `@gluwa/usc-sdk@0.18.0` and `@gluwa/usc-contracts@0.1.2`.

## Open and intentionally not assumed

- demo asset and repayment token;
- loan amount, rate, number of installments and timing;
- final submission sector/track;
- production jurisdiction, custody, underwriting and compliance model;
- open-source license.
