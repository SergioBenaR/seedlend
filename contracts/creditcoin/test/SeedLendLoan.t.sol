// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

import { SeedLendLoan } from "../src/SeedLendLoan.sol";

interface Vm {
    function prank(address sender) external;
    function expectRevert(bytes4 selector) external;
    function expectRevert(bytes calldata revertData) external;
}

contract SeedLendLoanHarness is SeedLendLoan {
    constructor(address originator_) SeedLendLoan(originator_) { }

    function activateForTest(uint256 loanId, bytes32 sourceTxHash, uint256 positionAmount)
        external
    {
        _activateLoan(loanId, sourceTxHash, positionAmount);
    }

    function recordPaymentForTest(uint256 loanId, address payer, uint256 amount) external {
        _recordPayment(loanId, payer, amount);
    }
}

contract SeedLendLoanTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant ORIGINATOR = address(0xA11CE);
    address private constant BORROWER = address(0xB0B);
    address private constant VAULT = address(0xCAFE);
    address private constant ASSET = address(0xA55E7);
    bytes32 private constant SOURCE_TX_HASH = keccak256("source transaction");

    SeedLendLoanHarness private loanContract;

    function setUp() public {
        loanContract = new SeedLendLoanHarness(ORIGINATOR);
    }

    function testCreateLoanStoresCanonicalTerms() public {
        SeedLendLoan.LoanTermsInput memory terms = _validTerms();

        vm.prank(ORIGINATOR);
        uint256 loanId = loanContract.createLoan(terms);
        SeedLendLoan.Loan memory loan = loanContract.getLoan(loanId);

        require(loanId == 1, "unexpected loan id");
        require(loan.borrower == BORROWER, "borrower mismatch");
        require(loan.principal == 100e6, "principal mismatch");
        require(loan.totalDue == 108e6, "total due mismatch");
        require(loan.installmentAmount == 9e6, "installment mismatch");
        require(loan.installmentCount == 12, "count mismatch");
        require(loan.sourceChainId == 11155111, "source chain mismatch");
        require(loan.vault == VAULT, "vault mismatch");
        require(loan.asset == ASSET, "asset mismatch");
        require(loan.status == SeedLendLoan.LoanStatus.PendingPosition, "unexpected initial status");
        require(loan.termsHash == loanContract.computeTermsHash(loanId, terms), "hash mismatch");
    }

    function testOnlyOriginatorCanCreateLoan() public {
        vm.expectRevert(SeedLendLoan.NotOriginator.selector);
        loanContract.createLoan(_validTerms());
    }

    function testRejectsInvalidPrincipal() public {
        SeedLendLoan.LoanTermsInput memory terms = _validTerms();
        terms.principal = 0;

        vm.prank(ORIGINATOR);
        vm.expectRevert(SeedLendLoan.InvalidPrincipal.selector);
        loanContract.createLoan(terms);
    }

    function testActivatesOnlyPendingLoan() public {
        uint256 loanId = _createLoan();

        loanContract.activateForTest(loanId, SOURCE_TX_HASH, 100e18);
        SeedLendLoan.Loan memory loan = loanContract.getLoan(loanId);

        require(loan.status == SeedLendLoan.LoanStatus.Active, "loan not active");
        require(loan.sourceTxHash == SOURCE_TX_HASH, "transaction mismatch");
        require(loan.positionAmount == 100e18, "position mismatch");

        vm.expectRevert(
            abi.encodeWithSelector(
                SeedLendLoan.InvalidLoanStatus.selector,
                loanId,
                SeedLendLoan.LoanStatus.PendingPosition,
                SeedLendLoan.LoanStatus.Active
            )
        );
        loanContract.activateForTest(loanId, SOURCE_TX_HASH, 100e18);
    }

    function testRecordsPartialAndFinalPayments() public {
        uint256 loanId = _createAndActivateLoan();

        loanContract.recordPaymentForTest(loanId, BORROWER, 9e6);
        SeedLendLoan.Loan memory partialLoan = loanContract.getLoan(loanId);
        require(partialLoan.paidAmount == 9e6, "partial amount mismatch");
        require(partialLoan.status == SeedLendLoan.LoanStatus.Active, "closed too early");

        loanContract.recordPaymentForTest(loanId, BORROWER, 99e6);
        SeedLendLoan.Loan memory paid = loanContract.getLoan(loanId);
        require(paid.paidAmount == 108e6, "paid amount mismatch");
        require(paid.status == SeedLendLoan.LoanStatus.Paid, "loan not paid");
        require(loanContract.getPaymentCount(loanId) == 2, "payment count mismatch");
        require(loanContract.remainingBalance(loanId) == 0, "remaining balance mismatch");
    }

    function testRejectsOverpayment() public {
        uint256 loanId = _createAndActivateLoan();

        vm.expectRevert(
            abi.encodeWithSelector(SeedLendLoan.PaymentExceedsBalance.selector, 108e6, 109e6)
        );
        loanContract.recordPaymentForTest(loanId, BORROWER, 109e6);
    }

    function testRejectsPaymentBeforeActivation() public {
        uint256 loanId = _createLoan();

        vm.expectRevert(
            abi.encodeWithSelector(
                SeedLendLoan.InvalidLoanStatus.selector,
                loanId,
                SeedLendLoan.LoanStatus.Active,
                SeedLendLoan.LoanStatus.PendingPosition
            )
        );
        loanContract.recordPaymentForTest(loanId, BORROWER, 9e6);
    }

    function _createLoan() private returns (uint256) {
        vm.prank(ORIGINATOR);
        return loanContract.createLoan(_validTerms());
    }

    function _createAndActivateLoan() private returns (uint256 loanId) {
        loanId = _createLoan();
        loanContract.activateForTest(loanId, SOURCE_TX_HASH, 100e18);
    }

    function _validTerms() private pure returns (SeedLendLoan.LoanTermsInput memory) {
        return SeedLendLoan.LoanTermsInput({
            borrower: BORROWER,
            principal: 100e6,
            totalDue: 108e6,
            installmentAmount: 9e6,
            installmentCount: 12,
            sourceChainId: 11155111,
            vault: VAULT,
            asset: ASSET
        });
    }
}
