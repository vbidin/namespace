// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct Domain {
    bool exists;
    uint256 id;
    uint256 timestamp;
    address owner;
    address approved;
    string name;
}
