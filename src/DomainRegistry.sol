// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IDomainRegistry.sol";

/// @title Implementation of a registry of domain ownerships
/// @notice Implements the ERC-721 Non-Fungible Token Standard.
contract DomainRegistry is IDomainRegistry {
    enum DomainType {
        Root,
        TopLevel,
        Regular
    }

    struct Domain {
        uint256 id;
        bool tld;
        address owner;
        string name;
    }

    // STATE

    // MODIFIERS

    constructor() {}

    // RECEIVE

    // FALLBACK

    /// @inheritdoc IDomainRegistry
    function register(uint256 id, string calldata prefix)
        external
        override
        returns (uint256)
    {}

    /// @inheritdoc IDomainRegistry
    function refresh(uint256 id) external override {}

    /// @inheritdoc IERC721
    function transferFrom(
        address to,
        address from,
        uint256 ids
    ) external override {}

    /// @inheritdoc IERC721
    function safeTransferFrom(
        address to,
        address from,
        uint256 id,
        bytes calldata data
    ) external override {}

    /// @inheritdoc IERC721
    function safeTransferFrom(
        address to,
        address from,
        uint256 ids
    ) external override {}

    /// @inheritdoc IERC721
    function approve(address approved, uint256 id) external override {}

    /// @inheritdoc IERC721
    function setApprovalForAll(address operator, bool approved)
        external
        override
    {}

    /// @inheritdoc IERC721
    function getApproved(uint256 id) external view override returns (address) {}

    /// @inheritdoc IERC721
    function isApprovedForAll(address owner, address operator)
        external
        view
        override
        returns (bool)
    {}

    /// @inheritdoc IERC165
    function supportsInterface(bytes4 id)
        external
        pure
        override
        returns (bool)
    {
        return
            id == type(IDomainRegistry).interfaceId ||
            id == type(IERC721).interfaceId ||
            id == type(IERC165).interfaceId;
    }

    /// @inheritdoc IDomainRegistry
    function idOf(string calldata name)
        public
        view
        override
        returns (uint256)
    {}

    /// @inheritdoc IDomainRegistry
    function nameOf(uint256 id) public view override returns (string memory) {}

    /// @inheritdoc IERC721
    function ownerOf(uint256 id) public view override returns (address) {}

    /// @inheritdoc IERC721
    function balanceOf(address owner) public view override returns (uint256) {}

    /// @inheritdoc IDomainRegistry
    function isRegistered(string calldata name)
        public
        view
        override
        returns (bool)
    {}

    /// @inheritdoc IDomainRegistry
    function isTopLevelDomain(uint256 id) public view override returns (bool) {}
}

// use modifiers
// require & assert
// emit events
// call and verify
// add natspec
