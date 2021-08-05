// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./structs/RecordStorageOptions.sol";

contract RecordStorage {
    IDomainRegistry internal _domainRegistry;

    constructor(RecordStorageOptions memory options) {
        _domainRegistry = options.domainRegistry;
    }
}
