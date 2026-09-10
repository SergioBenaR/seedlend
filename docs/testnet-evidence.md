# SeedLend public testnet evidence

Generated: 2026-09-10T23:33:03.498Z

This is a testnet-only hackathon demonstration. SLDP is an unbacked demo asset and represents no legal claim or promised return.

## Actors

- Originator / position funder: `0xED37fe15C710801Eb8D48C2B0a7DA2B062656D4C`
- Borrower / payer: `0x6003609a9559f53f8DeAd1a74852E742B2157fe0`

## Deployed contracts

- Sepolia DemoPositionAsset (SLDP): `0x442a74AC5CD4B12E61A6ce20397b2ceA97896c24`
  - https://sepolia.etherscan.io/address/0x442a74AC5CD4B12E61A6ce20397b2ceA97896c24
- Sepolia SeedLendVault: `0x43120061E02461942b2aab72D4166b2df9ff3141`
  - https://sepolia.etherscan.io/address/0x43120061E02461942b2aab72D4166b2df9ff3141
- Creditcoin CC3 SeedLendLoan: `0x442a74AC5CD4B12E61A6ce20397b2ceA97896c24`
  - https://creditcoin-testnet.blockscout.com/address/0x442a74AC5CD4B12E61A6ce20397b2ceA97896c24
- Creditcoin CC3 EvmV1Decoder: `0x04B9ae8562D8Cc5bbbBbBB759080dDC30B56D18B`

The SLDP and SeedLendLoan addresses are identical numerically but exist on different EVM chains.

## End-to-end lifecycle

- Loan ID: `1`
- Principal: 100 tCTC
- Total due: 108 tCTC
- Demonstration payments: 3 × 36 tCTC
- Position: 100 SLDP
- Terms hash: `0x0295c2692b961707f77078d5623726ec5279e32396406b36f85dc5f637864c1c`

1. Demo asset deployment: https://sepolia.etherscan.io/tx/0x2c74e0a2fc45756e41f3a743c481e1fda80c04c27b6adf3e67a94109b42c5ac2
2. Vault deployment: https://sepolia.etherscan.io/tx/0xcb49d2a0a92c3bc724777d95197734aab38e9ac57e00f8197f302dc6ffbc7d2d
3. Creditcoin loan deployment: https://creditcoin-testnet.blockscout.com/tx/0xe938143eb5e90c4a7a14065d26a84c2ead039fc81c5e2dab903acb8a1021cbc4
4. Borrower funding: https://creditcoin-testnet.blockscout.com/tx/0x4484c5a70eedbdb750af90c909b38cadb58512be3ffb876f44eccd4f0237468e
5. SLDP approval: https://sepolia.etherscan.io/tx/0xf9e7ec6927adc0b844023bc419eda180a16be1e9af303d6cb57980e08e26178d
6. PositionLocked: https://sepolia.etherscan.io/tx/0xc03e701b73983554f92dcf5407049323f73890cbd82599f3e4b332a83c88f14f
7. Attestcoin proof / activation: https://creditcoin-testnet.blockscout.com/tx/0xf5cc29e469710cf66ea0764d383123232b6e07131ce9302de3176807c50ac5a7
8. Repayment 1: https://creditcoin-testnet.blockscout.com/tx/0x15693edf2ffc60a8f1b74a1b7c0c2f503b977a13a0121695a56bb08d4c4c44a2
9. Repayment 2: https://creditcoin-testnet.blockscout.com/tx/0x2e1e9ea3661f9fb87a689ce01163f2874a735138588459e495409f41e8a1316c
10. Repayment 3 / LoanPaid / ReleaseEligible: https://creditcoin-testnet.blockscout.com/tx/0x21abeecf414618f9b54cb910df09a0778363aef740c660409d89d69113bdf8bf

## Verified final state

- Payment records: 3
- Remaining balance: 0 tCTC
- LoanPaid emitted: yes
- ReleaseEligible emitted: yes
- Attestcoin Proof Builder: https://prover.cc3-testnet.creditcoin.network
- Source chain: Sepolia, chainKey 1
