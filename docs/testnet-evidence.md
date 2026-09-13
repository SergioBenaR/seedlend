# SeedLend public testnet evidence

Updated: 13 September 2026

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

## Final public demo run

The current demo reuses the deployed contracts above and executes Loan #2 through the complete implemented lifecycle.

- Loan ID: `2`
- Principal: 100 tCTC
- Total due: 105 tCTC
- Demonstration payments: 5 × 21 tCTC
- Position: 100 SLDP
- Terms hash: `0x95a88687f771171ebe70e5ce877a06ce9aefd83ad5726a8604d410a670206ff6`

### Source position and activation

1. PositionLocked: https://sepolia.etherscan.io/tx/0x104f7840f56665e9c1ed5c3221e074df9e36256423f5b6637896e1148547bdaa
2. Attestcoin proof / Creditcoin activation: https://creditcoin-testnet.blockscout.com/tx/0xe47dc33a03c4de024fc3281b90b51ed56bfb9cee91472856afc25a336e7c7f39

### Repayments

1. 21 tCTC: https://creditcoin-testnet.blockscout.com/tx/0x0ff5ba45e7d94635a8826993633c04fb42282de7c1221ddd1f77bf45a68523aa
2. 21 tCTC: https://creditcoin-testnet.blockscout.com/tx/0x710b0db28eb38ffadf71dbbb83095f632b76bbe43d7b72df0e0be51f431c7726
3. 21 tCTC: https://creditcoin-testnet.blockscout.com/tx/0x9bcbd40f762cb3fd821baf7fae9158cd7429f4600ffab58ae774a4d9fe83288e
4. 21 tCTC: https://creditcoin-testnet.blockscout.com/tx/0xa3d4d05830b0215bced5d5d19895795eecd8a8dc94d35f121a961c94a0244fbd
5. 21 tCTC / LoanPaid / ReleaseEligible: https://creditcoin-testnet.blockscout.com/tx/0xbbad48dcc51bd9315de0767511af84f32eb563f2431d555e73caefd5b9eb388d

## Verified final state

- Payment records: 5
- Total repaid: 105 tCTC
- Remaining balance: 0 tCTC
- LoanPaid emitted: yes
- ReleaseEligible emitted: yes
- Source chain: Sepolia, chainKey 1

The extra 5 tCTC is total demo interest. It is not presented as a 5% APR because the current contract does not encode a repayment period or APR.
