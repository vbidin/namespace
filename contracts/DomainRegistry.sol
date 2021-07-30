// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IDomainRegistry.sol";
import "./libraries/Domain.sol";
import "./libraries/DomainOwner.sol";
import "./libraries/Utility.sol";

// require & assert
// emit events
// call and verify
// add natspec

/// @title Implementation of a registry of domain ownerships
/// @notice Implements the ERC-721 Non-Fungible Token Standard.
contract DomainRegistry is IDomainRegistry {
    mapping(string => uint256) private _ids;

    mapping(uint256 => Domain.State) private _domains;

    mapping(address => DomainOwner.State) private _owners;

    /*
    modifier domainExists(uint256 domainId) {
        require(_exists(domainId), "domain does not exist");
        _;
    }

    modifier isNotZeroAddress(address address_) {
        require(!address_.isZero(), "address is zero");
        _;
    }

    modifier areDifferentAddresses(address a, address b) {
        require(a != b, "addresses are identical");
        _;
    }

    modifier isNotEmpty(string calldata domainName) {
        require(!domainName.isEmpty(), "domain name is empty");
        _;
    }

    modifier doesNotContainPeriods(string calldata domainName) {
        require(!domainName.containsPeriods(), "domain name contains periods");
        _;
    }

    modifier isDomainOwner(uint256 domainId, address account) {
        require(_isOwner(domainId, account), "address is not the owner");
        _;
    }

    modifier isNotDomainOwner(uint256 domainId, address account) {
        require(!_isOwner(domainId, account), "address is the owner");
        _;
    }

    modifier domainIsPublic(uint256 domainId) {
        require(_isPublic(domainId), "domain is not public");
        _;
    }

    modifier domainIsNotPublic(uint256 domainId) {
        require(!_isPublic(domainId), "domain is public");
        _;
    }
    */

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
