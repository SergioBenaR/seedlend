// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

import { EvmV1Decoder } from "@gluwa/asc-contracts/contracts/common/EvmV1Decoder.sol";
import { INativeQueryVerifier } from "../src/AttestcoinVerifier.sol";
import { SeedLendLoan } from "../src/SeedLendLoan.sol";

interface AttestcoinVm {
    function prank(address sender) external;
    function expectRevert(bytes4 selector) external;
    function expectRevert(bytes calldata revertData) external;
    function mockCall(address callee, bytes calldata data, bytes calldata returnData) external;
    function clearMockedCalls() external;
}

contract SeedLendAttestcoinTest {
    AttestcoinVm private constant vm =
        AttestcoinVm(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant VERIFIER = 0x0000000000000000000000000000000000000FD2;
    address private constant ORIGINATOR = address(0xA11CE);
    address private constant BORROWER = address(0xB0B);
    address private constant VAULT = address(0xCAFE);
    address private constant ASSET = address(0xA55E7);
    uint64 private constant SOURCE_CHAIN_ID = 11155111;
    uint64 private constant SOURCE_CHAIN_KEY = 1;
    uint64 private constant SOURCE_BLOCK = 8_765_432;
    uint256 private constant PRINCIPAL = 100e6;
    uint256 private constant POSITION_AMOUNT = 100e18;
    bytes32 private constant MERKLE_ROOT = keccak256("merkle root");
    bytes32 private constant LOWER_ENDPOINT = keccak256("lower endpoint");

    SeedLendLoan private loanContract;

    function setUp() public {
        loanContract = new SeedLendLoan(ORIGINATOR, SOURCE_CHAIN_ID, SOURCE_CHAIN_KEY);
        vm.mockCall(
            VERIFIER,
            abi.encodeWithSelector(INativeQueryVerifier.calculateTxIndex.selector),
            abi.encode(uint64(0))
        );
    }

    function testActivatesFromExactVerifiedPositionEvent() public {
        _mockVerification(true);
        uint256 loanId = _createLoan();
        bytes memory encodedTransaction = _encodedPositionTransaction(
            loanId, BORROWER, VAULT, ASSET, PRINCIPAL, POSITION_AMOUNT, _termsHash(loanId), 1
        );

        bool activated = _submitProof(loanId, SOURCE_CHAIN_KEY, encodedTransaction);
        SeedLendLoan.Loan memory loan = loanContract.getLoan(loanId);

        require(activated, "proof was not accepted");
        require(loan.status == SeedLendLoan.LoanStatus.Active, "loan not active");
        require(loan.positionAmount == POSITION_AMOUNT, "position amount mismatch");
        require(loan.sourceQueryId != bytes32(0), "query id missing");
        require(loanContract.processedQueries(loan.sourceQueryId), "query not consumed");
    }

    function testRejectsWrongSourceChainKey() public {
        uint256 loanId = _createLoan();
        bytes memory encodedTransaction = _validEncodedTransaction(loanId);

        vm.expectRevert(
            abi.encodeWithSelector(
                SeedLendLoan.UnexpectedSourceChainKey.selector, SOURCE_CHAIN_KEY, uint64(2)
            )
        );
        _submitProof(loanId, 2, encodedTransaction);
    }

    function testRejectsReplayedPositionProof() public {
        _mockVerification(true);
        uint256 loanId = _createLoan();
        bytes memory encodedTransaction = _validEncodedTransaction(loanId);
        _submitProof(loanId, SOURCE_CHAIN_KEY, encodedTransaction);
        bytes32 queryId = loanContract.getLoan(loanId).sourceQueryId;

        vm.expectRevert(
            abi.encodeWithSelector(bytes4(keccak256("ProofAlreadyProcessed(bytes32)")), queryId)
        );
        _submitProof(loanId, SOURCE_CHAIN_KEY, encodedTransaction);
    }

    function testRejectsFailedSourceTransaction() public {
        _mockVerification(true);
        uint256 loanId = _createLoan();
        bytes memory encodedTransaction = _encodedPositionTransaction(
            loanId, BORROWER, VAULT, ASSET, PRINCIPAL, POSITION_AMOUNT, _termsHash(loanId), 0
        );

        vm.expectRevert(SeedLendLoan.InvalidPositionProof.selector);
        _submitProof(loanId, SOURCE_CHAIN_KEY, encodedTransaction);
    }

    function testRejectsEventFromWrongVault() public {
        _mockVerification(true);
        uint256 loanId = _createLoan();
        bytes memory encodedTransaction = _encodedPositionTransaction(
            loanId,
            BORROWER,
            address(0xBAD),
            ASSET,
            PRINCIPAL,
            POSITION_AMOUNT,
            _termsHash(loanId),
            1
        );

        vm.expectRevert(SeedLendLoan.InvalidPositionProof.selector);
        _submitProof(loanId, SOURCE_CHAIN_KEY, encodedTransaction);
    }

    function testRejectsMismatchedTermsHash() public {
        _mockVerification(true);
        uint256 loanId = _createLoan();
        bytes memory encodedTransaction = _encodedPositionTransaction(
            loanId, BORROWER, VAULT, ASSET, PRINCIPAL, POSITION_AMOUNT, keccak256("wrong"), 1
        );

        vm.expectRevert(SeedLendLoan.InvalidPositionProof.selector);
        _submitProof(loanId, SOURCE_CHAIN_KEY, encodedTransaction);
    }

    function testRejectsMismatchedBorrowerAssetAndPrincipal() public {
        _mockVerification(true);
        uint256 loanId = _createLoan();
        bytes32 termsHash = _termsHash(loanId);
        bytes memory wrongBorrower = _encodedPositionTransaction(
            loanId, address(0xBAD), VAULT, ASSET, PRINCIPAL, POSITION_AMOUNT, termsHash, 1
        );
        bytes memory wrongAsset = _encodedPositionTransaction(
            loanId, BORROWER, VAULT, address(0xBAD), PRINCIPAL, POSITION_AMOUNT, termsHash, 1
        );
        bytes memory wrongPrincipal = _encodedPositionTransaction(
            loanId, BORROWER, VAULT, ASSET, PRINCIPAL + 1, POSITION_AMOUNT, termsHash, 1
        );

        vm.expectRevert(SeedLendLoan.InvalidPositionProof.selector);
        _submitProof(loanId, SOURCE_CHAIN_KEY, wrongBorrower);
        vm.expectRevert(SeedLendLoan.InvalidPositionProof.selector);
        _submitProof(loanId, SOURCE_CHAIN_KEY, wrongAsset);
        vm.expectRevert(SeedLendLoan.InvalidPositionProof.selector);
        _submitProof(loanId, SOURCE_CHAIN_KEY, wrongPrincipal);
    }

    function testRejectsUnverifiedProof() public {
        uint256 loanId = _createLoan();
        _mockVerification(false);
        bytes memory encodedTransaction = _validEncodedTransaction(loanId);

        vm.expectRevert(bytes4(keccak256("ProofVerificationFailed()")));
        _submitProof(loanId, SOURCE_CHAIN_KEY, encodedTransaction);
    }

    function testRejectsUnexpectedSourceChainAtLoanCreation() public {
        SeedLendLoan.LoanTermsInput memory terms = _validTerms();
        terms.sourceChainId = 1;

        vm.prank(ORIGINATOR);
        vm.expectRevert(
            abi.encodeWithSelector(
                SeedLendLoan.UnexpectedSourceChain.selector, SOURCE_CHAIN_ID, uint64(1)
            )
        );
        loanContract.createLoan(terms);
    }

    function _submitProof(uint256 loanId, uint64 chainKey, bytes memory encodedTransaction)
        private
        returns (bool)
    {
        INativeQueryVerifier.MerkleProofEntry[] memory siblings =
            new INativeQueryVerifier.MerkleProofEntry[](0);
        bytes32[] memory continuityRoots = new bytes32[](1);
        continuityRoots[0] = keccak256("continuity root");

        return loanContract.activateFromPositionProof(
            loanId,
            chainKey,
            SOURCE_BLOCK,
            encodedTransaction,
            MERKLE_ROOT,
            siblings,
            LOWER_ENDPOINT,
            continuityRoots
        );
    }

    function _mockVerification(bool result) private {
        vm.mockCall(
            VERIFIER,
            abi.encodeWithSelector(INativeQueryVerifier.verifyAndEmit.selector),
            abi.encode(result)
        );
    }

    function _validEncodedTransaction(uint256 loanId) private view returns (bytes memory) {
        return _encodedPositionTransaction(
            loanId, BORROWER, VAULT, ASSET, PRINCIPAL, POSITION_AMOUNT, _termsHash(loanId), 1
        );
    }

    function _encodedPositionTransaction(
        uint256 loanId,
        address borrower,
        address emitter,
        address asset,
        uint256 principal,
        uint256 positionAmount,
        bytes32 termsHash,
        uint8 receiptStatus
    ) private pure returns (bytes memory) {
        bytes32[] memory topics = new bytes32[](4);
        topics[0] = keccak256("PositionLocked(uint256,address,address,uint256,uint256,bytes32)");
        topics[1] = bytes32(loanId);
        topics[2] = bytes32(uint256(uint160(borrower)));
        topics[3] = bytes32(uint256(uint160(asset)));

        EvmV1Decoder.LogEntryTuple[] memory logs = new EvmV1Decoder.LogEntryTuple[](1);
        logs[0] = EvmV1Decoder.LogEntryTuple({
            address_: emitter,
            topics: topics,
            data: abi.encode(principal, positionAmount, termsHash)
        });

        bytes[] memory chunks = new bytes[](3);
        chunks[0] =
            abi.encode(uint64(0), uint64(100_000), borrower, false, emitter, uint256(0), bytes(""));
        chunks[1] = bytes("");
        chunks[2] = abi.encode(receiptStatus, uint64(80_000), logs, bytes(""));

        return abi.encode(uint8(2), chunks);
    }

    function _createLoan() private returns (uint256) {
        vm.prank(ORIGINATOR);
        return loanContract.createLoan(_validTerms());
    }

    function _termsHash(uint256 loanId) private view returns (bytes32) {
        return loanContract.computeTermsHash(loanId, _validTerms());
    }

    function _validTerms() private pure returns (SeedLendLoan.LoanTermsInput memory) {
        return SeedLendLoan.LoanTermsInput({
            borrower: BORROWER,
            principal: PRINCIPAL,
            totalDue: 108e6,
            installmentAmount: 9e6,
            installmentCount: 12,
            sourceChainId: SOURCE_CHAIN_ID,
            vault: VAULT,
            asset: ASSET
        });
    }
}
