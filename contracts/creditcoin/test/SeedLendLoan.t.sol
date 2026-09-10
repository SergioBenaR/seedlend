// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

import { SeedLendLoan } from "../src/SeedLendLoan.sol";

interface Vm {
    struct Log {
        bytes32[] topics;
        bytes data;
        address emitter;
    }

    function deal(address account, uint256 newBalance) external;
    function prank(address sender) external;
    function expectRevert(bytes4 selector) external;
    function expectRevert(bytes calldata revertData) external;
    function recordLogs() external;
    function getRecordedLogs() external returns (Log[] memory logs);
}

contract SeedLendLoanHarness is SeedLendLoan {
    constructor(address originator_) SeedLendLoan(originator_, 11155111, 1) { }

    function activateForTest(uint256 loanId, bytes32 sourceQueryId, uint256 positionAmount)
        external
    {
        _activateLoan(loanId, sourceQueryId, positionAmount);
    }
}

contract OriginatorReceiver {
    SeedLendLoanHarness private loanContract;
    uint256 private loanId;

    bool public reentryBlocked;
    bool private attemptReentry;

    function configure(SeedLendLoanHarness loanContract_, uint256 loanId_) external {
        loanContract = loanContract_;
        loanId = loanId_;
    }

    function createLoan(
        SeedLendLoanHarness loanContract_,
        SeedLendLoan.LoanTermsInput calldata terms
    ) external returns (uint256) {
        return loanContract_.createLoan(terms);
    }

    function armReentry() external {
        attemptReentry = true;
    }

    receive() external payable {
        if (!attemptReentry) return;
        attemptReentry = false;

        (bool success, bytes memory result) =
            address(loanContract).call{ value: 1 }(abi.encodeCall(SeedLendLoan.repay, (loanId)));
        reentryBlocked =
            !success && result.length >= 4 && bytes4(result) == SeedLendLoan.ReentrantCall.selector;
    }
}

