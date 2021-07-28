// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IDomainRegistry.sol";

/// @title Implementation of a registry of domain ownerships
/// @notice Implements the ERC-721 Non-Fungible Token Standard.
contract DomainRegistry is IDomainRegistry {
    mapping(string => uint256) private _ids;

    mapping(uint256 => address) private _owners;

    mapping(uint256 => string) private _names;

    mapping(address => uint256) private _balances;

    mapping(uint256 => address) private _approved;

    mapping(address => mapping(address => bool)) private _operators;

    modifier exists(uint256 id) {
        require(_exists(id), "domain does not exist");
        _;
    }

    modifier isNotZero(address a) {
        require(!_isZero(a), "address is zero");
        _;
    }

    modifier isNotEmpty(string calldata s) {
        require(!_isEmpty(s), "string is empty");
        _;
    }

    modifier doesNotContainPeriods(string calldata s) {
        // iterate through bytes(s) and compare to '.'
        // can there be any false positives with utf-8?
        _;
    }

    modifier isOwner(uint256 id, address a) {
        require(_isOwner(id, a), "address is not the owner");
        _;
    }

    modifier isNotOwner(uint256 id, address a) {
        require(!_isOwner(id, a), "address is the owner");
        _;
    }

    constructor() {}

    /// @inheritdoc IDomainRegistry
    function register(
        uint256 id,
        string calldata prefix,
        bool public_
    ) external override returns (uint256) {}

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
    function approve(address approved, uint256 id)
        external
        override
        exists(id)
        isNotOwner(id, approved)
    {}

    /// @inheritdoc IERC721
    function setApprovalForAll(address operator, bool approved)
        external
        override
        isNotZero(operator)
    {}

    /// @inheritdoc IERC721
    function getApproved(uint256 id)
        external
        view
        override
        exists(id)
        returns (address)
    {
        return _approved[id];
    }

    /// @inheritdoc IERC721
    function isApprovedForAll(address owner, address operator)
        external
        view
        override
        isNotZero(owner)
        isNotZero(operator)
        returns (bool)
    {
        return _operators[owner][operator];
    }

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
    function idOf(string calldata name) public view override returns (uint256) {
        return _ids[name];
    }

    /// @inheritdoc IDomainRegistry
    function nameOf(uint256 id)
        public
        view
        override
        exists(id)
        returns (string memory)
    {
        return _names[id];
    }

    /// @inheritdoc IERC721
    function ownerOf(uint256 id)
        public
        view
        override
        exists(id)
        returns (address)
    {
        return _owners[id];
    }

    /// @inheritdoc IERC721
    function balanceOf(address owner)
        public
        view
        override
        isNotZero(owner)
        returns (uint256)
    {
        return _balances[owner];
    }

    function _exists(uint256 id) private view returns (bool) {
        return bytes(_names[id]).length != 0;
    }

    function _isOwner(uint256 id, address a) private view returns (bool) {
        return _owners[id] == a;
    }

    function _isZero(address a) private pure returns (bool) {
        return a == address(0);
    }

    function _isEmpty(string calldata s) private pure returns (bool) {
        return bytes(s).length == 0;
    }
}

// require & assert
// emit events
// call and verify
// add natspec
