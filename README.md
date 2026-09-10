# SeedLend

SeedLend is a pre-MVP protocol for directed investment microcredit. Its hackathon version demonstrates how a loan on Creditcoin can be activated only after Attestcoin verifies that the corresponding investment position was created and locked on an external chain.

## Current objective

Build an original, testnet-deployed submission for BUIDL CTC 2026 Fall whose core path is:

`loan created → position locked on Sepolia → Attestcoin proof → loan activated on Creditcoin → repayments recorded → release eligibility`

The prototype does not use real money, does not promise returns and does not claim that its demonstration asset is a legally backed RWA.

## Implementation status

- T01 repository scaffold: complete.
- T02 public environment and tool verification: complete; the owner-controlled Creditcoin wallet is funded with testnet CTC.
- T03 Creditcoin loan model: implemented and covered by seven Foundry tests.
- T04 Sepolia position vault: implemented and covered by seven Foundry tests.
- T05 Attestcoin proof verification: implemented locally in the Creditcoin contract and one-shot worker; live end-to-end verification awaits testnet deployment.
- T06 deployment preparation: demo asset, safe deployment automation and local deployment validation complete; public-testnet deployment remains pending.

## MVP boundary

Included:

- `SeedLendLoan` on Creditcoin testnet;
- `SeedLendVault` on Ethereum Sepolia;
- functional Attestcoin verification;
- testnet repayment history inside SeedLend;
- a reproducible demo, web interface and technical documentation.

Excluded until separately designed and validated:

- automatic Creditcoin-to-Sepolia asset release;
- defaults, liquidation and secondary-market economics;
- production credit scoring or external credit-bureau integration;
- real users, real funds, KYC/AML and legal RWA rights;
- DCA, social incentives and a production financial model.

## Repository layout

```text
contracts/creditcoin/  SeedLendLoan and its tests
contracts/sepolia/     SeedLendVault and its tests
worker/                Attestcoin proof workflow
app/                   Web interface
scripts/               Local checks and guarded deployment automation
tests/                 Repository-level smoke tests
docs/                  Architecture, decisions and verification log
```

## Local setup

Required now:

- Node.js 20 or newer;
- pnpm 11;
- Git.

Required before contract implementation and deployment:

- Foundry `v1.2.3`, matching the official Creditcoin example repository verified on 26 August 2026.

Run the dependency-free repository checks:

```bash
pnpm test
```

Inspect local prerequisites:

```bash
pnpm preflight
```

Each contract package can be checked independently:

```bash
cd contracts/creditcoin && forge test
cd contracts/sepolia && forge test
```

In this workspace, the verified project-local binary is stored outside version control under `.tools/foundry/`.

Verify the public Creditcoin and Attestcoin environment:

```bash
pnpm verify:networks
```

Copy `.env.example` to `.env` only when testnet configuration is available. Never commit private keys or secrets.

Validate deployment preparation without sending transactions:

```bash
pnpm deploy:check
```

The guarded public-testnet procedure is documented in `docs/t06-deployment.md`.

## Working method

SeedLend uses Scrumban with one technical task and one product/validation task in progress. The detailed execution plan is maintained as a separate project artifact.

## Official references

- [BUIDL CTC 2026 Fall requirements](https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail)
- [Attestcoin Protocol overview](https://creditcoin.org/USC)
- [Creditcoin guided tutorials](https://docs.creditcoin.org/creditcoin-usc/guided-tutorials)
- [Official USC examples](https://github.com/gluwa/usc-testnet-bridge-examples)

## License

No open-source license has been selected. All rights remain reserved until the project owner makes that decision.
