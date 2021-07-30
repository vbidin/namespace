// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IDomainRegistry.sol";

import "./libraries/DomainService.sol";
import "./libraries/Utilities.sol";

import "./structs/Domain.sol";
import "./structs/DomainOwner.sol";

// require & assert
// emit events
// call and verify
// add natspec

/// @title Implementation of a registry of domain ownerships
/// @notice Implements the ERC-721 Non-Fungible Token Standard.
contract DomainRegistry is IDomainRegistry {
    mapping(uint256 => Domain) private _domains;

    mapping(address => DomainOwner) private _owners;

    mapping(string => uint256) private _nameToId;

    constructor() {}

    /// @inheritdoc IDomainRegistry
    function register(
        uint256 domainId,
        string calldata prefix,
        bool public_
    ) external override returns (uint256) {}

    /// @inheritdoc IDomainRegistry
    function refresh(uint256 domainId) external override {}

    /// @inheritdoc IERC721
    function transferFrom(
        address to,
        address from,
        uint256 domainIds
    ) external override {}

    /// @inheritdoc IERC721
    function safeTransferFrom(
        address to,
        address from,
        uint256 domainId,
        bytes calldata data
    ) external override {}

    /// @inheritdoc IERC721
    function safeTransferFrom(
        address to,
        address from,
        uint256 domainIds
    ) external override {}

    /// @inheritdoc IERC721
    function approve(address approved, uint256 domainId) external override {}

    /// @inheritdoc IERC721
    function setApprovalForAll(address operator, bool approved)
        external
        override
    {}

    /// @inheritdoc IDomainRegistry
    function nameOf(uint256 domainId)
        external
        view
        override
        returns (string memory)
    {}

    /// @inheritdoc IDomainRegistry
    function idOf(string calldata name)
        external
        view
        override
        returns (uint256)
    {}

    /// @inheritdoc IERC721
    function ownerOf(uint256 domainId)
        external
        view
        override
        returns (address)
    {}

    /// @inheritdoc IERC721
    function balanceOf(address owner)
        external
        view
        override
        returns (uint256)
    {}

    /// @inheritdoc IERC721
    function getApproved(uint256 domainId)
        external
        view
        override
        returns (address)
    {}

    /// @inheritdoc IERC721
    function isApprovedForAll(address owner, address operator)
        external
        view
        override
        returns (bool)
    {}

    /// @inheritdoc IERC165
    function supportsInterface(bytes4 interfaceId)
        external
        pure
        override
        returns (bool)
    {
        return
            interfaceId == type(IDomainRegistry).interfaceId ||
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
