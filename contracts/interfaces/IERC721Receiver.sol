// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @title Interface of a contract that can receive ERC-721 tokens
/// @dev See https://eips.ethereum.org/EIPS/eip-721
interface IERC721Receiver {
    /// @notice
    /// @dev
    /// @param operator -
    /// @param sender -
    /// @param domainId -
    /// @param data -
    /// @return selector -
    function onERC721Received(
        address operator,
        address sender,
        uint256 domainId,
        bytes calldata data
    ) external returns (bytes4 selector);
}
