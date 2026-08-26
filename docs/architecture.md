# MVP architecture

## Verified platform requirement

BUIDL CTC requires a meaningful and functional Attestcoin Protocol integration running inside the project, technical setup documentation and a testnet deployment. Depth of Attestcoin utilization is a core scoring criterion.

Creditcoin's official material describes this flow:

1. a source-chain contract emits the required data;
2. an off-chain worker observes the event and obtains proofs;
3. an Attestcoin smart contract on Creditcoin calls the native verifier;
4. verified data triggers Creditcoin business logic.

Sources verified on 26 August 2026:

- <https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail>
- <https://creditcoin.org/USC>
- <https://docs.creditcoin.org/creditcoin-usc/guided-tutorials>

## SeedLend mapping

| Platform component | SeedLend responsibility |
|---|---|
| Creditcoin testnet | Canonical loan identity, terms, lifecycle and payment history |
| Ethereum Sepolia | Canonical existence and lock state of the demo investment position |
| Attestcoin Protocol | Verifies the Sepolia source event before loan activation |
| Worker | Observes, prepares and submits the official proof payload |
| Web app | Makes the verified state transitions understandable and reproducible |

## MVP terminal boundary

The final implemented state is `Paid`, accompanied by `ReleaseEligible`. The scaffold does not assume that Attestcoin already provides the reverse Creditcoin-to-Sepolia execution needed for automatic release.

## Shared identity

`loanId` is created on Creditcoin and included in the Sepolia position event. Activation must additionally match borrower, asset, principal, terms commitment, source chain and authorized vault. `loanId` alone is insufficient.
