// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./standards/IERC721.sol";

/// @title Interface of a registry of domain ownerships
/// @notice Complies with the ERC-721 Non-Fungible Token Standard.
interface IDomainRegistry is IERC721 {
    /// @notice Registers a new top-level domain.
    /// @dev Top-level domains are always public.
    /// Emits a {Transfer} event.
    /// Throws an exception if:
    /// - `name` is an empty string, or contains a period.
    /// - the top-level domain `name` already exists.
    function register(string calldata name) external returns (uint256);

    /// @notice Registers a new domain.
    /// @dev The new domain name is the concatenation of the `prefix`, a period, and the `id` domain name.
    /// Emits a {Transfer} event.
    /// Throws an exception if:
    /// - `id` domain does not exist.
    /// - `msg.sender` does not own the `id` domain and the domain is not public.
    /// - `prefix` is an empty string, or contains a period.
    /// - the new domain name is public or is already owned and has not expired
    /// @param id The domain identifier.
    /// @param prefix The string to concatenate to the domain.
    /// @return The new domain identifier.
    function register(uint256 id, string calldata prefix)
        external
        returns (uint256);

    /// @notice Extends the duration of ownership over the `id` domain.
    /// @param id The domain identifier.
    function refresh(uint256 id) external;

    /// @notice Returns the identifier of the `name` domain.
    /// @dev Throws an exception if the `name` domain has not been registered.
    /// @param name The domain name.
    /// @return The identifier of the `name` domain.
    function idOf(string calldata name) external view returns (uint256);

    /// @notice Returns the symbolic name of the `id` domain.
    /// @dev Throws an exception if the `id` domain has not been registered.
    /// @param id The domain identifier.
    /// @return The symbolic name of the `id` domain.
    function nameOf(uint256 id) external view returns (string memory);
}
