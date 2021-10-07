// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct DomainRegistrySettings {
    bytes1 domainSeparator;
    // bytes[] invalidDomainCharacters; ['.', '\t', '\n', ' ', ... and others? ];
    uint256 domainDuration;
}
