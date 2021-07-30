// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../structs/Domain.sol";
import "../structs/DomainOwner.sol";

import "./Utilities.sol";

library DomainService {
    using Utilities for address;

    function create(
        mapping(uint256 => Domain) storage domains,
        uint256 id,
        address owner,
        string calldata name
    ) internal {
        Domain storage domain = domains[id];
        domain.exists = true;
        domain.owner = owner;
        domain.name = name;
    }

    function isCreated(Domain storage domain) internal view returns (bool) {
        return domain.exists;
    }

    function isPublic(Domain storage domain) internal view returns (bool) {
        return domain.owner.isZero();
    }

    function isOwner(Domain storage domain, address owner)
        internal
        view
        returns (bool)
    {
        return domain.owner == owner;
    }
}

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
