// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Domain.sol";
import "./DomainOwner.sol";

struct DomainRegistryState {
    uint256 nextDomainId;
    mapping(string => uint256) domainIds;
    mapping(uint256 => Domain) domains;
    mapping(address => DomainOwner) owners;
}
