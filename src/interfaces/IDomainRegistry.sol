// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./standards/IERC721.sol";

/// @title Interface of a registry of domain ownerships
/// @notice Complies with the ERC-721 Non-Fungible Token Standard.
interface IDomainRegistry is IERC721 {
    /// @notice Registers a new domain.
    /// @dev New domain names are the concatenation of the `prefix`, a period, and the `id` domain name.
    /// The exception to this rule are top level domains, which are equal to the `prefix`.
    /// Public domains can not be owned and can be used by anyone to register further domains.
    /// Emits a {Transfer} event if a private domain was created.
    /// Throws an exception if:
    /// - `id` domain does not exist.
    /// - `prefix` is an empty string, or contains a period.
    /// - `msg.sender` does not own the `id` domain and the domain is not public.
    /// - the new domain name already exists.
    /// - the new domain name is a top-level domain and is not public.
    /// @param id The domain identifier.
    /// @param prefix The string to concatenate to the domain.
    /// @param public_ indicates if the domain is public
    /// @return The new domain identifier.
    function register(
        uint256 id,
        string calldata prefix,
        bool public_
    ) external returns (uint256);

    /// @notice Extends the duration of ownership over the `id` domain.
    /// @param id The domain identifier.
    function refresh(uint256 id) external;

    /// @notice Returns the symbolic name of the `id` domain.
    /// @dev Throws an exception if the `id` domain has not been registered.
    /// @param id The domain identifier.
    /// @return The symbolic name of the `id` domain.
    function nameOf(uint256 id) external view returns (string memory);

    /// @notice Returns the identifier of the `name` domain.
    /// @dev Throws an exception if the `name` domain has not been registered.
    /// @param name The domain name.
    /// @return The identifier of the `name` domain.
    function idOf(string calldata name) external view returns (uint256);
}
