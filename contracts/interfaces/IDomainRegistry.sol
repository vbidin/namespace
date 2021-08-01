// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC721.sol";

/// @title Interface of a registry of domain ownerships
/// @notice Complies with the ERC-721 Non-Fungible Token Standard.
interface IDomainRegistry is IERC721 {
    /// @notice Creates a new domain by concatenating the `prefix` to the `parentDomainId` domain name.
    /// @dev Top level domains are always public and can not be owned.
    /// Emits a {Transfer} event.
    /// Throws an exception if:
    /// - `parentDomainId` domain does not exist.
    /// - `parentDomainId` domain is not public and `msg.sender` does not own it.
    /// - `prefix` is an empty string.
    /// - `prefix` contains a period.
    /// -  the child domain already exists.
    /// @param parentDomainId The domain identifier.
    /// @param prefix The string to concatenate to the domain.
    /// @return childDomainId The domain identifier of the newly created domain.
    function create(uint256 parentDomainId, string calldata prefix)
        external
        returns (uint256 childDomainId);

    /// @notice Claims ownership over the `domainId` domain if it has expired.
    /// @dev Emits a {Transfer} event.
    /// Throws an exception if:
    /// - `domainId` domain does not exist.
    /// - `domainId` domain is public.
    /// - `domainId` domain is already owned by `msg.sender`.
    /// - `domainId` domain has not expired.
    /// @param domainId The domain identifier.
    function claim(uint256 domainId) external;

    /// @notice Extends the duration of ownership of the `domainId` domain.
    /// @dev Throws an exception if:
    /// - `domainId` domain does not exist.
    /// - `domainId` domain is public.
    /// - `domainId` domain is not owned by `msg.sender`.
    /// @param domainId The domain identifier.
    function extend(uint256 domainId) external;

    /// @notice Returns the symbolic name of the `domainId` domain.
    /// @dev Throws an exception if the `domainId` domain has not been registered.
    /// @param domainId The domain identifier.
    /// @return domainName The symbolic name of the `domainId` domain.
    function nameOf(uint256 domainId)
        external
        view
        returns (string memory domainName);

    /// @notice Returns the identifier of the `name` domain.
    /// @dev Throws an exception if the `name` domain has not been registered.
    /// @param domainName The domain name.
    /// @return domainId The identifier of the `name` domain.
    function idOf(string calldata domainName)
        external
        view
        returns (uint256 domainId);
}
