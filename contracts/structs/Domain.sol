// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct Domain {
    bool exists;
    bool root;
    address owner;
    address approved;
    uint256 timestamp;
    string name;
}
