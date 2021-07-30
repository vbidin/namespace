// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct Domain {
    bool exists;
    address owner;
    address approved;
    // timestamp?
    string name;
}
