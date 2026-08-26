# T02 — verified development environment

**Verification date:** 26 August 2026

## Public configuration

| Value | Verified setting |
|---|---|
| Creditcoin environment | CC3 Testnet |
| Creditcoin EVM chain ID | `102031` |
| Native test token | `tCTC` |
| Creditcoin RPC | `https://rpc.cc3-testnet.creditcoin.network` |
| EVM explorer | `https://creditcoin-testnet.blockscout.com/` |
| Attestcoin dashboard | `https://dashboard.cc3-testnet.creditcoin.network/` |
| Proof Builder | `https://prover.cc3-testnet.creditcoin.network` |
| ChainInfo precompile | `0x0000000000000000000000000000000000000fd3` |
| BlockProver precompile | `0x0000000000000000000000000000000000000FD2` |
| Source chain | Ethereum Sepolia |
| Sepolia EVM chain ID | `11155111` |
| Sepolia Attestcoin `chainKey` | `1` |
| Attestcoin SDK | `@gluwa/usc-sdk@0.18.0` |
| Foundry version used by official examples | `v1.2.3` |
| Solidity version used by official examples | `0.8.30` |
| EVM target used by official examples | `shanghai` |

The Creditcoin RPC returned `eth_chainId = 0x18e8f`, which equals decimal `102031`. The dashboard, Proof Builder and explorer returned HTTP 200 during the same check.

## Critical distinction

`SOURCE_CHAIN_KEY=1` is an Attestcoin-internal identifier for Sepolia. It is not Sepolia's EVM chain ID, which is `11155111`.

## SDK flow selected for SeedLend

1. Query supported source chains through `PrecompileChainInfoProvider`.
2. Observe the Sepolia transaction and block.
3. Wait until the block is attested.
4. Request the proof using the hosted `ProofBuilder` service.
5. Submit proof data to the SeedLend Attestcoin contract on Creditcoin.
6. Verify through the BlockProver precompile and execute loan activation synchronously.

The worker must persist events in progress, catch up after shutdown, avoid duplicate submissions and retry attestation, proof generation and Creditcoin calls.

## Inputs not available and therefore not filled

- `SEPOLIA_RPC_URL`: requires a provider selected by the project owner.
- `DEPLOYER_PRIVATE_KEY`: must belong to a dedicated testnet-only wallet and must never be pasted into chat or committed.
- contract addresses: unavailable until deployment.
- transaction hashes and block heights: unavailable until the first source transaction.

## Testnet funds requiring owner action

Creditcoin's official faucet is operated through the Creditcoin Discord `token-faucet` channel. The owner must submit `/faucet address:<EVM address>` and wait for the success response. This cannot be completed without the owner's EVM address and Discord action.

Sepolia ETH is also required for source-chain deployment and transactions. No faucet was selected in T02 because the official Creditcoin tutorial accepts any Sepolia RPC provider and does not designate a single official Sepolia faucet.

## Sources

- <https://docs.creditcoin.org/environments/testnet.md>
- <https://docs.creditcoin.org/attestcoin-protocol/attestcoin-protocol-chains-environments.md>
- <https://docs.creditcoin.org/attestcoin-protocol/dapp-builder-infrastructure/attestcoin-sdk-usc-sdk.md>
- <https://docs.creditcoin.org/attestcoin-protocol/dapp-builder-infrastructure/offchain-readability-workers.md>
- <https://docs.creditcoin.org/wallets/using-testnet-faucet.md>
- <https://github.com/gluwa/attestcoin-protocol-examples>
