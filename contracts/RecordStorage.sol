// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DomainRegistry.sol";

contract RecordStorage {
    DomainRegistry private _registry;

    constructor(DomainRegistry registry) {
        _registry = registry;
    }
}
