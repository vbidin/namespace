// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./standards/IERC721.sol";

/// @title Interface of a registry of domain ownerships
/// @notice Complies with the ERC-721 Non-Fungible Token Standard.
interface IDomainRegistry is IERC721 {
    /// @notice Registers a new domain.
    /// @dev New domain names are the concatenation of the `prefix`, a period, and the `domainId` domain name.
    /// The exception to this rule are top level domains, which are equal to the `prefix`.
    /// Public domains can not be owned and can be used by anyone to register further domains.
    /// Emits a {Transfer} event if a private domain was created.
    /// Throws an exception if:
    /// - `domainId` domain does not exist.
    /// - `prefix` is an empty string, or contains a period.
    /// - `msg.sender` does not own the `domainId` domain and the domain is not public.
    /// - the new domain name already exists.
    /// - the new domain name is a top-level domain and is not public.
    /// @param domainId The domain identifier.
    /// @param prefix The string to concatenate to the domain.
    /// @param public_ indicates if the domain is public
    /// @return newDomainId The new domain identifier.
    function register(
        uint256 domainId,
        string calldata prefix,
        bool public_
    ) external returns (uint256 newDomainId);

    /// @notice Extends the duration of ownership over the `domainId` domain.
    /// @param domainId The domain identifier.
    function refresh(uint256 domainId) external;

    /// @notice Returns the symbolic name of the `domainId` domain.
    /// @dev Throws an exception if the `domainId` domain has not been registered.
    /// @param domainId The domain identifier.
    /// @return domainName The symbolic name of the `domainId` domain.
    function nameOf(uint256 domainId) external view returns (string memory domainName);

    /// @notice Returns the identifier of the `name` domain.
    /// @dev Throws an exception if the `name` domain has not been registered.
    /// @param domainName The domain name.
    /// @return domainId The identifier of the `name` domain.
    function idOf(string calldata domainName) external view returns (uint256 domainId);
}
