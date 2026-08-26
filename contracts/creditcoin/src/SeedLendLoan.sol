// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

/// @title SeedLendLoan
/// @notice Stores the canonical lifecycle of SeedLend loans on Creditcoin.
/// @dev Attestcoin proof decoding and public repayment transfers are added in later tasks.
contract SeedLendLoan {
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
        bytes32 sourceTxHash;
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
    error LoanNotFound(uint256 loanId);
    error InvalidLoanStatus(uint256 loanId, LoanStatus expected, LoanStatus actual);
    error InvalidPositionAmount();
    error InvalidSourceTransaction();
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
        uint256 indexed loanId, bytes32 indexed sourceTxHash, uint256 positionAmount
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
    uint256 public loanCount;

    mapping(uint256 loanId => Loan loan) private loans;
    mapping(uint256 loanId => Payment[] payments) private loanPayments;

    modifier onlyOriginator() {
        if (msg.sender != originator) revert NotOriginator();
        _;
    }

    constructor(address originator_) {
        if (originator_ == address(0)) revert ZeroAddress();
        originator = originator_;
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
            sourceTxHash: bytes32(0),
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

    function _activateLoan(uint256 loanId, bytes32 sourceTxHash, uint256 positionAmount) internal {
        Loan storage loan = _requireStatus(loanId, LoanStatus.PendingPosition);
        if (sourceTxHash == bytes32(0)) revert InvalidSourceTransaction();
        if (positionAmount == 0) revert InvalidPositionAmount();

        loan.sourceTxHash = sourceTxHash;
        loan.positionAmount = positionAmount;
        loan.status = LoanStatus.Active;

        emit LoanActivated(loanId, sourceTxHash, positionAmount);
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

    function _validateTerms(LoanTermsInput calldata terms) private pure {
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
