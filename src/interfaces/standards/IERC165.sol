// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Interface of the ERC-165 standard
/// @dev See https://eips.ethereum.org/EIPS/eip-165
interface IERC165 {
    /// @notice Checks if this contract implements the interface defined by `id`.
    /// @dev See https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified
    /// This function call must use less than 30,000 gas.
    /// @param id The interface identifier.
    /// @return Whether the contracts implements the interface defined by `id`.
    function supportsInterface(bytes4 id) external view returns (bool);
}
