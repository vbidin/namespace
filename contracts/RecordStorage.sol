// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./structs/RecordStorageOptions.sol";
import "./interfaces/IRecordStorage.sol";

contract RecordStorage is IRecordStorage {
    IDomainRegistry internal _domainRegistry;

    constructor(RecordStorageOptions memory options) {
        _domainRegistry = options.domainRegistry;
    }
}
