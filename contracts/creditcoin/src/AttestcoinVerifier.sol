// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

/// @notice Interface of Creditcoin's native Attestcoin query verifier precompile.
interface INativeQueryVerifier {
    struct MerkleProofEntry {
        bytes32 hash;
        bool isLeft;
    }

    struct MerkleProof {
        bytes32 root;
        MerkleProofEntry[] siblings;
    }

    struct ContinuityProof {
        bytes32 lowerEndpointDigest;
        bytes32[] roots;
    }

    function verifyAndEmit(
        uint64 chainKey,
        uint64 height,
        bytes calldata encodedTransaction,
        MerkleProof calldata merkleProof,
        ContinuityProof calldata continuityProof
    ) external returns (bool);

    function calculateTxIndex(MerkleProof calldata merkleProof) external view returns (uint64);
}

/// @notice Shared Attestcoin proof verification and replay protection.
abstract contract AttestcoinVerifier {
    address internal constant VERIFIER_ADDRESS = 0x0000000000000000000000000000000000000FD2;

    INativeQueryVerifier public immutable verifier;
    mapping(bytes32 queryId => bool processed) public processedQueries;

    error ProofAlreadyProcessed(bytes32 queryId);
    error ProofVerificationFailed();

    constructor() {
        verifier = INativeQueryVerifier(VERIFIER_ADDRESS);
    }

    function _verifyAndConsume(
        uint64 chainKey,
        uint64 blockHeight,
        bytes calldata encodedTransaction,
        bytes32 merkleRoot,
        INativeQueryVerifier.MerkleProofEntry[] calldata siblings,
        bytes32 lowerEndpointDigest,
        bytes32[] calldata continuityRoots
    ) internal returns (bytes32 queryId) {
        INativeQueryVerifier.MerkleProof memory merkleProof =
            INativeQueryVerifier.MerkleProof({ root: merkleRoot, siblings: siblings });
        INativeQueryVerifier.ContinuityProof memory continuityProof = INativeQueryVerifier
            .ContinuityProof({ lowerEndpointDigest: lowerEndpointDigest, roots: continuityRoots });

        queryId = _computeQueryId(chainKey, blockHeight, merkleProof);
        if (processedQueries[queryId]) revert ProofAlreadyProcessed(queryId);

        bool verified = verifier.verifyAndEmit(
            chainKey, blockHeight, encodedTransaction, merkleProof, continuityProof
        );
        if (!verified) revert ProofVerificationFailed();

        processedQueries[queryId] = true;
    }

    function _computeQueryId(
        uint64 chainKey,
        uint64 blockHeight,
        INativeQueryVerifier.MerkleProof memory merkleProof
    ) private view returns (bytes32 queryId) {
        uint256 txIndex = verifier.calculateTxIndex(merkleProof);

        // This layout matches Creditcoin's official Attestcoin example.
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, chainKey)
            mstore(add(ptr, 32), shl(192, blockHeight))
            mstore(add(ptr, 40), txIndex)
            queryId := keccak256(ptr, 72)
        }
    }
}