contract RejectingOriginator {
    function createLoan(
        SeedLendLoanHarness loanContract,
        SeedLendLoan.LoanTermsInput calldata terms
    ) external returns (uint256) {
        return loanContract.createLoan(terms);
    }

    receive() external payable {
        revert("payment rejected");
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
        require(loan.principal == 100 ether, "principal mismatch");
        require(loan.totalDue == 108 ether, "total due mismatch");
        require(loan.installmentAmount == 36 ether, "installment mismatch");
        require(loan.installmentCount == 3, "count mismatch");
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
        require(loan.sourceQueryId == SOURCE_TX_HASH, "query mismatch");
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

    function testRepaysThreeInstallmentsAndForwardsValue() public {
        uint256 loanId = _createAndActivateLoan();
        vm.deal(BORROWER, 108 ether);
        uint256 originatorBalanceBefore = ORIGINATOR.balance;

        vm.prank(BORROWER);
        loanContract.repay{ value: 36 ether }(loanId);
        SeedLendLoan.Loan memory partialLoan = loanContract.getLoan(loanId);
        require(partialLoan.paidAmount == 36 ether, "partial amount mismatch");
        require(partialLoan.status == SeedLendLoan.LoanStatus.Active, "closed too early");

        vm.prank(BORROWER);
        loanContract.repay{ value: 36 ether }(loanId);
        vm.recordLogs();
        vm.prank(BORROWER);
        loanContract.repay{ value: 36 ether }(loanId);
        Vm.Log[] memory finalPaymentLogs = vm.getRecordedLogs();

        SeedLendLoan.Loan memory paid = loanContract.getLoan(loanId);
        SeedLendLoan.Payment memory firstPayment = loanContract.getPayment(loanId, 0);
        require(paid.paidAmount == 108 ether, "paid amount mismatch");
        require(paid.status == SeedLendLoan.LoanStatus.Paid, "loan not paid");
        require(loanContract.getPaymentCount(loanId) == 3, "payment count mismatch");
        require(loanContract.remainingBalance(loanId) == 0, "remaining balance mismatch");
        require(firstPayment.payer == BORROWER, "payer mismatch");
        require(firstPayment.amount == 36 ether, "payment amount mismatch");
        require(firstPayment.recordedAt > 0, "payment timestamp missing");
        require(ORIGINATOR.balance == originatorBalanceBefore + 108 ether, "funds not forwarded");
        require(address(loanContract).balance == 0, "payment retained by loan contract");
        require(finalPaymentLogs.length == 3, "unexpected final payment event count");
        require(
            finalPaymentLogs[0].topics[0]
                == keccak256("PaymentRecorded(uint256,address,uint256,uint256)"),
            "PaymentRecorded missing"
        );
        require(
            finalPaymentLogs[1].topics[0] == keccak256("LoanPaid(uint256,uint256)"),
            "LoanPaid missing"
        );
        require(
            finalPaymentLogs[2].topics[0]
                == keccak256("ReleaseEligible(uint256,address,address,uint256)"),
            "ReleaseEligible missing"
        );
    }

    function testRejectsOverpayment() public {
        uint256 loanId = _createAndActivateLoan();
        vm.deal(BORROWER, 109 ether);
        vm.prank(BORROWER);

        vm.expectRevert(
            abi.encodeWithSelector(
                SeedLendLoan.PaymentExceedsBalance.selector, 108 ether, 109 ether
            )
        );
        loanContract.repay{ value: 109 ether }(loanId);
    }

    function testRejectsPaymentBeforeActivation() public {
        uint256 loanId = _createLoan();
        vm.deal(BORROWER, 36 ether);
        vm.prank(BORROWER);

        vm.expectRevert(
            abi.encodeWithSelector(
                SeedLendLoan.InvalidLoanStatus.selector,
                loanId,
                SeedLendLoan.LoanStatus.Active,
                SeedLendLoan.LoanStatus.PendingPosition
            )
        );
        loanContract.repay{ value: 36 ether }(loanId);
    }

    function testRejectsPaymentAfterLoanIsPaid() public {
        uint256 loanId = _createAndActivateLoan();
        vm.deal(BORROWER, 109 ether);

        vm.prank(BORROWER);
        loanContract.repay{ value: 108 ether }(loanId);

        vm.prank(BORROWER);
        vm.expectRevert(
            abi.encodeWithSelector(
                SeedLendLoan.InvalidLoanStatus.selector,
                loanId,
                SeedLendLoan.LoanStatus.Active,
                SeedLendLoan.LoanStatus.Paid
            )
        );
        loanContract.repay{ value: 1 ether }(loanId);
    }

    function testRejectsZeroPayment() public {
        uint256 loanId = _createAndActivateLoan();

        vm.prank(BORROWER);
        vm.expectRevert(SeedLendLoan.InvalidPaymentAmount.selector);
        loanContract.repay(loanId);
    }

    function testRevertsPaymentWhenOriginatorRejectsTransfer() public {
        RejectingOriginator rejectingOriginator = new RejectingOriginator();
        SeedLendLoanHarness rejectingLoan = new SeedLendLoanHarness(address(rejectingOriginator));
        uint256 loanId = rejectingOriginator.createLoan(rejectingLoan, _validTerms());
        rejectingLoan.activateForTest(loanId, SOURCE_TX_HASH, 100 ether);
        vm.deal(BORROWER, 36 ether);

        vm.prank(BORROWER);
        vm.expectRevert(SeedLendLoan.PaymentTransferFailed.selector);
        rejectingLoan.repay{ value: 36 ether }(loanId);

        require(rejectingLoan.getLoan(loanId).paidAmount == 0, "failed payment was recorded");
        require(rejectingLoan.getPaymentCount(loanId) == 0, "failed payment history exists");
    }

    function testBlocksOriginatorReentry() public {
        OriginatorReceiver receiver = new OriginatorReceiver();
        SeedLendLoanHarness guardedLoan = new SeedLendLoanHarness(address(receiver));
        uint256 loanId = receiver.createLoan(guardedLoan, _validTerms());
        guardedLoan.activateForTest(loanId, SOURCE_TX_HASH, 100 ether);
        receiver.configure(guardedLoan, loanId);
        receiver.armReentry();
        vm.deal(BORROWER, 36 ether);

        vm.prank(BORROWER);
        guardedLoan.repay{ value: 36 ether }(loanId);

        require(receiver.reentryBlocked(), "reentry was not blocked");
        require(guardedLoan.getLoan(loanId).paidAmount == 36 ether, "unexpected paid amount");
        require(guardedLoan.getPaymentCount(loanId) == 1, "unexpected payment count");
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
            principal: 100 ether,
            totalDue: 108 ether,
            installmentAmount: 36 ether,
            installmentCount: 3,
            sourceChainId: 11155111,
            vault: VAULT,
            asset: ASSET
        });
    }
}
