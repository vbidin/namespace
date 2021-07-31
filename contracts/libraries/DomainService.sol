// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Utilities.sol";
import "../structs/Domain.sol";

library DomainService {
    using Utilities for *;
    using DomainService for *;

    function isCreated(Domain storage domain) internal view returns (bool) {
        return domain.exists;
    }

    function isRoot(Domain storage domain) internal view returns (bool) {
        return domain.root;
    }

    function isPublic(Domain storage domain) internal view returns (bool) {
        return domain.owner.isZero();
    }

    function isOwnedBy(Domain storage domain, address owner)
        internal
        view
        returns (bool)
    {
        return domain.owner == owner;
    }

    function hasExpired(Domain storage domain, uint256 timespan)
        internal
        view
        returns (bool)
    {
        return block.timestamp - domain.timestamp > timespan;
    }
}
