// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

import { SeedLendVault } from "../src/SeedLendVault.sol";

interface Vm {
    function prank(address sender) external;
    function expectRevert(bytes4 selector) external;
    function expectRevert(bytes calldata revertData) external;
}

contract MockPositionAsset {
    mapping(address account => uint256 balance) public balanceOf;
    mapping(address owner => mapping(address spender => uint256 amount)) public allowance;

    function mint(address account, uint256 amount) external {
        balanceOf[account] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount)
        external
        virtual
        returns (bool)
    {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed < amount || balanceOf[from] < amount) return false;

        allowance[from][msg.sender] = allowed - amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract FeePositionAsset is MockPositionAsset {
    function transferFrom(address from, address to, uint256 amount)
        external
        override
        returns (bool)
    {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed < amount || balanceOf[from] < amount) return false;

        allowance[from][msg.sender] = allowed - amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount - 1;
        return true;
    }
}

contract SeedLendVaultTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant MANAGER = address(0xA11CE);
    address private constant BORROWER = address(0xB0B);
    address private constant FUNDER = address(0xF00D);
    bytes32 private constant TERMS_HASH = keccak256("seedlend terms");

    SeedLendVault private vault;
    MockPositionAsset private asset;

    function setUp() public {
        vault = new SeedLendVault(MANAGER);
        asset = new MockPositionAsset();
        asset.mint(FUNDER, 100e18);

        vm.prank(FUNDER);
        asset.approve(address(vault), 100e18);
    }

    function testLocksExactPositionAndStoresTerms() public {
        vm.prank(MANAGER);
        vault.lockPosition(_validParams(address(asset)));

        SeedLendVault.Position memory position = vault.getPosition(1);
        require(position.borrower == BORROWER, "borrower mismatch");
        require(position.funder == FUNDER, "funder mismatch");
        require(position.asset == address(asset), "asset mismatch");
        require(position.principal == 100e6, "principal mismatch");
        require(position.positionAmount == 100e18, "position mismatch");
        require(position.termsHash == TERMS_HASH, "terms mismatch");
        require(position.lockedAt > 0, "missing timestamp");
        require(asset.balanceOf(address(vault)) == 100e18, "vault balance mismatch");
        require(asset.balanceOf(FUNDER) == 0, "funder balance mismatch");
    }

    function testOnlyManagerCanLockPosition() public {
        vm.expectRevert(SeedLendVault.NotPositionManager.selector);
        vault.lockPosition(_validParams(address(asset)));
    }

    function testRejectsDuplicateLoanId() public {
        vm.prank(MANAGER);
        vault.lockPosition(_validParams(address(asset)));

        vm.prank(MANAGER);
        vm.expectRevert(abi.encodeWithSelector(SeedLendVault.PositionAlreadyExists.selector, 1));
        vault.lockPosition(_validParams(address(asset)));
    }

    function testRejectsZeroTermsHash() public {
        SeedLendVault.PositionParams memory params = _validParams(address(asset));
        params.termsHash = bytes32(0);

        vm.prank(MANAGER);
        vm.expectRevert(SeedLendVault.InvalidTermsHash.selector);
        vault.lockPosition(params);
    }

    function testRejectsFailedAssetTransfer() public {
        SeedLendVault.PositionParams memory params = _validParams(address(asset));
        params.positionAmount = 101e18;

        vm.prank(MANAGER);
        vm.expectRevert(SeedLendVault.AssetTransferFailed.selector);
        vault.lockPosition(params);
    }

    function testRejectsFeeOnTransferAsset() public {
        FeePositionAsset feeAsset = new FeePositionAsset();
        feeAsset.mint(FUNDER, 100e18);
        vm.prank(FUNDER);
        feeAsset.approve(address(vault), 100e18);

        vm.prank(MANAGER);
        vm.expectRevert(
            abi.encodeWithSelector(SeedLendVault.AssetAmountMismatch.selector, 100e18, 100e18 - 1)
        );
        vault.lockPosition(_validParams(address(feeAsset)));
    }

    function testRejectsUnknownPosition() public {
        vm.expectRevert(abi.encodeWithSelector(SeedLendVault.PositionNotFound.selector, 99));
        vault.getPosition(99);
    }

    function _validParams(address assetAddress)
        private
        pure
        returns (SeedLendVault.PositionParams memory)
    {
        return SeedLendVault.PositionParams({
            loanId: 1,
            borrower: BORROWER,
            funder: FUNDER,
            asset: assetAddress,
            principal: 100e6,
            positionAmount: 100e18,
            termsHash: TERMS_HASH
        });
    }
}
