// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct DomainOwner {
    bool exists;
    address id;
    uint256 numberOfDomains;
    mapping(address => bool) operators;
}
