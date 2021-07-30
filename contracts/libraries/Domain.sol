// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Utility.sol";

library Domain {
    using Utility for address;

    struct State {
        bool exists;
        address owner;
        address approved;
        // timestamp?
        string name;
    }

    function create(
        mapping(uint256 => State) storage domains,
        uint256 id,
        address owner,
        string calldata name
    ) internal {
        State storage domain = domains[id];
        domain.exists = true;
        domain.owner = owner;
        domain.name = name;
    }

    function isCreated(State storage domain) internal view returns (bool) {
        return domain.exists;
    }

    function isPublic(State storage domain) internal view returns (bool) {
        return domain.owner.isZero();
    }

    function isOwner(State storage domain, address address_)
        internal
        view
        returns (bool)
    {
        return domain.owner == address_;
    }
}
