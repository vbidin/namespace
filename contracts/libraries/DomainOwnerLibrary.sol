// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UtilityLibrary.sol";
import "./DomainLibrary.sol";

import "../structs/Domain.sol";
import "../structs/DomainOwner.sol";

library DomainOwnerLibrary {
    using UtilityLibrary for *;
    using DomainLibrary for *;

    function create(DomainOwner storage owner, address id) internal {
        owner.exists = true;
        owner.id = id;
    }

    function isCreated(DomainOwner storage owner) internal view returns (bool) {
        return owner.exists;
    }

    function hasAuthorized(DomainOwner storage owner, address a)
        internal
        view
        returns (bool)
    {
        return owner.operators[a];
    }

    function canCreateSubdomain(
        DomainOwner storage owner,
        Domain storage domain
    ) internal view returns (bool) {
        return domain.isPublic() || domain.isOwnedBy(owner.id);
    }
}
