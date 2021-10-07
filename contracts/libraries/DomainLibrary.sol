// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UtilityLibrary.sol";
import "../structs/Domain.sol";
import "../structs/DomainOwner.sol";

library DomainLibrary {
    using UtilityLibrary for *;
    using DomainLibrary for *;

    function create(
        Domain storage domain,
        uint256 id,
        string memory name,
        DomainOwner storage owner
    ) internal {
        domain.exists = true;
        domain.id = id;
        domain.name = name;
        domain.owner = owner.id;
        owner.numberOfDomains += 1;
    }

    function create(DomainOwner storage owner, address id) internal {
        owner.exists = true;
        owner.id = id;
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

    function refresh(Domain storage domain) internal {
        domain.timestamp = block.timestamp;
    }

    function approve(Domain storage domain, address approved) internal {
        domain.approved = approved;
    }

    function isCreated(Domain storage domain) internal view returns (bool) {
        return domain.exists;
    }

    function isCreated(DomainOwner storage owner) internal view returns (bool) {
        return owner.exists;
    }

    function isRoot(Domain storage domain) internal view returns (bool) {
        return domain.id == 0;
    }

    function isPublic(Domain storage domain) internal view returns (bool) {
        return domain.owner == address(0);
    }

    function isOwnedBy(Domain storage domain, address a)
        internal
        view
        returns (bool)
    {
        return domain.owner == a;
    }

    function isApprovedFor(Domain storage domain, address approved)
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

    function hasAuthorized(DomainOwner storage owner, address a)
        internal
        view
        returns (bool)
    {
        return owner.operators[a];
    }

    function canApprove(
        address caller,
        Domain storage domain,
        DomainOwner storage owner
    ) internal view returns (bool) {
        return domain.isOwnedBy(caller) || owner.hasAuthorized(caller);
    }

    function canTransfer(
        address caller,
        Domain storage domain,
        DomainOwner storage owner
    ) internal view returns (bool) {
        return
            domain.isOwnedBy(caller) ||
            domain.isApprovedFor(caller) ||
            owner.hasAuthorized(caller);
    }

    function canCreateSubdomain(
        DomainOwner storage owner,
        Domain storage domain
    ) internal view returns (bool) {
        return domain.isPublic() || domain.isOwnedBy(owner.id);
    }

    function generateSubdomainName(
        Domain storage domain,
        string calldata prefix,
        bytes1 separator
    ) internal view returns (string memory name) {
        name = domain.isRoot()
            ? prefix
            : string(abi.encodePacked(prefix, separator, domain.name));
    }
}
