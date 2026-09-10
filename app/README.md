# SeedLend app

Public testnet demonstration interface for SeedLend.

The page is deliberately product-first rather than a generic hackathon landing page. It visualizes the completed lifecycle:

`Creditcoin loan → Sepolia position → Attestcoin proof → Creditcoin activation → repayments → ReleaseEligible`

Every evidence link points to a transaction or contract used in the Sepolia / Creditcoin CC3 testnet run documented in `../docs/testnet-evidence.md`.

## Build

```bash
pnpm --filter @seedlend/app build
```

The app is static and contains no signing material or backend secrets. Vercel should use `app/` as the project root; `vercel.json` builds the site into `dist/`.
