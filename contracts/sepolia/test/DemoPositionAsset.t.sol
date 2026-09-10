// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

import { DemoPositionAsset } from "../src/DemoPositionAsset.sol";

interface DemoAssetVm {
    function prank(address sender) external;
    function expectRevert(bytes4 selector) external;
    function expectRevert(bytes calldata revertData) external;
}

contract DemoPositionAssetTest {
    DemoAssetVm private constant vm =
        DemoAssetVm(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant HOLDER = address(0xA11CE);
    address private constant SPENDER = address(0xB0B);
    address private constant RECIPIENT = address(0xCAFE);
    uint256 private constant SUPPLY = 1_000_000e18;

    DemoPositionAsset private asset;

    function setUp() public {
        asset = new DemoPositionAsset(HOLDER, SUPPLY);
    }

    function testCreatesFixedSupplyForInitialHolder() public view {
        require(asset.totalSupply() == SUPPLY, "supply mismatch");
        require(asset.balanceOf(HOLDER) == SUPPLY, "holder balance mismatch");
        require(
            keccak256(bytes(asset.name())) == keccak256("SeedLend Demo Position"), "name mismatch"
        );
        require(keccak256(bytes(asset.symbol())) == keccak256("SLDP"), "symbol mismatch");
        require(asset.decimals() == 18, "decimals mismatch");
    }

    function testTransfersTokens() public {
        vm.prank(HOLDER);
        bool transferred = asset.transfer(RECIPIENT, 25e18);

        require(transferred, "transfer failed");
        require(asset.balanceOf(RECIPIENT) == 25e18, "recipient balance mismatch");
        require(asset.balanceOf(HOLDER) == SUPPLY - 25e18, "holder balance mismatch");
    }

    function testSupportsVaultStyleTransferFrom() public {
        vm.prank(HOLDER);
        asset.approve(SPENDER, 100e18);

        vm.prank(SPENDER);
        bool transferred = asset.transferFrom(HOLDER, RECIPIENT, 100e18);

        require(transferred, "transferFrom failed");
        require(asset.allowance(HOLDER, SPENDER) == 0, "allowance not consumed");
        require(asset.balanceOf(RECIPIENT) == 100e18, "recipient balance mismatch");
    }

    function testRejectsInsufficientAllowance() public {
        vm.prank(SPENDER);
        vm.expectRevert(
            abi.encodeWithSelector(DemoPositionAsset.InsufficientAllowance.selector, 0, 1e18)
        );
        asset.transferFrom(HOLDER, RECIPIENT, 1e18);
    }

    function testRejectsInsufficientBalance() public {
        vm.prank(HOLDER);
        vm.expectRevert(
            abi.encodeWithSelector(
                DemoPositionAsset.InsufficientBalance.selector, SUPPLY, SUPPLY + 1
            )
        );
        asset.transfer(RECIPIENT, SUPPLY + 1);
    }

    function testRejectsInvalidDeployment() public {
        vm.expectRevert(DemoPositionAsset.ZeroAddress.selector);
        new DemoPositionAsset(address(0), SUPPLY);

        vm.expectRevert(DemoPositionAsset.InvalidInitialSupply.selector);
        new DemoPositionAsset(HOLDER, 0);
    }
}
