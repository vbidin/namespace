// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library DomainOwner {
    struct State {
        uint256 numberOfDomains;
        mapping(address => bool) operators;
    }
}
