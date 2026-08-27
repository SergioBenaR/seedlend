# SeedLend worker

This package implements the reproducible one-shot Attestcoin activation flow:

1. confirm that a successful Sepolia transaction emitted `PositionLocked` from the configured vault for the requested `loanId`;
2. wait until the Sepolia block is attested;
3. request the official proof payload from the Creditcoin Proof Builder;
4. submit that payload to `SeedLendLoan.activateFromPositionProof` on CC3 Testnet;
5. wait for the Creditcoin activation transaction.

The implementation uses `@gluwa/usc-sdk@0.18.0`, matching the official Attestcoin example reviewed on 27 August 2026.

After deployments and local `.env` configuration:

```bash
pnpm --filter @seedlend/worker activate-position <loanId> <sepoliaTransactionHash>
```

The worker never needs custody of the position asset. Its private key is used only to pay testnet gas for the Creditcoin proof-submission transaction.
