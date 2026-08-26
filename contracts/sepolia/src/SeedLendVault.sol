// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

interface IERC20PositionAsset {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title SeedLendVault
/// @notice Locks financed investment positions on the Attestcoin source chain.
/// @dev The MVP intentionally has no release function until the reverse cross-chain flow is designed.
contract SeedLendVault {
    struct PositionParams {
        uint256 loanId;
        address borrower;
        address funder;
        address asset;
        uint256 principal;
        uint256 positionAmount;
        bytes32 termsHash;
    }

    struct Position {
        address borrower;
        address funder;
        address asset;
        uint256 principal;
        uint256 positionAmount;
        bytes32 termsHash;
        uint64 lockedAt;
    }

    error NotPositionManager();
    error ZeroAddress();
    error InvalidLoanId();
    error InvalidPrincipal();
    error InvalidPositionAmount();
    error InvalidTermsHash();
    error PositionAlreadyExists(uint256 loanId);
    error PositionNotFound(uint256 loanId);
    error AssetTransferFailed();
    error AssetAmountMismatch(uint256 expected, uint256 received);

    event PositionLocked(
        uint256 indexed loanId,
        address indexed borrower,
        address indexed asset,
        uint256 principal,
        uint256 positionAmount,
        bytes32 termsHash
    );

    address public immutable positionManager;

    mapping(uint256 loanId => Position position) private positions;

    modifier onlyPositionManager() {
        if (msg.sender != positionManager) revert NotPositionManager();
        _;
    }

    constructor(address positionManager_) {
        if (positionManager_ == address(0)) revert ZeroAddress();
        positionManager = positionManager_;
    }

    function lockPosition(PositionParams calldata params) external onlyPositionManager {
        _validateParams(params);
        if (positions[params.loanId].borrower != address(0)) {
            revert PositionAlreadyExists(params.loanId);
        }

        uint256 balanceBefore = IERC20PositionAsset(params.asset).balanceOf(address(this));
        _safeTransferFrom(params.asset, params.funder, address(this), params.positionAmount);
        uint256 received =
            IERC20PositionAsset(params.asset).balanceOf(address(this)) - balanceBefore;
        if (received != params.positionAmount) {
            revert AssetAmountMismatch(params.positionAmount, received);
        }

        positions[params.loanId] = Position({
            borrower: params.borrower,
            funder: params.funder,
            asset: params.asset,
            principal: params.principal,
            positionAmount: params.positionAmount,
            termsHash: params.termsHash,
            lockedAt: uint64(block.timestamp)
        });

        emit PositionLocked(
            params.loanId,
            params.borrower,
            params.asset,
            params.principal,
            params.positionAmount,
            params.termsHash
        );
    }

    function getPosition(uint256 loanId) external view returns (Position memory) {
        Position memory position = positions[loanId];
        if (position.borrower == address(0)) revert PositionNotFound(loanId);
        return position;
    }

    function _validateParams(PositionParams calldata params) private pure {
        if (params.loanId == 0) revert InvalidLoanId();
        if (
            params.borrower == address(0) || params.funder == address(0)
                || params.asset == address(0)
        ) {
            revert ZeroAddress();
        }
        if (params.principal == 0) revert InvalidPrincipal();
        if (params.positionAmount == 0) revert InvalidPositionAmount();
        if (params.termsHash == bytes32(0)) revert InvalidTermsHash();
    }

    function _safeTransferFrom(address token, address from, address to, uint256 amount) private {
        (bool success, bytes memory returnData) =
            token.call(abi.encodeCall(IERC20PositionAsset.transferFrom, (from, to, amount)));

        if (!success || (returnData.length != 0 && !abi.decode(returnData, (bool)))) {
            revert AssetTransferFailed();
        }
    }
}
