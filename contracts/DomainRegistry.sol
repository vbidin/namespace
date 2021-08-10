// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IDomainRegistry.sol";

import "./libraries/UtilityLibrary.sol";
import "./libraries/DomainLibrary.sol";

import "./structs/Domain.sol";
import "./structs/DomainOwner.sol";
import "./structs/DomainRegistryOptions.sol";

import "./errors/ValidationErrors.sol";
import "./errors/DomainErrors.sol";

/// @title Implementation of a registry of domain ownerships
/// @notice Implements the ERC-721 Non-Fungible Token Standard.
contract DomainRegistry is IDomainRegistry {
    using UtilityLibrary for *;
    using DomainLibrary for *;

    // replace with protocol parameters
    uint256 internal immutable DOMAIN_DURATION;

    uint256 internal nextDomainId;

    mapping(string => uint256) internal domainIds;

    mapping(uint256 => Domain) internal domains;

    mapping(address => DomainOwner) internal owners;

    constructor(DomainRegistryOptions memory options) {
        DOMAIN_DURATION = options.domainDuration;
        domains[0].exists = true;
        owners[address(0)].exists = true;
        nextDomainId = 1;
    }

    /// @inheritdoc IDomainRegistry
    function create(uint256 parentDomainId, string calldata prefix)
        external
        override
        returns (uint256 childDomainId)
    {
        Domain storage domain = domains[parentDomainId];
        DomainOwner storage owner = _getOrCreateDomainOwner(msg.sender);

        if (!domain.isCreated()) revert DomainDoesNotExist();
        if (!owner.canCreateSubdomain(domain))
            revert DomainIsNotOwnedByCaller();
        if (prefix.isEmpty()) revert StringIsEmpty();
        if (prefix.isValidPrefix()) revert StringContainsPeriods();

        childDomainId = nextDomainId++;
        _createSubdomain(parentDomainId, childDomainId, prefix);
        _transferDomain(
            address(0),
            domain.isRoot() ? address(0) : msg.sender,
            childDomainId
        );
        _refreshDomain(childDomainId);
    }

    /// @inheritdoc IDomainRegistry
    function claim(uint256 domainId) external override {
        Domain storage domain = domains[domainId];

        if (!domain.isCreated()) revert DomainDoesNotExist();
        if (domain.isPublic()) revert DomainIsPublic();
        if (domain.isOwnedBy(msg.sender)) revert DomainIsAlreadyOwnedByCaller();
        if (!domain.hasExpired(DOMAIN_DURATION)) revert DomainHasNotExpired();

        _transferDomain(domain.owner, msg.sender, domainId);
        _refreshDomain(domainId);
    }

    /// @inheritdoc IDomainRegistry
    function refresh(uint256 domainId) external override {
        Domain storage domain = domains[domainId];

        if (!domain.isCreated()) revert DomainDoesNotExist();
        if (domain.isPublic()) revert DomainIsPublic();
        if (!domain.isOwnedBy(msg.sender)) revert DomainIsNotOwnedByCaller();

        _refreshDomain(domainId);
    }

    /// @inheritdoc IERC721
    function transferFrom(
        address sender,
        address recipient,
        uint256 domainId
    ) external override {
        _guardedTransferDomain(sender, recipient, domainId);
    }

    /// @inheritdoc IERC721
    function safeTransferFrom(
        address sender,
        address recipient,
        uint256 domainId,
        bytes calldata data
    ) external override {
        _guardedTransferDomain(sender, recipient, domainId);
        _checkRecipient(sender, recipient, domainId, data);
    }

    /// @inheritdoc IERC721
    function safeTransferFrom(
        address sender,
        address recipient,
        uint256 domainId
    ) external override {
        _guardedTransferDomain(sender, recipient, domainId);
        _checkRecipient(sender, recipient, domainId, "");
    }

    /// @inheritdoc IERC721
    function approve(address approved, uint256 domainId) external override {
        Domain storage domain = domains[domainId];
        DomainOwner storage owner = owners[domain.owner];

        if (!domain.isCreated()) revert DomainDoesNotExist();
        if (domain.isPublic()) revert DomainIsPublic();
        if (!msg.sender.canApprove(domain, owner))
            revert DomainCanNotBeApprovedByCaller();
        if (msg.sender == approved) revert AddressesAreIdentical();

        _approveDomain(approved, domainId);
    }

    /// @inheritdoc IERC721
    function setApprovalForAll(address operator, bool enabled)
        external
        override
    {
        if (operator == address(0)) revert AddressIsZero();
        if (msg.sender == operator) revert AddressesAreIdentical();

        _updateOperator(operator, enabled);
    }

    /// @inheritdoc IDomainRegistry
    function nameOf(uint256 domainId)
        external
        view
        override
        returns (string memory)
    {
        Domain storage domain = domains[domainId];
        if (!domain.isCreated()) revert DomainDoesNotExist();
        return domain.name;
    }

    /// @inheritdoc IDomainRegistry
    function idOf(string calldata domainName)
        external
        view
        override
        returns (uint256)
    {
        if (!domainName.isEmpty() && domainIds[domainName] == 0)
            revert DomainDoesNotExist();
        return domainIds[domainName];
    }

    /// @inheritdoc IERC721
    function ownerOf(uint256 domainId)
        external
        view
        override
        returns (address)
    {
        Domain storage domain = domains[domainId];
        if (!domain.isCreated()) revert DomainDoesNotExist();
        return domain.owner;
    }

    /// @inheritdoc IERC721
    function balanceOf(address owner) external view override returns (uint256) {
        return owners[owner].numberOfDomains;
    }

    /// @inheritdoc IERC721
    function getApproved(uint256 domainId)
        external
        view
        override
        returns (address)
    {
        Domain storage domain = domains[domainId];
        if (!domain.isCreated()) revert DomainDoesNotExist();
        return domain.approved;
    }

    /// @inheritdoc IERC721
    function isApprovedForAll(address owner, address operator)
        external
        view
        override
        returns (bool)
    {
        if (owner == address(0) || operator == address(0))
            revert AddressIsZero();
        if (owner == operator) revert AddressesAreIdentical();
        return owners[owner].operators[operator];
    }

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

    function _getOrCreateDomainOwner(address id)
        internal
        returns (DomainOwner storage owner)
    {
        owner = owners[id];
        if (!owner.isCreated()) {
            owner.create(id);
        }
    }

    function _createSubdomain(
        uint256 parentDomainId,
        uint256 childDomainId,
        string calldata prefix
    ) internal {
        Domain storage parentDomain = domains[parentDomainId];
        Domain storage childDomain = domains[childDomainId];
        DomainOwner storage owner = owners[address(0)];
        string memory name = parentDomain.generateSubdomainName(prefix);

        childDomain.create(childDomainId, name, owner);

        if (domainIds[name] != 0) revert DomainAlreadyExists();
        domainIds[name] = childDomainId;
    }

    function _guardedTransferDomain(
        address sender,
        address recipient,
        uint256 domainId
    ) internal {
        Domain storage domain = domains[domainId];
        DomainOwner storage owner = owners[domain.owner];

        if (sender == address(0) || recipient == address(0))
            revert AddressIsZero();
        if (sender == recipient) revert AddressesAreIdentical();
        if (!domain.isCreated()) revert DomainDoesNotExist();
        if (domain.isPublic()) revert DomainIsPublic();
        if (!domain.isOwnedBy(sender)) revert DomainIsNotOwnedBySender();
        if (!msg.sender.canTransfer(domain, owner))
            revert DomainCanNotBeTransferredByCaller();

        _transferDomain(sender, recipient, domainId);
    }

    function _transferDomain(
        address sender,
        address recipient,
        uint256 domainId
    ) internal {
        _approveDomain(address(0), domainId);
        if (sender != recipient)
            domains[domainId].transfer(
                owners[sender],
                _getOrCreateDomainOwner(recipient)
            );
        emit Transfer(sender, recipient, domainId);
    }

    function _checkRecipient(
        address sender,
        address recipient,
        uint256 domainId,
        bytes memory data
    ) internal {
        if (!recipient.isContract()) return;
        IERC721Receiver receiver = IERC721Receiver(recipient);
        bytes4 selector = receiver.onERC721Received(
            msg.sender,
            sender,
            domainId,
            data
        );
        if (selector != receiver.onERC721Received.selector)
            revert DomainTransferFailed();
    }

    function _refreshDomain(uint256 domainId) internal {
        Domain storage domain = domains[domainId];
        domain.refresh();
        emit Refresh(domainId, domain.timestamp);
    }

    function _approveDomain(address approved, uint256 domainId) internal {
        Domain storage domain = domains[domainId];
        domain.approve(approved);
        emit Approval(domain.owner, approved, domainId);
    }

    function _updateOperator(address operator, bool enabled) internal {
        DomainOwner storage owner = _getOrCreateDomainOwner(msg.sender);
        owner.operators[operator] = enabled;
        emit ApprovalForAll(msg.sender, operator, enabled);
    }
}
