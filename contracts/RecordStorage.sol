// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./structs/RecordStorageOptions.sol";
import "./interfaces/IRecordStorage.sol";

/// @title Implementation of a storage of domain records.
/// @notice Implements the ERC-721 Non-Fungible Token Standard.
contract RecordStorage is IRecordStorage {
    IDomainRegistry internal _domainRegistry;

    constructor(RecordStorageOptions memory options) {
        _domainRegistry = options.domainRegistry;
    }
}
