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
    using DomainService for *;

    DomainRegistryState private _state;

    modifier domainIdExists(uint256 domainId) {
        require(_state.domains[domainId].isCreated(), "domain does not exist");
        _;
    }

    modifier domainIsOwned(uint256 domainId, address owner) {
        require(
            _state.domains[domainId].isOwnedBy(owner),
            "domain is not owned"
        );
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
        _registerRootDomain(0, "");
    }

    /// @inheritdoc IDomainRegistry
    function create(uint256 domainId, string calldata prefix)
        external
        override
        domainIdExists(domainId)
        prefixIsNotEmpty(prefix)
        prefixDoesNotContainPeriods(prefix)
        returns (uint256 subdomainId)
    {
        Domain storage domain = _state.domains[domainId];
        require(
            domain.isPublic() || domain.isOwnedBy(msg.sender),
            "sender is not domain owner"
        );

        subdomainId = _state.nextDomainId++;
        Domain storage subdomain = _state.domains[subdomainId];

        subdomain.exists = true;
        subdomain.timestamp = block.timestamp;
        if (!domain.isRoot()) {
            subdomain.owner = msg.sender;
        }
        if (domain.isRoot()) {
            subdomain.name = string(abi.encodePacked(prefix, domain.name));
        } else {
            subdomain.name = string(abi.encodePacked(prefix, ".", domain.name));
        }

        mapping(string => uint256) storage map = _state.domainIds;
        require(map[subdomain.name] == 0, "domain already exists");
        map[subdomain.name] = subdomainId;
    }

    /// @inheritdoc IDomainRegistry
    function claim(uint256 domainId) external override {
        
    }

    /// @inheritdoc IDomainRegistry
    function extend(uint256 domainId) external override {}

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

    function _registerRootDomain(
        uint256 rootDomainId,
        string memory rootDomainName
    ) internal {
        _state.nextDomainId = rootDomainId + 1;
        _state.domainIds[rootDomainName] = rootDomainId;

        Domain storage rootDomain = _state.domains[rootDomainId];
        rootDomain.exists = true;
        rootDomain.root = true;
        rootDomain.name = rootDomainName;

        emit Transfer(address(0), address(0), rootDomainId);
    }
}
