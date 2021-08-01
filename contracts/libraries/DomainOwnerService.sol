// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Utility.sol";
import "../structs/DomainOwner.sol";

library DomainOwnerService {
    using Utility for *;
    using DomainOwnerService for *;

    function create(DomainOwner storage owner, address id) internal {
        owner.exists = true;
        owner.id = id;
    }

    function isCreated(DomainOwner storage owner) internal view returns (bool) {
        return owner.exists;
    }

    function hasAuthorized(DomainOwner storage owner, address operator)
        internal
        view
        returns (bool)
    {
        return owner.operators[operator];
    }
}
