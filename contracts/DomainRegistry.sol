// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IDomainRegistry.sol";
import "./libraries/DomainService.sol";
import "./libraries/Utilities.sol";
import "./structs/Domain.sol";
import "./structs/DomainOwner.sol";

/// @title Implementation of a registry of domain ownerships
/// @notice Implements the ERC-721 Non-Fungible Token Standard.
contract DomainRegistry is IDomainRegistry {
    using Utilities for *;
    using DomainService for *;

    uint256 internal _nextDomainId;
    uint256 internal _domainDuration; // replace with protocol parameters
    mapping(string => uint256) internal _domainIds;
    mapping(uint256 => Domain) internal _domains;
    mapping(address => DomainOwner) internal _owners;

    modifier domainIdExists(uint256 domainId) {
        require(_domains[domainId].isCreated(), "domain does not exist");
        _;
    }

    modifier domainIsPublic(uint256 domainId) {
        require(_domains[domainId].isPublic(), "domain is not public");
        _;
    }

    modifier domainIsNotPublic(uint256 domainId) {
        require(_domains[domainId].isPublic(), "domain is public");
        _;
    }

    modifier domainIsOwnedBySender(uint256 domainId, address sender) {
        require(
            _domains[domainId].isOwnedBy(sender),
            "domain is not owned by sender"
        );
        _;
    }

    modifier domainIsNotOwnedBySender(uint256 domainId, address sender) {
        require(
            !_domains[domainId].isOwnedBy(sender),
            "domain is owned by sender"
        );
        _;
    }

    modifier domainCanBeCreatedBySender(uint256 domainId, address sender) {
        Domain storage domain = _domains[domainId];
        require(
            domain.isPublic() || domain.isOwnedBy(sender),
            "domain is not owned by sender"
        );
        _;
    }

    modifier domainHasExpired(uint256 domainId, uint256 duration) {
        require(
            _domains[domainId].hasExpired(duration),
            "domain has not expired"
        );
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
        _domainDuration = 31536000; // 365 days in seconds
    }

    /// @inheritdoc IDomainRegistry
    function create(uint256 parentDomainId, string calldata prefix)
        external
        override
        domainIdExists(parentDomainId)
        domainCanBeCreatedBySender(parentDomainId, msg.sender)
        prefixIsNotEmpty(prefix)
        prefixDoesNotContainPeriods(prefix)
        returns (uint256 childDomainId)
    {
        childDomainId = _nextDomainId++;

        Domain storage parentDomain = _domains[parentDomainId];
        Domain storage childDomain = _domains[childDomainId];

        childDomain.exists = true;
        childDomain.timestamp = block.timestamp;
        childDomain.owner = parentDomain.getChildDomainOwner(msg.sender);
        childDomain.name = parentDomain.getChildDomainName(prefix);

        require(_domainIds[childDomain.name].isZero(), "domain already exists");
        _domainIds[childDomain.name] = childDomainId;

        if (!childDomain.owner.isZero()) {
            _owners[childDomain.owner].numberOfDomains++;
        }

        emit Transfer(address(0), childDomain.owner, childDomainId);
    }

    /// @inheritdoc IDomainRegistry
    function claim(uint256 domainId)
        external
        override
        domainIdExists(domainId)
        domainIsNotPublic(domainId)
        domainIsNotOwnedBySender(domainId, msg.sender)
        domainHasExpired(domainId, _domainDuration)
    {
        Domain storage domain = _domains[domainId];
        address oldOwner = domain.owner;
        domain.owner = msg.sender;
        domain.timestamp = block.timestamp;

        emit Transfer(oldOwner, domain.owner, domainId);
    }

    /// @inheritdoc IDomainRegistry
    function extend(uint256 domainId)
        external
        override
        domainIdExists(domainId)
        domainIsNotPublic(domainId)
        domainIsOwnedBySender(domainId, msg.sender)
    {
        Domain storage domain = _domains[domainId];
        domain.timestamp = block.timestamp;
    }

    /// @inheritdoc IERC721
    function transferFrom(
        address sender,
        address recipient,
        uint256 domainId
    )
        external
        override
        addressIsNotZero(sender)
        domainIsOwnedBySender(domainId, sender)
        addressIsNotZero(recipient)
        domainIdExists(domainId)
        domainIsNotPublic(domainId)
    {}

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
        _nextDomainId = rootDomainId + 1;
        _domainIds[rootDomainName] = rootDomainId;

        Domain storage rootDomain = _domains[rootDomainId];
        rootDomain.exists = true;
        rootDomain.root = true;
        rootDomain.name = rootDomainName;

        emit Transfer(address(0), address(0), rootDomainId);
    }
}
