import { ethers } from "hardhat";
import { constants, ContractFactory, Signer } from "ethers";
import { expect } from "chai";
import { DomainRegistry } from "../artifacts/types/DomainRegistry";
import { Contracts } from "../scripts/enums/contracts";
import { Events } from "../scripts/enums/events";
import { Errors } from "../scripts/enums/errors";
import { ConstructorArguments } from "../scripts/deployment/options";
import {
  anotherPrivateDomain,
  extremelyLongPrefix,
  longPrefix,
  missingDomain,
  numberOfLevels,
  prefix,
  prefixWithPeriods,
  privateDomain,
  publicDomain,
  rootDomain,
  supportedInterfaceIds,
  unsupportedInterfaceIds,
} from "./shared/data";

describe(Contracts.DomainRegistry, () => {
  let caller: Signer; // default signer
  let owner: Signer;
  let claimer: Signer;
  let recipient: Signer;
  let approved: Signer;
  let operator: Signer;
  let other: Signer;

  let factory: ContractFactory;
  let args: any;
  let registry: DomainRegistry;

  beforeEach(async () => {
    [caller, owner, claimer, recipient, approved, operator, other] =
      await ethers.getSigners();
    factory = await ethers.getContractFactory(Contracts.DomainRegistry);
    args = { ...ConstructorArguments.get(Contracts.DomainRegistry) };
    registry = (await factory.deploy(args)) as DomainRegistry;
  });

  describe("create", async () => {
    it("should revert when the parent domain does not exist", async () => {
      await expect(
        registry.create(missingDomain.id, prefix)
      ).to.be.revertedWith(Errors.DomainDoesNotExist);
    });

    it("should create a public domain when the parent domain is the root domain", async () => {
      await expect(registry.create(rootDomain.id, publicDomain.prefix))
        .to.emit(registry, Events.Transfer)
        .withArgs(
          constants.AddressZero,
          constants.AddressZero,
          publicDomain.id
        );
    });

    it("should create a private domain when the parent domain is a public domain", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await expect(registry.create(publicDomain.id, privateDomain.prefix))
        .to.emit(registry, Events.Transfer)
        .withArgs(
          constants.AddressZero,
          await caller.getAddress(),
          privateDomain.id
        );
    });

    it("should create a private domain when the parent domain is a private domain and is owned by the caller", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry.create(publicDomain.id, privateDomain.prefix);
      await expect(
        registry.create(privateDomain.id, anotherPrivateDomain.prefix)
      )
        .to.emit(registry, Events.Transfer)
        .withArgs(
          constants.AddressZero,
          await caller.getAddress(),
          anotherPrivateDomain.id
        );
    });

    it("should revert when parent domain is not owned by the caller", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry
        .connect(owner)
        .create(publicDomain.id, privateDomain.prefix);
      await expect(
        registry.create(privateDomain.id, anotherPrivateDomain.prefix)
      ).to.be.revertedWith(Errors.DomainIsNotOwnedByCaller);
    });

    it("should revert when the prefix is empty", async () => {
      await expect(registry.create(rootDomain.id, "")).to.be.revertedWith(
        Errors.StringIsEmpty
      );
    });

    // should revert when the prefix is illegal in general
    it("should revert when the prefix contains periods", async () => {
      await expect(
        registry.create(rootDomain.id, prefixWithPeriods)
      ).to.be.revertedWith(Errors.StringContainsPeriods);
    });

    it("should revert when the created domain already exists", async () => {
      await registry.create(rootDomain.id, prefix);
      await expect(registry.create(rootDomain.id, prefix)).to.be.revertedWith(
        Errors.DomainAlreadyExists
      );
    });

    it("should succeed even when the prefix is extremely long", async () => {
      await expect(await registry.create(rootDomain.id, extremelyLongPrefix))
        .to.emit(registry, Events.Transfer)
        .withArgs(
          constants.AddressZero,
          constants.AddressZero,
          publicDomain.id
        );
    });

    it("should succeed even when domain names are very long and heavily nested", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      for (let i = publicDomain.id; i < numberOfLevels; i++) {
        expect(await registry.create(i, longPrefix))
          .to.emit(registry, Events.Transfer)
          .withArgs(constants.AddressZero, await caller.getAddress(), i + 1);
      }
    });
  });

  describe("claim", async () => {
    it("should revert when the domain does not exist", async () => {
      await expect(registry.claim(missingDomain.id)).to.be.revertedWith(
        Errors.DomainDoesNotExist
      );
    });

    it("should revert when the domain is public", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await expect(registry.claim(publicDomain.id)).to.be.revertedWith(
        Errors.DomainIsPublic
      );
    });

    it("should revert when the domain is already owned by the caller", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry.create(publicDomain.id, privateDomain.prefix);
      await expect(registry.claim(privateDomain.id)).to.be.revertedWith(
        Errors.DomainIsAlreadyOwnedByCaller
      );
    });

    it("should revert when the domain is not owned by the caller and has not expired", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry
        .connect(owner)
        .create(publicDomain.id, privateDomain.prefix);
      await expect(registry.claim(privateDomain.id)).to.be.revertedWith(
        Errors.DomainHasNotExpired
      );
    });

    it("should claim the domain when it is not owned by the caller and has expired", async () => {
      args.domainDuration = 0;
      registry = (await factory.deploy(args)) as DomainRegistry;
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry
        .connect(owner)
        .create(publicDomain.id, privateDomain.prefix);
      await expect(registry.claim(privateDomain.id))
        .to.emit(registry, Events.Transfer)
        .withArgs(
          await owner.getAddress(),
          await caller.getAddress(),
          privateDomain.id
        );
    });
  });

  describe("refresh", async () => {
    it("should revert when the domain does not exist", async () => {
      await expect(registry.refresh(missingDomain.id)).to.be.revertedWith(
        Errors.DomainDoesNotExist
      );
    });

    it("should revert when the domain is public", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await expect(registry.refresh(publicDomain.id)).to.be.revertedWith(
        Errors.DomainIsPublic
      );
    });

    it("should revert when the domain is not owned by the caller", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry
        .connect(owner)
        .create(publicDomain.id, privateDomain.prefix);
      await expect(registry.refresh(privateDomain.id)).to.be.revertedWith(
        Errors.DomainIsNotOwnedByCaller
      );
    });

    it("should refresh the domain when it is owned by the caller", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry.create(publicDomain.id, privateDomain.prefix);
      await expect(registry.refresh(privateDomain.id))
        .to.be.emit(registry, Events.Refresh)
        .withArgs(privateDomain.id, []);
    });
  });

  describe("transferFrom", () => {
    beforeEach(async () => {
      await registry.create(rootDomain.id, publicDomain.name);
      await registry
        .connect(owner)
        .create(publicDomain.id, privateDomain.prefix);
      await registry
        .connect(owner)
        .approve(await approved.getAddress(), privateDomain.id);
      await registry
        .connect(owner)
        .setApprovalForAll(await operator.getAddress(), true);
    });

    it("should revert when the sender is the zero address", async () => {
      await expect(
        registry.transferFrom(
          constants.AddressZero,
          await recipient.getAddress(),
          privateDomain.id
        )
      ).to.be.revertedWith(Errors.AddressIsZero);
    });

    it("should revert when the recipient is the zero address", async () => {
      await expect(
        registry.transferFrom(
          await owner.getAddress(),
          constants.AddressZero,
          privateDomain.id
        )
      ).to.be.revertedWith(Errors.AddressIsZero);
    });

    it("should revert when the sender and recipient addresses are equal", async () => {
      await expect(
        registry.transferFrom(
          await owner.getAddress(),
          await owner.getAddress(),
          privateDomain.id
        )
      ).to.be.revertedWith(Errors.AddressesAreIdentical);
    });

    it("should revert when the domain does not exist", async () => {
      await expect(
        registry.transferFrom(
          await owner.getAddress(),
          await recipient.getAddress(),
          missingDomain.id
        )
      ).to.be.revertedWith(Errors.DomainDoesNotExist);
    });

    it("should revert when the domain is public", async () => {
      await expect(
        registry.transferFrom(
          await owner.getAddress(),
          await recipient.getAddress(),
          publicDomain.id
        )
      ).to.be.revertedWith(Errors.DomainIsPublic);
    });

    it("should revert when the domain is not owned by the sender", async () => {
      await expect(
        registry.transferFrom(
          await other.getAddress(),
          await recipient.getAddress(),
          privateDomain.id
        )
      ).to.be.revertedWith(Errors.DomainIsNotOwnedBySender);
    });

    it("should transfer the domain if the caller is the domain owner", async () => {
      await expect(
        registry
          .connect(owner)
          .transferFrom(
            await owner.getAddress(),
            await recipient.getAddress(),
            privateDomain.id
          )
      )
        .to.emit(registry, Events.Transfer)
        .withArgs(
          await owner.getAddress(),
          await recipient.getAddress(),
          privateDomain.id
        );
    });

    it("should transfer the domain if the caller is the approved address", async () => {
      await expect(
        registry
          .connect(approved)
          .transferFrom(
            await owner.getAddress(),
            await recipient.getAddress(),
            privateDomain.id
          )
      )
        .to.emit(registry, Events.Transfer)
        .withArgs(
          await owner.getAddress(),
          await recipient.getAddress(),
          privateDomain.id
        );
      expect(await registry.getApproved(privateDomain.id)).to.equals(
        constants.AddressZero
      );
    });

    it("should transfer the domain if the caller is an authorized operator", async () => {
      await expect(
        registry
          .connect(operator)
          .transferFrom(
            await owner.getAddress(),
            await recipient.getAddress(),
            privateDomain.id
          )
      )
        .to.emit(registry, Events.Transfer)
        .withArgs(
          await owner.getAddress(),
          await recipient.getAddress(),
          privateDomain.id
        );
      expect(await registry.getApproved(privateDomain.id)).to.equals(
        constants.AddressZero
      );
    });

    it("should revert when the caller is not the owner of the domain, an approved address, or an operator", async () => {
      await expect(
        registry
          .connect(other)
          .transferFrom(
            await owner.getAddress(),
            await recipient.getAddress(),
            privateDomain.id
          )
      ).to.be.revertedWith(Errors.DomainCanNotBeTransferredByCaller);
    });
  });

  /*
  describe("safeTransferFrom", () => {
    it("should succeed if receiver is not a contract", async () => {});
    it("should succeed if receiver is a contract and returns the expected value", async () => {});
    it("should fail if receiver is a contract and returns an invalid value", async () => {});
    it("should fail to transfer domain if receiver uses too much gas", async () => {});
  });
  */

  describe("approve", () => {
    beforeEach(async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry
        .connect(owner)
        .create(publicDomain.id, privateDomain.prefix);
      await registry
        .connect(owner)
        .setApprovalForAll(await operator.getAddress(), true);
    });

    it("should revert if the domain does not exist", async () => {
      await expect(
        registry.approve(await approved.getAddress(), missingDomain.id)
      ).to.be.revertedWith(Errors.DomainDoesNotExist);
    });

    it("should revert if the domain is public", async () => {
      await expect(
        registry.approve(await approved.getAddress(), publicDomain.id)
      ).to.be.revertedWith(Errors.DomainIsPublic);
    });

    it("should revert if the caller does not own the domain and is not an authorized operator", async () => {
      await expect(
        registry
          .connect(other)
          .approve(await approved.getAddress(), privateDomain.id)
      ).to.be.revertedWith(Errors.DomainCanNotBeApprovedByCaller);
    });

    it("should revert if the domain owner approves himself", async () => {
      await expect(
        registry
          .connect(owner)
          .approve(await owner.getAddress(), privateDomain.id)
      ).to.be.revertedWith(Errors.AddressesAreIdentical);
    });

    it("should revert if the authorized operator approves himself", async () => {
      await expect(
        registry
          .connect(operator)
          .approve(await operator.getAddress(), privateDomain.id)
      ).to.be.revertedWith(Errors.AddressesAreIdentical);
    });

    it("should approve the address if the caller owns the domain", async () => {
      await expect(
        registry
          .connect(owner)
          .approve(await approved.getAddress(), privateDomain.id)
      )
        .to.emit(registry, Events.Approval)
        .withArgs(
          await owner.getAddress(),
          await approved.getAddress(),
          privateDomain.id
        );
    });

    it("should approve the address if the caller is an authorized operator", async () => {
      await expect(
        registry
          .connect(operator)
          .approve(await approved.getAddress(), privateDomain.id)
      )
        .to.emit(registry, Events.Approval)
        .withArgs(
          await owner.getAddress(),
          await approved.getAddress(),
          privateDomain.id
        );
    });

    it("should approve if the approved is the zero address", async () => {
      await expect(
        registry.connect(owner).approve(constants.AddressZero, privateDomain.id)
      )
        .to.emit(registry, Events.Approval)
        .withArgs(
          await owner.getAddress(),
          constants.AddressZero,
          privateDomain.id
        );
    });
  });

  describe("setApprovalForAll", () => {
    it("should revert if the operator is the zero address", async () => {
      await expect(
        registry.setApprovalForAll(constants.AddressZero, true)
      ).to.be.revertedWith(Errors.AddressIsZero);
    });

    it("should revert if the operator is the caller", async () => {
      await expect(
        registry.setApprovalForAll(await caller.getAddress(), true)
      ).to.be.revertedWith(Errors.AddressesAreIdentical);
    });

    it("should succeed otherwise", async () => {
      const values = [true, false, true];
      for (const value of values) {
        await expect(
          registry.setApprovalForAll(await operator.getAddress(), value)
        )
          .to.emit(registry, Events.ApprovalForAll)
          .withArgs(
            await caller.getAddress(),
            await operator.getAddress(),
            value
          );
      }
    });
  });

  describe("nameOf", async () => {
    beforeEach(async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry.create(publicDomain.id, privateDomain.prefix);
      await registry.create(privateDomain.id, anotherPrivateDomain.prefix);
    });

    it("should revert if the domain id does not exist", async () => {
      await expect(registry.nameOf(missingDomain.id)).to.be.revertedWith(
        Errors.DomainDoesNotExist
      );
    });

    it("should return the domain name if the domain id exists", async () => {
      const domains = [
        rootDomain,
        publicDomain,
        privateDomain,
        anotherPrivateDomain,
      ];
      for (const domain of domains) {
        expect(await registry.nameOf(domain.id)).to.equal(domain.name);
      }
    });
  });

  describe("idOf", async () => {
    beforeEach(async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry.create(publicDomain.id, privateDomain.prefix);
      await registry.create(privateDomain.id, anotherPrivateDomain.prefix);
    });

    it("should revert if the domain name does not exist", async () => {
      await expect(registry.idOf(missingDomain.name)).to.be.revertedWith(
        Errors.DomainDoesNotExist
      );
    });

    it("should return the domain id if the domain name exists", async () => {
      const domains = [
        rootDomain,
        publicDomain,
        privateDomain,
        anotherPrivateDomain,
      ];
      for (const domain of domains) {
        expect(await registry.idOf(domain.name)).to.equal(domain.id);
      }
    });
  });

  describe("ownerOf", async () => {
    beforeEach(async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry.create(publicDomain.id, privateDomain.prefix);
      await registry.create(privateDomain.id, anotherPrivateDomain.prefix);
    });

    it("should revert if the domain does not exist", async () => {
      await expect(registry.ownerOf(missingDomain.id)).to.be.revertedWith(
        Errors.DomainDoesNotExist
      );
    });

    it("should return owner if the domain is private", async () => {
      const domains = [privateDomain, anotherPrivateDomain];
      for (const domain of domains) {
        expect(await registry.ownerOf(domain.id)).to.equal(
          await caller.getAddress()
        );
      }
    });

    it("should return the zero address if the domain is public", async () => {
      const domains = [rootDomain, publicDomain];
      for (const domain of domains) {
        expect(await registry.ownerOf(domain.id)).to.equal(
          constants.AddressZero
        );
      }
    });

    it("should return the new owner after the domain is transferred", async () => {
      expect(await registry.ownerOf(privateDomain.id)).to.equal(
        await caller.getAddress()
      );
      await registry.transferFrom(
        await caller.getAddress(),
        await recipient.getAddress(),
        privateDomain.id
      );
      expect(await registry.ownerOf(privateDomain.id)).to.equal(
        await recipient.getAddress()
      );
    });

    it("should return the new owner after the domain is claimed", async () => {
      args.domainDuration = 0;
      registry = (await factory.deploy(args)) as DomainRegistry;
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry
        .connect(owner)
        .create(publicDomain.id, privateDomain.prefix);
      expect(await registry.ownerOf(privateDomain.id)).to.equal(
        await owner.getAddress()
      );
      await registry.connect(claimer).claim(privateDomain.id);
      expect(await registry.ownerOf(privateDomain.id)).to.equal(
        await claimer.getAddress()
      );
    });
  });

  describe("balanceOf", async () => {
    beforeEach(async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry.create(publicDomain.id, privateDomain.prefix);
    });

    it("should return the number of public domains", async () => {
      expect(await registry.balanceOf(constants.AddressZero)).to.equal(2);
    });

    it("should return the number of private domains owned by the address", async () => {
      expect(await registry.balanceOf(await caller.getAddress())).to.equal(1);
    });

    it("should return the correct balance after domain is created", async () => {
      await registry.create(privateDomain.id, anotherPrivateDomain.prefix);
      expect(await registry.balanceOf(await caller.getAddress())).to.equal(2);
    });

    it("should return the correct balance after domain is transferred", async () => {
      await registry.transferFrom(
        await caller.getAddress(),
        await recipient.getAddress(),
        privateDomain.id
      );
      expect(await registry.balanceOf(await caller.getAddress())).to.equal(0);
      expect(await registry.balanceOf(await recipient.getAddress())).to.equal(
        1
      );
    });
  });

  describe("getApproved", async () => {
    beforeEach(async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry.create(publicDomain.id, privateDomain.prefix);
    });

    it("should revert if the domain does not exist", async () => {
      await expect(registry.getApproved(missingDomain.id)).to.be.revertedWith(
        Errors.DomainDoesNotExist
      );
    });

    it("should revert if the domain is a public domain", async () => {
      const domains = [rootDomain, publicDomain];
      for (const domain of domains) {
        await expect(registry.getApproved(domain.id)).to.be.revertedWith(
          Errors.DomainIsPublic
        );
      }
    });

    it("should return the zero address", async () => {
      expect(await registry.getApproved(privateDomain.id)).to.equal(
        constants.AddressZero
      );
    });

    it("should return the approved address", async () => {
      await registry.approve(await approved.getAddress(), privateDomain.id);
      expect(await registry.getApproved(privateDomain.id)).to.equal(
        await approved.getAddress()
      );
    });

    it("should return the zero address after domain is transferred", async () => {
      expect(
        await registry.approve(await approved.getAddress(), privateDomain.id)
      );
      await registry
        .connect(approved)
        .transferFrom(
          await caller.getAddress(),
          await recipient.getAddress(),
          privateDomain.id
        );
      expect(await registry.getApproved(privateDomain.id)).to.equal(
        constants.AddressZero
      );
    });
  });

  describe("isApprovedForAll", async () => {
    it("should revert if the owner is the zero address", async () => {
      await expect(
        registry.isApprovedForAll(
          constants.AddressZero,
          await operator.getAddress()
        )
      ).to.be.revertedWith(Errors.AddressIsZero);
    });

    it("should revert if the operator is the zero address", async () => {
      await expect(
        registry.isApprovedForAll(
          await owner.getAddress(),
          constants.AddressZero
        )
      ).to.be.revertedWith(Errors.AddressIsZero);
    });

    it("should revert if the owner and operator are identical", async () => {
      await expect(
        registry.isApprovedForAll(
          await owner.getAddress(),
          await owner.getAddress()
        )
      ).to.be.revertedWith(Errors.AddressesAreIdentical);
    });

    it("should return false if the operator was never authorized by the owner", async () => {
      expect(
        await registry.isApprovedForAll(
          await owner.getAddress(),
          await operator.getAddress()
        )
      ).to.be.false;
    });

    it("should return true if the operator is authorized by the owner", async () => {
      await registry
        .connect(owner)
        .setApprovalForAll(await operator.getAddress(), true);
      expect(
        await registry.isApprovedForAll(
          await owner.getAddress(),
          await operator.getAddress()
        )
      ).to.be.true;
    });

    it("should return correct value after operator status is changed", async () => {
      const values = [true, false, true];
      for (const value of values) {
        await registry
          .connect(owner)
          .setApprovalForAll(await operator.getAddress(), value);
        expect(
          await registry.isApprovedForAll(
            await owner.getAddress(),
            await operator.getAddress()
          )
        ).to.equal(value);
      }
    });
  });

  describe("supportsInterface", async () => {
    it("should return true when interfaceId is supported", async () => {
      for (const interfaceId of supportedInterfaceIds) {
        expect(await registry.supportsInterface(interfaceId)).to.equal(true);
      }
    });

    it("should return false when interfaceId is not supported", async () => {
      for (const interfaceId of unsupportedInterfaceIds) {
        expect(await registry.supportsInterface(interfaceId)).to.equal(false);
      }
    });
  });
});
