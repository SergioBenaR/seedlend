# T06 testnet deployment preparation

## Status

The deployment path is implemented and validated locally. No SeedLend contract has been deployed to Sepolia or Creditcoin by this task.

## Contracts

- Sepolia: `DemoPositionAsset`, a fixed-supply demonstration ERC20 with no legal or RWA backing.
- Sepolia: `SeedLendVault`, controlled by the configured position manager.
- Creditcoin CC3: `SeedLendLoan`, linked to Creditcoin's official pre-deployed `EvmV1Decoder`.

The current official example publishes `EvmV1Decoder` at `0x04B9ae8562D8Cc5bbbBbBB759080dDC30B56D18B`. Reusing it avoids an unnecessary deployment transaction.

## Safe local check

```bash
pnpm deploy:check
```

This compiles both contract groups and verifies library linking. It sends no transaction and needs no private key.

## Broadcast preparation

1. Copy `.env.example` to `.env`.
2. Fill only `SEPOLIA_RPC_URL`, `DEPLOYER_ADDRESS` and the dedicated testnet `DEPLOYER_PRIVATE_KEY` locally.
3. Confirm the wallet has Sepolia ETH and tCTC.
4. Run `pnpm deploy:testnets` only when a real deployment is intended.

The script derives the address from the key, checks both RPC chain IDs, confirms gas balances and verifies the decoder bytecode before broadcasting. It redacts the key and RPC URLs from handled command failures and writes public deployment results to the ignored file `.deployments/testnets.json`.

Never paste the private key into chat, documentation, GitHub or a command shared with another person. The key must control only a dedicated testnet wallet with no real assets.

## Validation performed

- Sepolia and Creditcoin compilation completed with Foundry `v1.2.3`.
- The complete three-contract deployment sequence completed against a local Anvil chain.
- No public-testnet balance was consumed.

Official reference reviewed on 10 September 2026: `gluwa/attestcoin-protocol-examples`, commit `6668487ad07fdf8119f54aab9db99b6c50155b5c`.
