// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Utility.sol";

library Domain {
    using Utility for address;

    struct State {
        bool created;
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
        State storage state = domains[id];
        state.created = true;
        state.owner = owner;
        state.name = name;
    }

    function exists(State storage domain) internal view returns (bool) {
        return domain.created;
    }

    function isPublic(State storage domain) internal view returns (bool) {
        return domain.owner.isZero();
    }
}
