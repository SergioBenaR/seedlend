# Verification log

## 26 August 2026

### Official hackathon page

- Extended deadline: 13 September 2026, 23:59 ET.
- Required: original work created during the hackathon, testnet deployment, functional Attestcoin integration, README, technical integration documentation, GitHub URL, deck or whitepaper PDF URL and prototype demo video URL.
- Prize pool: USD 15,000 across first, second and third place.

Source: <https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail>

### Official Creditcoin material

- Attestcoin uses a source contract, worker/proof flow, verification on Creditcoin and subsequent business logic.
- Creditcoin provides guided cross-chain loan examples and Sepolia-oriented examples.

Sources:

- <https://creditcoin.org/USC>
- <https://docs.creditcoin.org/creditcoin-usc/guided-tutorials>
- <https://github.com/gluwa/usc-testnet-bridge-examples>

### Local development environment

- Node.js: available (`v24.19.0`).
- pnpm: available (`11.19.0`).
- Git: available.
- Foundry/Forge: not installed in this environment at the time of the check.

Consequent limitation: repository smoke tests can run now; Solidity compilation, Foundry tests and deployment cannot be claimed until Forge is available.

### T02 environment verification

- Current Attestcoin environment: Creditcoin CC3 Testnet, EVM chain ID `102031`.
- Public RPC responded with `eth_chainId = 0x18e8f` (`102031`).
- Ethereum Sepolia is supported with Attestcoin `chainKey = 1`; Sepolia's own chain ID is `11155111`.
- Proof Builder, dashboard and Blockscout endpoints responded successfully.
- Current npm release of `@gluwa/usc-sdk`: `0.18.0`.
- Official example dependencies use Solidity `0.8.30`, EVM target `shanghai` and Foundry `v1.2.3`.
- Foundry `v1.2.3` was downloaded from the official release, verified against SHA-256 `8202f38f1635c2793b2d1a4fe443ae6f7315190dc6eed219d7969a40ab78a286` and installed project-locally.
- A live `eth_call` to the ChainInfo precompile returned Ethereum Mainnet as `(chainKey 3, chainId 1)` and Sepolia as `(chainKey 1, chainId 11155111)`.
- The TypeScript environment verifier compiles. Its live Node request times out in this managed workspace, while equivalent calls through `curl` succeed; this is recorded as an execution-environment limitation rather than a Creditcoin failure.

The earlier Foundry limitation is resolved for this workspace. User-specific Sepolia RPC, testnet wallet and faucet funds remain unavailable.

## 27 August 2026

### T05 Attestcoin implementation

- The official example repository now resolves to `gluwa/attestcoin-protocol-examples`; reviewed commit: `40541b1063d7795ac153a09d9d72f2b2feef10f6`.
- The current official example uses `@gluwa/usc-sdk@0.18.0`, `@gluwa/usc-contracts@0.1.2`, the native verifier at `0x0000000000000000000000000000000000000FD2` and the `verifyAndEmit` proof flow.
- `SeedLendLoan` now verifies and consumes Attestcoin proofs, decodes the proven EVM receipt and matches the exact `PositionLocked` event before activation.
- The worker now validates the source event, waits for attestation, requests the official proof payload and submits it to Creditcoin.
- The owner-controlled Creditcoin wallet has testnet CTC. Live end-to-end execution still requires Sepolia RPC access, Sepolia gas, deployments and a real source transaction.

Source: <https://github.com/gluwa/attestcoin-protocol-examples>
