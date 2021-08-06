// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Interface of the ERC-20 standard
/// @dev See https://eips.ethereum.org/EIPS/eip-20
interface IERC20 {
    /// @notice
    /// @dev
    /// @param sender -
    /// @param recipient -
    /// @param amount -
    event Transfer(
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );

    /// @notice
    /// @dev
    /// @param owner -
    /// @param spender -
    /// @param allowance -
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 allowance
    );

    /// @notice
    /// @dev
    /// @param recipient -
    /// @param amount -
    /// @return success -
    function transfer(address recipient, uint256 amount)
        external
        returns (bool success);

    /// @notice
    /// @dev
    /// @param sender -
    /// @param recipient -
    /// @param amount -
    /// @return success -
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool success);

    /// @notice
    /// @dev
    /// @param spender -
    /// @param amount -
    /// @return success -
    function approve(address spender, uint256 amount)
        external
        returns (bool success);

    /// @notice
    /// @dev
    /// @param owner -
    /// @return balance -
    function balanceOf(address owner) external view returns (uint256 balance);

    /// @notice
    /// @dev
    /// @return amount
    function totalSupply() external view returns (uint256 amount);

    /// @notice
    /// @dev
    /// @param owner -
    /// @param spender -
    /// @return amount -
    function allowance(address owner, address spender)
        external
        view
        returns (uint256 amount);
}
