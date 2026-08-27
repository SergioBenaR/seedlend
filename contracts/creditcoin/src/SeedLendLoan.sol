// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

import { EvmV1Decoder } from "@gluwa/usc-contracts/contracts/decoding/EvmV1Decoder.sol";
import { AttestcoinVerifier, INativeQueryVerifier } from "./AttestcoinVerifier.sol";

/// @title SeedLendLoan
/// @notice Stores the canonical lifecycle of SeedLend loans on Creditcoin.
/// @dev Position activation is proof-gated; public repayment transfers are added later.
contract SeedLendLoan is AttestcoinVerifier {
    enum LoanStatus {
        None,
        PendingPosition,
        Active,
        Paid
    }

    struct LoanTermsInput {
        address borrower;
        uint256 principal;
        uint256 totalDue;
        uint256 installmentAmount;
        uint16 installmentCount;
        uint64 sourceChainId;
        address vault;
        address asset;
    }

    struct Loan {
        address borrower;
        uint256 principal;
        uint256 totalDue;
        uint256 installmentAmount;
        uint16 installmentCount;
        uint256 paidAmount;
        uint64 sourceChainId;
        address vault;
        address asset;
        bytes32 termsHash;
        bytes32 sourceQueryId;
        uint256 positionAmount;
        LoanStatus status;
    }

    struct Payment {
        address payer;
        uint256 amount;
        uint64 recordedAt;
    }

    error NotOriginator();
    error ZeroAddress();
    error InvalidPrincipal();
    error InvalidTotalDue();
    error InvalidInstallment();
    error InvalidInstallmentCount();
    error InvalidSourceChain();
    error UnexpectedSourceChain(uint64 expected, uint64 actual);
    error UnexpectedSourceChainKey(uint64 expected, uint64 actual);
    error LoanNotFound(uint256 loanId);
    error InvalidLoanStatus(uint256 loanId, LoanStatus expected, LoanStatus actual);
    error InvalidPositionAmount();
    error InvalidPositionProof();
    error InvalidPaymentAmount();
    error PaymentExceedsBalance(uint256 remaining, uint256 attempted);

    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 totalDue,
        bytes32 termsHash
    );
    event LoanActivated(
        uint256 indexed loanId, bytes32 indexed sourceQueryId, uint256 positionAmount
    );
    event PaymentRecorded(
        uint256 indexed loanId, address indexed payer, uint256 amount, uint256 paidAmount
    );
    event LoanPaid(uint256 indexed loanId, uint256 totalPaid);
    event ReleaseEligible(
        uint256 indexed loanId,
        address indexed borrower,
        address indexed asset,
        uint256 positionAmount
    );

    address public immutable originator;
    uint64 public immutable sourceChainId;
    uint64 public immutable sourceChainKey;
    uint256 public loanCount;

    bytes32 public constant POSITION_LOCKED_EVENT_SIGNATURE =
        keccak256("PositionLocked(uint256,address,address,uint256,uint256,bytes32)");

    mapping(uint256 loanId => Loan loan) private loans;
    mapping(uint256 loanId => Payment[] payments) private loanPayments;

    modifier onlyOriginator() {
        if (msg.sender != originator) revert NotOriginator();
        _;
    }

    constructor(address originator_, uint64 sourceChainId_, uint64 sourceChainKey_) {
        if (originator_ == address(0)) revert ZeroAddress();
        if (sourceChainId_ == 0 || sourceChainKey_ == 0) revert InvalidSourceChain();
        originator = originator_;
        sourceChainId = sourceChainId_;
        sourceChainKey = sourceChainKey_;
    }

    function createLoan(LoanTermsInput calldata terms)
        external
        onlyOriginator
        returns (uint256 loanId)
    {
        _validateTerms(terms);

        loanId = ++loanCount;
        bytes32 termsHash = computeTermsHash(loanId, terms);

        loans[loanId] = Loan({
            borrower: terms.borrower,
            principal: terms.principal,
            totalDue: terms.totalDue,
            installmentAmount: terms.installmentAmount,
            installmentCount: terms.installmentCount,
            paidAmount: 0,
            sourceChainId: terms.sourceChainId,
            vault: terms.vault,
            asset: terms.asset,
            termsHash: termsHash,
            sourceQueryId: bytes32(0),
            positionAmount: 0,
            status: LoanStatus.PendingPosition
        });

        emit LoanCreated(loanId, terms.borrower, terms.principal, terms.totalDue, termsHash);
    }

    function computeTermsHash(uint256 loanId, LoanTermsInput memory terms)
        public
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encode(
                loanId,
                terms.borrower,
                terms.principal,
                terms.totalDue,
                terms.installmentAmount,
                terms.installmentCount,
                terms.sourceChainId,
                terms.vault,
                terms.asset
            )
        );
    }

    function getLoan(uint256 loanId) external view returns (Loan memory) {
        _requireLoan(loanId);
        return loans[loanId];
    }

    function getPaymentCount(uint256 loanId) external view returns (uint256) {
        _requireLoan(loanId);
        return loanPayments[loanId].length;
    }

    function getPayment(uint256 loanId, uint256 index) external view returns (Payment memory) {
        _requireLoan(loanId);
        return loanPayments[loanId][index];
    }

    function remainingBalance(uint256 loanId) external view returns (uint256) {
        _requireLoan(loanId);
        Loan storage loan = loans[loanId];
        return loan.totalDue - loan.paidAmount;
    }

    /// @notice Activates a pending loan only after Attestcoin proves its exact vault position.
    function activateFromPositionProof(
        uint256 loanId,
        uint64 chainKey,
        uint64 blockHeight,
        bytes calldata encodedTransaction,
        bytes32 merkleRoot,
        INativeQueryVerifier.MerkleProofEntry[] calldata siblings,
        bytes32 lowerEndpointDigest,
        bytes32[] calldata continuityRoots
    ) external returns (bool) {
        if (chainKey != sourceChainKey) {
            revert UnexpectedSourceChainKey(sourceChainKey, chainKey);
        }

        bytes32 queryId = _verifyAndConsume(
            chainKey,
            blockHeight,
            encodedTransaction,
            merkleRoot,
            siblings,
            lowerEndpointDigest,
            continuityRoots
        );
        uint256 positionAmount = _decodeAndValidatePosition(loanId, encodedTransaction);
        _activateLoan(loanId, queryId, positionAmount);

        return true;
    }

    function _activateLoan(uint256 loanId, bytes32 sourceQueryId, uint256 positionAmount)
        internal
    {
        Loan storage loan = _requireStatus(loanId, LoanStatus.PendingPosition);
        if (sourceQueryId == bytes32(0)) revert InvalidPositionProof();
        if (positionAmount == 0) revert InvalidPositionAmount();

        loan.sourceQueryId = sourceQueryId;
        loan.positionAmount = positionAmount;
        loan.status = LoanStatus.Active;

        emit LoanActivated(loanId, sourceQueryId, positionAmount);
    }

    function _decodeAndValidatePosition(uint256 loanId, bytes calldata encodedTransaction)
        private
        view
        returns (uint256 positionAmount)
    {
        Loan storage loan = _requireStatus(loanId, LoanStatus.PendingPosition);
        uint8 transactionType = EvmV1Decoder.getTransactionType(encodedTransaction);
        if (!EvmV1Decoder.isValidTransactionType(transactionType)) {
            revert InvalidPositionProof();
        }

        EvmV1Decoder.ReceiptFields memory receipt =
            EvmV1Decoder.decodeReceiptFields(encodedTransaction);
        if (receipt.receiptStatus != 1) revert InvalidPositionProof();

        EvmV1Decoder.LogEntry[] memory logs =
            EvmV1Decoder.getLogsByEventSignature(receipt, POSITION_LOCKED_EVENT_SIGNATURE);

        for (uint256 i; i < logs.length; ++i) {
            EvmV1Decoder.LogEntry memory positionLog = logs[i];
            if (positionLog.address_ != loan.vault || positionLog.topics.length != 4) continue;
            if (uint256(positionLog.topics[1]) != loanId) continue;

            address borrower = address(uint160(uint256(positionLog.topics[2])));
            address asset = address(uint160(uint256(positionLog.topics[3])));
            (uint256 principal, uint256 provenPositionAmount, bytes32 termsHash) =
                abi.decode(positionLog.data, (uint256, uint256, bytes32));

            if (
                borrower == loan.borrower && asset == loan.asset && principal == loan.principal
                    && provenPositionAmount > 0 && termsHash == loan.termsHash
            ) {
                return provenPositionAmount;
            }
        }

        revert InvalidPositionProof();
    }

    function _recordPayment(uint256 loanId, address payer, uint256 amount) internal {
        Loan storage loan = _requireStatus(loanId, LoanStatus.Active);
        if (payer == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidPaymentAmount();

        uint256 remaining = loan.totalDue - loan.paidAmount;
        if (amount > remaining) revert PaymentExceedsBalance(remaining, amount);

        loan.paidAmount += amount;
        loanPayments[loanId].push(
            Payment({ payer: payer, amount: amount, recordedAt: uint64(block.timestamp) })
        );

        emit PaymentRecorded(loanId, payer, amount, loan.paidAmount);

        if (loan.paidAmount == loan.totalDue) {
            loan.status = LoanStatus.Paid;
            emit LoanPaid(loanId, loan.paidAmount);
            emit ReleaseEligible(loanId, loan.borrower, loan.asset, loan.positionAmount);
        }
    }

    function _validateTerms(LoanTermsInput calldata terms) private view {
        if (terms.borrower == address(0) || terms.vault == address(0) || terms.asset == address(0))
        {
            revert ZeroAddress();
        }
        if (terms.principal == 0) revert InvalidPrincipal();
        if (terms.totalDue < terms.principal) revert InvalidTotalDue();
        if (terms.installmentAmount == 0 || terms.installmentAmount > terms.totalDue) {
            revert InvalidInstallment();
        }
        if (terms.installmentCount == 0) revert InvalidInstallmentCount();
        if (terms.sourceChainId == 0) revert InvalidSourceChain();
        if (terms.sourceChainId != sourceChainId) {
            revert UnexpectedSourceChain(sourceChainId, terms.sourceChainId);
        }
    }

    function _requireLoan(uint256 loanId) private view {
        if (loans[loanId].status == LoanStatus.None) revert LoanNotFound(loanId);
    }

    function _requireStatus(uint256 loanId, LoanStatus expected)
        private
        view
        returns (Loan storage loan)
    {
        loan = loans[loanId];
        if (loan.status == LoanStatus.None) revert LoanNotFound(loanId);
        if (loan.status != expected) revert InvalidLoanStatus(loanId, expected, loan.status);
    }
}
