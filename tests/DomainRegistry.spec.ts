import { ethers } from "hardhat";
import { constants, ContractFactory, Signer } from "ethers";
import { expect } from "chai";
import { DomainRegistry } from "../artifacts/types/DomainRegistry";
import { Contracts } from "../scripts/enums/contracts";
import { Events } from "../scripts/enums/events";
import { Errors } from "../scripts/enums/errors";
import { ConstructorArguments } from "../scripts/deployment/options";

describe(Contracts.DomainRegistry, () => {
  let caller: Signer; // default signer
  let owner: Signer;
  let recipient: Signer;
  let approved: Signer;
  let operator: Signer;
  let other: Signer;

  let factory: ContractFactory;
  let args: any;
  let registry: DomainRegistry;

  const prefix = "org";
  const prefixWithPeriods = "memereum.org";
  const longPrefix = "a".repeat(100);
  const extremelyLongPrefix = "a".repeat(10000);
  const numberOfLevels = 100;

  const missingDomain = { id: 1337 };
  const rootDomain = { id: 0, name: "" };
  const publicDomain = { id: 1, prefix: "org", name: "org" };
  const privateDomain = { id: 2, prefix: "ethereum", name: "ethereum.org" };
  const anotherPrivateDomain = {
    id: 3,
    prefix: "app",
    name: "app.ethereum.org",
  };

  beforeEach(async () => {
    [caller, owner, recipient, approved, operator, other] =
      await ethers.getSigners();
    factory = await ethers.getContractFactory(Contracts.DomainRegistry);
    args = { ...ConstructorArguments.get(Contracts.DomainRegistry) };
    registry = (await factory.deploy(args)) as DomainRegistry;
  });

  describe("create", async () => {
    it("should revert when parent domain does not exist", async () => {
      await expect(
        registry.create(missingDomain.id, prefix)
      ).to.be.revertedWith(Errors.DomainDoesNotExist);
    });

    it("should create a public domain when parent domain is the root domain", async () => {
      await expect(registry.create(rootDomain.id, publicDomain.prefix))
        .to.emit(registry, Events.Transfer)
        .withArgs(
          constants.AddressZero,
          constants.AddressZero,
          publicDomain.id
        );
    });

    it("should create a private domain when parent domain is a public domain", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await expect(registry.create(publicDomain.id, privateDomain.prefix))
        .to.emit(registry, Events.Transfer)
        .withArgs(
          constants.AddressZero,
          await caller.getAddress(),
          privateDomain.id
        );
    });

    it("should succeed when parent domain is a private domain and is owned by the caller", async () => {
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

    it("should revert when it's not owned by the caller", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry
        .connect(owner)
        .create(publicDomain.id, privateDomain.prefix);
      await expect(
        registry.create(privateDomain.id, anotherPrivateDomain.prefix)
      ).to.be.revertedWith(Errors.DomainIsNotOwnedByCaller);
    });

    it("should fail when prefix is empty", async () => {
      await expect(registry.create(rootDomain.id, "")).to.be.revertedWith(
        Errors.StringIsEmpty
      );
    });

    it("should fail when prefix contains periods", async () => {
      await expect(
        registry.create(rootDomain.id, prefixWithPeriods)
      ).to.be.revertedWith(Errors.StringContainsPeriods);
    });

    it("should fail when created domain already exists", async () => {
      await registry.create(rootDomain.id, prefix);
      await expect(registry.create(rootDomain.id, prefix)).to.be.revertedWith(
        Errors.DomainAlreadyExists
      );
    });

    it("should succeed when domain name is extremely long", async () => {
      await expect(await registry.create(rootDomain.id, extremelyLongPrefix))
        .to.emit(registry, Events.Transfer)
        .withArgs(
          constants.AddressZero,
          constants.AddressZero,
          publicDomain.id
        );
    });

    it("should succeed when domain names are very long and heavily nested", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      for (let i = publicDomain.id; i < numberOfLevels; i++) {
        expect(await registry.create(i, longPrefix))
          .to.emit(registry, Events.Transfer)
          .withArgs(constants.AddressZero, await caller.getAddress(), i + 1);
      }
    });
  });

  describe("claim", async () => {
    it("should fail when domain does not exist", async () => {
      await expect(registry.claim(missingDomain.id)).to.be.revertedWith(
        Errors.DomainDoesNotExist
      );
    });

    it("should fail when domain is public", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await expect(registry.claim(publicDomain.id)).to.be.revertedWith(
        Errors.DomainIsPublic
      );
    });

    it("should fail when domain is already owned by the caller", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry.create(publicDomain.id, privateDomain.prefix);
      await expect(registry.claim(privateDomain.id)).to.be.revertedWith(
        Errors.DomainIsAlreadyOwnedByCaller
      );
    });

    it("should fail when domain is not owned by the caller and has not expired", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry
        .connect(owner)
        .create(publicDomain.id, privateDomain.prefix);
      await expect(registry.claim(privateDomain.id)).to.be.revertedWith(
        Errors.DomainHasNotExpired
      );
    });

    it("should succeed when domain is not owned by the caller and has expired", async () => {
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
    it("should fail when domain does not exist", async () => {
      await expect(registry.refresh(missingDomain.id)).to.be.revertedWith(
        Errors.DomainDoesNotExist
      );
    });

    it("should fail when domain is public", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await expect(registry.refresh(publicDomain.id)).to.be.revertedWith(
        Errors.DomainIsPublic
      );
    });

    it("should fail when domain is not owned by the caller", async () => {
      await registry.create(rootDomain.id, publicDomain.prefix);
      await registry
        .connect(owner)
        .create(publicDomain.id, privateDomain.prefix);
      await expect(registry.refresh(privateDomain.id)).to.be.revertedWith(
        Errors.DomainIsNotOwnedByCaller
      );
    });

    it("should succeed when domain is owned by the caller", async () => {
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

    it("should fail when sender address is the zero address", async () => {
      await expect(
        registry.transferFrom(
          constants.AddressZero,
          await recipient.getAddress(),
          privateDomain.id
        )
      ).to.be.revertedWith(Errors.AddressIsZero);
    });

    it("should fail when recipient address is the zero address", async () => {
      await expect(
        registry.transferFrom(
          await owner.getAddress(),
          constants.AddressZero,
          privateDomain.id
        )
      ).to.be.revertedWith(Errors.AddressIsZero);
    });

    it("should fail when sender and recipient address are equal", async () => {
      await expect(
        registry.transferFrom(
          await owner.getAddress(),
          await owner.getAddress(),
          privateDomain.id
        )
      ).to.be.revertedWith(Errors.AddressesAreIdentical);
    });

    it("should fail when domain does not exist", async () => {
      await expect(
        registry.transferFrom(
          await owner.getAddress(),
          await recipient.getAddress(),
          missingDomain.id
        )
      ).to.be.revertedWith(Errors.DomainDoesNotExist);
    });

    it("should fail when the domain is public", async () => {
      await expect(
        registry.transferFrom(
          await owner.getAddress(),
          await recipient.getAddress(),
          publicDomain.id
        )
      ).to.be.revertedWith(Errors.DomainIsPublic);
    });

    it("should fail when domain is not owned by the sender", async () => {
      await expect(
        registry.transferFrom(
          await other.getAddress(),
          await recipient.getAddress(),
          privateDomain.id
        )
      ).to.be.revertedWith(Errors.DomainIsNotOwnedBySender);
    });

    it("should succeed if the caller is the domain owner", async () => {
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

    it("should succeed if the caller is the approved address", async () => {
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

    it("should succeed if the caller is an authorized operator", async () => {
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

    it("should fail when the caller is not the owner of the domain, an approved address, or an operator", async () => {
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

    it("should fail if domain does not exist", async () => {
      await expect(
        registry.approve(await approved.getAddress(), missingDomain.id)
      ).to.be.revertedWith(Errors.DomainDoesNotExist);
    });

    it("should fail if domain is public", async () => {
      await expect(
        registry.approve(await approved.getAddress(), publicDomain.id)
      ).to.be.revertedWith(Errors.DomainIsPublic);
    });

    it("should fail if caller does not own domain and is not authorized operator", async () => {
      await expect(
        registry
          .connect(other)
          .approve(await approved.getAddress(), privateDomain.id)
      ).to.be.revertedWith(Errors.DomainCanNotBeApprovedByCaller);
    });

    it("should fail if domain owner approves himself", async () => {
      await expect(
        registry
          .connect(owner)
          .approve(await owner.getAddress(), privateDomain.id)
      ).to.be.revertedWith(Errors.AddressesAreIdentical);
    });

    it("should fail if authorized operator approves himself", async () => {
      await expect(
        registry
          .connect(operator)
          .approve(await operator.getAddress(), privateDomain.id)
      ).to.be.revertedWith(Errors.AddressesAreIdentical);
    });

    it("should succeed if caller owns domain", async () => {
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

    it("should succeed if caller is authorized operator", async () => {
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

    it("should succeed if approved is zero address", async () => {
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
    it("should fail if operator is zero address", async () => {
      await expect(
        registry.setApprovalForAll(constants.AddressZero, true)
      ).to.be.revertedWith(Errors.AddressIsZero);
    });

    it("should fail if operator is caller", async () => {
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
});
