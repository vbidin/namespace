// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IDomainRegistry.sol";
import "./libraries/DomainService.sol";
import "./libraries/Utilities.sol";
import "./structs/DomainRegistryState.sol";

/// @title Implementation of a registry of domain ownerships
/// @notice Implements the ERC-721 Non-Fungible Token Standard.
contract DomainRegistry is IDomainRegistry {
    using Utilities for *;
    using DomainService for Domain;

    DomainRegistryState private _state;

    modifier domainExists(uint256 domainId) {
        require(_state.domains[domainId].isCreated(), "domain does not exist");
        _;
    }

    modifier domainIsOwned(uint256 domainId, address owner) {
        require(_state.domains[domainId].isOwner(owner), "domain is not owned");
        _;
    }

    modifier domainIsPublic(uint256 domainId) {
        require(_state.domains[domainId].isPublic(), "domain is not public");
        _;
    }

    modifier addressIsNotZero(address a) {
        require(!a.isZero(), "address is zero");
        _;
    }

    modifier addressesAreNotEqual(address a, address b) {
        require(a != b, "addresses are identical");
        _;
    }

    modifier prefixIsNotEmpty(string calldata prefix) {
        require(!prefix.isEmpty(), "prefix is empty");
        _;
    }

    modifier prefixDoesNotContainPeriods(string calldata prefix) {
        require(!prefix.containsPeriods(), "prefix contains periods");
        _;
    }

    constructor() {
        _registerRootDomain();
    }

    /// @inheritdoc IDomainRegistry
    function register(
        uint256 domainId,
        string calldata prefix,
        bool public_
    ) external override returns (uint256 newDomainId) {}

    /// @inheritdoc IDomainRegistry
    function refresh(uint256 domainId)
        external
        override
        returns (uint256 timespan)
    {}

    /// @inheritdoc IERC721
    function transferFrom(
        address sender,
        address recipient,
        uint256 domainId
    ) external override {}

    /// @inheritdoc IERC721
    function safeTransferFrom(
        address sender,
        address recipient,
        uint256 domainId,
        bytes calldata data
    ) external override {}

    /// @inheritdoc IERC721
    function safeTransferFrom(
        address sender,
        address recipient,
        uint256 domainId
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

    function _registerRootDomain() internal {
        Domain storage rootDomain = _state.domains[_state.nextDomainId];
        rootDomain.exists = true;
        rootDomain.timestamp = block.timestamp;
        rootDomain.name = "";
        _state.nameToIdMapping[""] = _state.nextDomainId;
        _state.nextDomainId += 1;

        emit Transfer(address(0), address(0), 0);
    }
}
