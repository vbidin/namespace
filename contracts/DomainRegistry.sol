// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IDomainRegistry.sol";
import "./libraries/DomainService.sol";
import "./libraries/DomainOwnerService.sol";
import "./libraries/Utility.sol";
import "./structs/Domain.sol";
import "./structs/DomainOwner.sol";

/// @title Implementation of a registry of domain ownerships
/// @notice Implements the ERC-721 Non-Fungible Token Standard.
contract DomainRegistry is IDomainRegistry {
    using Utility for *;
    using DomainService for *;
    using DomainOwnerService for *;

    address internal constant _ZERO_ADDRESS = address(0);
    // replace with protocol parameters and continuous governance
    uint256 internal constant _DOMAIN_DURATION = 31536000; // 365 days in seconds

    uint256 internal _nextDomainId;

    mapping(string => uint256) internal _domainIds;
    mapping(uint256 => Domain) internal _domains;
    mapping(address => DomainOwner) internal _owners;

    modifier addressIsNotZero(address a) {
        require(!a.isZero(), "address is zero");
        _;
    }

    modifier addressesAreNotEqual(address a, address b) {
        require(a != b, "addresses are equal");
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

    modifier domainIdExists(uint256 domainId) {
        require(_domains[domainId].isCreated(), "domain does not exist");
        _;
    }

    modifier domainNameExists(string calldata domainName) {
        require(
            !_domainIds[domainName].isZero() || domainName.isEmpty(),
            "domain does not exist"
        );
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

    modifier domainIsOwnedByCaller(uint256 domainId) {
        require(
            _domains[domainId].isOwnedBy(msg.sender),
            "domain is not owned by caller"
        );
        _;
    }

    modifier domainIsNotOwnedByCaller(uint256 domainId) {
        require(
            !_domains[domainId].isOwnedBy(msg.sender),
            "domain is owned by caller"
        );
        _;
    }

    modifier domainCanBeCreatedByCaller(uint256 domainId) {
        Domain storage domain = _domains[domainId];
        require(
            domain.isPublic() || domain.isOwnedBy(msg.sender),
            "domain is not owned by caller"
        );
        _;
    }

    modifier domainIsOwnedBySender(uint256 domainId, address sender) {
        require(
            _domains[domainId].isOwnedBy(sender),
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

    modifier domainCanBeTransferredByCaller(uint256 domainId) {
        Domain storage domain = _domains[domainId];
        DomainOwner storage owner = _owners[domain.owner];
        require(
            domain.isOwnedBy(msg.sender) ||
                domain.hasApproved(msg.sender) ||
                owner.hasAuthorized(msg.sender),
            "caller can not transfer domain"
        );
        _;
    }

    modifier domainCanBeApprovedByCaller(uint256 domainId) {
        Domain storage domain = _domains[domainId];
        DomainOwner storage owner = _owners[domain.owner];
        require(
            domain.isOwnedBy(msg.sender) || owner.hasAuthorized(msg.sender),
            "caller can not approve domain"
        );
        _;
    }

    constructor() {
        _createRootDomain();
        _createZeroAddress();

        _nextDomainId = 1;
    }

    /// @inheritdoc IDomainRegistry
    function create(uint256 parentDomainId, string calldata prefix)
        external
        override
        domainIdExists(parentDomainId)
        domainCanBeCreatedByCaller(parentDomainId)
        prefixIsNotEmpty(prefix)
        prefixDoesNotContainPeriods(prefix)
        returns (uint256 childDomainId)
    {
        childDomainId = _nextDomainId++;
        _createSubdomain(parentDomainId, childDomainId, prefix);
        _transferDomain(
            _ZERO_ADDRESS,
            _domains[parentDomainId].isRoot() ? _ZERO_ADDRESS : msg.sender,
            childDomainId
        );
        _refreshDomain(childDomainId);
    }

    /// @inheritdoc IDomainRegistry
    function claim(uint256 domainId)
        external
        override
        domainIdExists(domainId)
        domainIsNotPublic(domainId)
        domainIsNotOwnedByCaller(domainId)
        domainHasExpired(domainId, _DOMAIN_DURATION)
    {
        _transferDomain(_domains[domainId].owner, msg.sender, domainId);
        _refreshDomain(domainId);
    }

    /// @inheritdoc IDomainRegistry
    function refresh(uint256 domainId)
        external
        override
        domainIdExists(domainId)
        domainIsNotPublic(domainId)
        domainIsOwnedByCaller(domainId)
    {
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
    function approve(address approved, uint256 domainId)
        external
        override
        domainIdExists(domainId)
        domainIsNotPublic(domainId)
        domainCanBeApprovedByCaller(domainId)
    {
        _approveDomain(approved, domainId);
    }

    /// @inheritdoc IERC721
    function setApprovalForAll(address operator, bool enabled)
        external
        override
        addressIsNotZero(operator)
        addressesAreNotEqual(msg.sender, operator)
    {
        _updateOperator(operator, enabled);
    }

    /// @inheritdoc IDomainRegistry
    function nameOf(uint256 domainId)
        external
        view
        override
        domainIdExists(domainId)
        returns (string memory)
    {
        return _domains[domainId].name;
    }

    /// @inheritdoc IDomainRegistry
    function idOf(string calldata domainName)
        external
        view
        override
        domainNameExists(domainName)
        returns (uint256)
    {
        return _domainIds[domainName];
    }

    /// @inheritdoc IERC721
    function ownerOf(uint256 domainId)
        external
        view
        override
        domainIdExists(domainId)
        returns (address)
    {
        return _domains[domainId].owner;
    }

    /// @inheritdoc IERC721
    function balanceOf(address owner) external view override returns (uint256) {
        return _owners[owner].numberOfDomains;
    }

    /// @inheritdoc IERC721
    function getApproved(uint256 domainId)
        external
        view
        override
        domainIdExists(domainId)
        returns (address)
    {
        return _domains[domainId].approved;
    }

    /// @inheritdoc IERC721
    function isApprovedForAll(address owner, address operator)
        external
        view
        override
        addressIsNotZero(owner)
        addressIsNotZero(operator)
        addressesAreNotEqual(owner, operator)
        returns (bool)
    {
        return _owners[owner].operators[operator];
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

    function _createRootDomain() internal {
        _domains[0].exists = true;
        _domainIds[""] = 0;
    }

    function _createZeroAddress() internal {
        _owners[_ZERO_ADDRESS].exists = true;
    }

    function _getDomainOwner(address id)
        internal
        returns (DomainOwner storage owner)
    {
        owner = _owners[id];
        if (!owner.isCreated()) {
            owner.create(id);
        }
    }

    function _createSubdomain(
        uint256 parentDomainId,
        uint256 childDomainId,
        string calldata prefix
    ) internal {
        Domain storage parentDomain = _domains[parentDomainId];
        Domain storage childDomain = _domains[childDomainId];
        DomainOwner storage owner = _owners[_ZERO_ADDRESS];
        string memory name = parentDomain.getChildDomainName(prefix);

        childDomain.create(childDomainId, name, owner);

        require(_domainIds[name].isZero(), "domain already exists");
        _domainIds[name] = childDomainId;
    }

    function _guardedTransferDomain(
        address sender,
        address recipient,
        uint256 domainId
    )
        internal
        addressIsNotZero(sender)
        addressIsNotZero(recipient)
        addressesAreNotEqual(sender, recipient)
        domainIdExists(domainId)
        domainIsOwnedBySender(domainId, sender)
        domainIsNotPublic(domainId)
        domainCanBeTransferredByCaller(domainId)
    {
        _transferDomain(sender, recipient, domainId);
    }

    function _transferDomain(
        address sender,
        address recipient,
        uint256 domainId
    ) internal {
        _approveDomain(_ZERO_ADDRESS, domainId);

        if (sender != recipient) {
            _domains[domainId].transfer(
                _owners[sender],
                _getDomainOwner(recipient)
            );
        }

        emit Transfer(sender, recipient, domainId);
    }

    function _checkRecipient(
        address sender,
        address recipient,
        uint256 domainId,
        bytes memory data
    ) internal {
        if (recipient.isContract()) {
            IERC721Receiver receiver = IERC721Receiver(recipient);
            bytes4 selector = receiver.onERC721Received(
                msg.sender,
                sender,
                domainId,
                data
            );
            require(
                selector == receiver.onERC721Received.selector,
                "domain transfer failed"
            );
        }
    }

    function _refreshDomain(uint256 domainId) internal {
        Domain storage domain = _domains[domainId];
        domain.refresh();

        emit Refresh(domainId, domain.timestamp);
    }

    function _approveDomain(address approved, uint256 domainId) internal {
        Domain storage domain = _domains[domainId];
        domain.approve(approved);

        emit Approval(domain.owner, approved, domainId);
    }

    function _updateOperator(address operator, bool enabled) internal {
        DomainOwner storage owner = _getDomainOwner(msg.sender);
        owner.operators[operator] = enabled;

        emit ApprovalForAll(msg.sender, operator, enabled);
    }
}
