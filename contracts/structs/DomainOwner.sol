// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct DomainOwner {
    uint256 numberOfDomains;
    mapping(address => bool) operators;
}
