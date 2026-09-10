// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

/// @title DemoPositionAsset
/// @notice Fixed-supply ERC20 used only to demonstrate a financed position on Sepolia.
/// @dev This token represents no legal claim, yield promise or production RWA.
contract DemoPositionAsset {
    string public constant name = "SeedLend Demo Position";
    string public constant symbol = "SLDP";
    uint8 public constant decimals = 18;

    uint256 public immutable totalSupply;

    mapping(address account => uint256 balance) public balanceOf;
    mapping(address owner => mapping(address spender => uint256 amount)) public allowance;

    error ZeroAddress();
    error InvalidInitialSupply();
    error InsufficientBalance(uint256 available, uint256 required);
    error InsufficientAllowance(uint256 available, uint256 required);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(address initialHolder, uint256 initialSupply) {
        if (initialHolder == address(0)) revert ZeroAddress();
        if (initialSupply == 0) revert InvalidInitialSupply();

        totalSupply = initialSupply;
        balanceOf[initialHolder] = initialSupply;
        emit Transfer(address(0), initialHolder, initialSupply);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        if (spender == address(0)) revert ZeroAddress();
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 available = allowance[from][msg.sender];
        if (available < amount) revert InsufficientAllowance(available, amount);

        if (available != type(uint256).max) {
            allowance[from][msg.sender] = available - amount;
            emit Approval(from, msg.sender, available - amount);
        }

        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) private {
        if (from == address(0) || to == address(0)) revert ZeroAddress();

        uint256 available = balanceOf[from];
        if (available < amount) revert InsufficientBalance(available, amount);

        balanceOf[from] = available - amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
