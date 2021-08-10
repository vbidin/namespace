// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Interface of the ERC-165 standard
/// @dev See https://eips.ethereum.org/EIPS/eip-165
interface IERC165 {
    /// @notice Checks if this contract implements the interface defined by `interfaceId`.
    /// @dev This function call must use less than 30,000 gas.
    /// @param interfaceId The interface identifier.
    /// @return supported Whether the contracts implements the interface defined by `interfaceId`.
    function supportsInterface(bytes4 interfaceId)
        external
        view
        returns (bool supported);
}
