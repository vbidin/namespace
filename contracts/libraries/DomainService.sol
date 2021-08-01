// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Utility.sol";
import "./DomainOwnerService.sol";
import "../structs/Domain.sol";
import "../structs/DomainOwner.sol";

library DomainService {
    using Utility for *;
    using DomainService for *;
    using DomainOwnerService for *;

    string internal constant _SEPARATOR = ".";

    function create(
        Domain storage domain,
        uint256 id,
        DomainOwner storage owner,
        string memory name
    ) internal {
        domain.exists = true;
        domain.id = id;
        domain.owner = owner.id;
        owner.numberOfDomains += 1;
        domain.name = name;
        domain.refresh();
    }

    function transfer(
        Domain storage domain,
        DomainOwner storage sender,
        DomainOwner storage recipient
    ) internal {
        domain.owner = recipient.id;
        sender.numberOfDomains -= 1;
        recipient.numberOfDomains += 1;
    }

    function approve(Domain storage domain, address approved) internal {
        domain.approved = approved;
    }

    function refresh(Domain storage domain) internal {
        domain.timestamp = block.timestamp;
    }

    function isCreated(Domain storage domain) internal view returns (bool) {
        return domain.exists;
    }

    function isRoot(Domain storage domain) internal view returns (bool) {
        return domain.id.isZero();
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

    function hasApproved(Domain storage domain, address approved)
        internal
        view
        returns (bool)
    {
        return domain.approved == approved;
    }

    function hasExpired(Domain storage domain, uint256 timespan)
        internal
        view
        returns (bool)
    {
        return block.timestamp - domain.timestamp > timespan;
    }

    function getChildDomainName(Domain storage domain, string calldata prefix)
        internal
        view
        returns (string memory name)
    {
        name = domain.isRoot()
            ? string(abi.encodePacked(prefix, domain.name))
            : string(abi.encodePacked(prefix, _SEPARATOR, domain.name));
    }
}
