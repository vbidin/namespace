// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Utilities.sol";
import "../structs/Domain.sol";

library DomainService {
    using Utilities for *;

    function isCreated(Domain storage domain) internal view returns (bool) {
        return domain.exists;
    }

    function isOwner(Domain storage domain, address owner)
        internal
        view
        returns (bool)
    {
        return domain.owner == owner;
    }

    function isPublic(Domain storage domain) internal view returns (bool) {
        return domain.owner.isZero();
    }

    function hasExpired(Domain storage domain, uint256 timespan)
        internal
        view
        returns (bool)
    {
        return block.timestamp - domain.timestamp > timespan;
    }
}
