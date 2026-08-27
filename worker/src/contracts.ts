export const seedLendLoanAbi = [
  "function activateFromPositionProof(uint256 loanId,uint64 chainKey,uint64 blockHeight,bytes encodedTransaction,bytes32 merkleRoot,(bytes32 hash,bool isLeft)[] siblings,bytes32 lowerEndpointDigest,bytes32[] continuityRoots) returns (bool)",
  "event LoanActivated(uint256 indexed loanId,bytes32 indexed sourceQueryId,uint256 positionAmount)",
] as const;

export const seedLendVaultAbi = [
  "event PositionLocked(uint256 indexed loanId,address indexed borrower,address indexed asset,uint256 principal,uint256 positionAmount,bytes32 termsHash)",
] as const;
