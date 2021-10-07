// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IRecordStorage.sol";

import "./structs/settings/RecordStorageSettings.sol";

/// @title Implementation of a storage of domain records.
/// @notice Implements the ERC-721 Non-Fungible Token Standard.
contract RecordStorage is IRecordStorage {
    IDomainRegistry internal domainRegistry;

    constructor(RecordStorageSettings memory settings) {
        domainRegistry = settings.domainRegistry;
    }
}
