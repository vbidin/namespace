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
    /// @param amount -
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 amount
    );

    /// @notice
    /// @dev
    /// @param recipient -
    /// @param amount -
    /// @return
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    /// @notice
    /// @dev
    /// @param sender -
    /// @param recipient -
    /// @param amount -
    /// @return
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    /// @notice
    /// @dev
    /// @param spender -
    /// @param amount -
    /// @return
    function approve(address spender, uint256 amount) external returns (bool);

    /// @notice
    /// @dev
    /// @param owner -
    /// @return
    function balanceOf(address owner) external view returns (uint256);

    /// @notice
    /// @dev
    /// @return
    function totalSupply() external view returns (uint256);

    /// @notice
    /// @dev
    /// @param owner -
    /// @param spender -
    /// @return
    function allowance(address owner, address spender)
        external
        view
        returns (uint256);
}
