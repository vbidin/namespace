import { ethers } from "hardhat";
import { constants, ContractFactory, Signer } from "ethers";
import { expect } from "chai";
import { DomainRegistry } from "../artifacts/types/DomainRegistry";
import { DOMAIN_REGISTRY_CONTRACT } from "../scripts/constants/contracts";
import { TRANSFER_EVENT, REFRESH_EVENT } from "../scripts/constants/events";
import { CONSTRUCTOR_ARGUMENTS } from "../scripts/deployment/options";
import {
  ADDRESSES_ARE_IDENTICAL_ERROR,
  ADDRESS_IS_ZERO_ERROR,
  DOMAIN_ALREADY_EXISTS_ERROR,
  DOMAIN_CAN_NOT_BE_TRANSFERRED_BY_CALLER_ERROR,
  DOMAIN_DOES_NOT_EXIST_ERROR,
  DOMAIN_HAS_NOT_EXPIRED_ERROR,
  DOMAIN_IS_ALREADY_OWNED_BY_CALLER_ERROR,
  DOMAIN_IS_NOT_OWNED_BY_CALLER_ERROR,
  DOMAIN_IS_NOT_OWNED_BY_SENDER_ERROR,
  DOMAIN_IS_PUBLIC_ERROR,
  STRING_CONTAINS_PERIODS_ERROR,
  STRING_IS_EMPTY_ERROR,
} from "../scripts/constants/errors";

describe(DOMAIN_REGISTRY_CONTRACT, () => {
  let factory: ContractFactory;
  let registry: DomainRegistry;

  let first: Signer;
  let second: Signer;
  let third: Signer;

  beforeEach(async () => {
    [first, second, third] = await ethers.getSigners();
    factory = await ethers.getContractFactory(DOMAIN_REGISTRY_CONTRACT);
    registry = (await factory.deploy(
      CONSTRUCTOR_ARGUMENTS.get(DOMAIN_REGISTRY_CONTRACT)!
    )) as DomainRegistry;
  });

  describe("create", async () => {
    it("should revert when parent domain does not exist", async () => {
      await expect(registry.create(1337, "org")).to.be.revertedWith(
        DOMAIN_DOES_NOT_EXIST_ERROR
      );
    });

    it("should create a public domain when parent domain is the root domain", async () => {
      await expect(registry.create(0, "org"))
        .to.emit(registry, TRANSFER_EVENT)
        .withArgs(constants.AddressZero, constants.AddressZero, 1);
    });

    it("should create a private domain when parent domain is a public domain", async () => {
      await registry.create(0, "org");
      await expect(registry.create(1, "ethereum"))
        .to.emit(registry, TRANSFER_EVENT)
        .withArgs(constants.AddressZero, await first.getAddress(), 2);
    });

    it("should succeed when parent domain is a private domain and is owned by the caller", async () => {
      await registry.create(0, "org");
      await registry.create(1, "ethereum");
      await expect(registry.create(2, "memereum"))
        .to.emit(registry, TRANSFER_EVENT)
        .withArgs(constants.AddressZero, await first.getAddress(), 3);
    });

    it("should revert when it's not owned by the caller", async () => {
      await registry.create(0, "org");
      await registry.create(1, "ethereum");
      await expect(
        registry.connect(second).create(2, "memereum")
      ).to.be.revertedWith(DOMAIN_IS_NOT_OWNED_BY_CALLER_ERROR);
    });

    it("should fail when prefix is empty", async () => {
      await expect(registry.create(0, "")).to.be.revertedWith(
        STRING_IS_EMPTY_ERROR
      );
    });

    it("should fail when prefix contains periods", async () => {
      await expect(registry.create(0, "ethereum.org")).to.be.revertedWith(
        STRING_CONTAINS_PERIODS_ERROR
      );
    });

    it("should fail when created domain already exists", async () => {
      await registry.create(0, "org");
      await expect(registry.create(0, "org")).to.be.revertedWith(
        DOMAIN_ALREADY_EXISTS_ERROR
      );
    });

    it("should succeed when domain name is extremely long", async () => {
      const name = "a".repeat(10000);
      await expect(await registry.create(0, name))
        .to.emit(registry, TRANSFER_EVENT)
        .withArgs(constants.AddressZero, constants.AddressZero, 1);
      expect(await registry.idOf(name)).to.be.equal(1);
    });

    it("should succeed when domain names are very long and heavily nested", async () => {
      const name = "a".repeat(100);
      const levels = 100;
      for (let i = 0; i < levels; i++) {
        await registry.create(i, name);
      }
    });
  });

  describe("claim", async () => {
    it("should fail when domain does not exist", async () => {
      await expect(registry.claim(1337)).to.be.revertedWith(
        DOMAIN_DOES_NOT_EXIST_ERROR
      );
    });

    it("should fail when domain is public", async () => {
      await registry.create(0, "org");
      await expect(registry.claim(1)).to.be.revertedWith(
        DOMAIN_IS_PUBLIC_ERROR
      );
    });

    it("should fail when domain is already owned by the caller", async () => {
      await registry.create(0, "org");
      await registry.create(1, "ethereum");
      await expect(registry.claim(2)).to.be.revertedWith(
        DOMAIN_IS_ALREADY_OWNED_BY_CALLER_ERROR
      );
    });

    it("should fail when domain is not owned by the caller and has not expired", async () => {
      await registry.create(0, "org");
      await registry.connect(second).create(1, "ethereum");
      await expect(registry.claim(2)).to.be.revertedWith(
        DOMAIN_HAS_NOT_EXPIRED_ERROR
      );
    });

    it("should succeed when domain is not owned by the caller and has expired", async () => {
      const args = { ...CONSTRUCTOR_ARGUMENTS.get(DOMAIN_REGISTRY_CONTRACT) };
      args.domainDuration = 0;
      registry = (await factory.deploy(args)) as DomainRegistry;

      await registry.create(0, "org");
      await registry.connect(second).create(1, "ethereum");
      await expect(registry.claim(2))
        .to.emit(registry, TRANSFER_EVENT)
        .withArgs(await second.getAddress(), await first.getAddress(), 2);
    });
  });

  describe("refresh", async () => {
    it("should fail when domain does not exist", async () => {
      await expect(registry.refresh(1337)).to.be.revertedWith(
        DOMAIN_DOES_NOT_EXIST_ERROR
      );
    });

    it("should fail when domain is public", async () => {
      await registry.create(0, "org");
      await expect(registry.refresh(1)).to.be.revertedWith(
        DOMAIN_IS_PUBLIC_ERROR
      );
    });

    it("should fail when domain is not owned by the caller", async () => {
      await registry.create(0, "org");
      await registry.connect(second).create(1, "ethereum");
      await expect(registry.refresh(2)).to.be.revertedWith(
        DOMAIN_IS_NOT_OWNED_BY_CALLER_ERROR
      );
    });

    it("should succeed when domain is owned by the caller", async () => {
      await registry.create(0, "org");
      await registry.create(1, "ethereum");
      await expect(registry.refresh(2))
        .to.be.emit(registry, REFRESH_EVENT)
        .withArgs(2, []);
    });
  });

  describe("transferFrom", () => {
    let sender: string;
    let recipient: string;
    let thirdParty: string;
    let domainId: number;

    beforeEach(async () => {
      await registry.create(0, "org");
      await registry.create(1, "ethereum");

      sender = await first.getAddress();
      recipient = await second.getAddress();
      thirdParty = await third.getAddress();
      domainId = 2;
    });

    it("should fail when sender address is the zero address", async () => {
      await expect(
        registry.transferFrom(constants.AddressZero, recipient, domainId)
      ).to.be.revertedWith(ADDRESS_IS_ZERO_ERROR);
    });

    it("should fail when recipient address is the zero address", async () => {
      await expect(
        registry.transferFrom(sender, constants.AddressZero, domainId)
      ).to.be.revertedWith(ADDRESS_IS_ZERO_ERROR);
    });

    it("should fail when sender and recipient address are equal", async () => {
      await expect(
        registry.transferFrom(sender, sender, domainId)
      ).to.be.revertedWith(ADDRESSES_ARE_IDENTICAL_ERROR);
    });

    it("should fail when domain does not exist", async () => {
      await expect(
        registry.transferFrom(sender, recipient, 1337)
      ).to.be.revertedWith(DOMAIN_DOES_NOT_EXIST_ERROR);
    });

    it("should fail when the domain is public", async () => {
      await expect(
        registry.transferFrom(sender, recipient, 1)
      ).to.be.revertedWith(DOMAIN_IS_PUBLIC_ERROR);
    });

    it("should fail when domain is not owned by the sender", async () => {
      await expect(
        registry.transferFrom(recipient, sender, domainId)
      ).to.be.revertedWith(DOMAIN_IS_NOT_OWNED_BY_SENDER_ERROR);
    });

    it("should succeed if the caller is the domain owner", async () => {
      await expect(registry.transferFrom(sender, recipient, domainId))
        .to.emit(registry, TRANSFER_EVENT)
        .withArgs(sender, recipient, domainId);
    });

    it("should succeed if the caller is the approved address", async () => {
      await registry.approve(thirdParty, domainId);
      await expect(
        registry.connect(third).transferFrom(sender, recipient, domainId)
      )
        .to.emit(registry, TRANSFER_EVENT)
        .withArgs(sender, recipient, domainId);
      expect(await registry.getApproved(domainId)).to.equals(
        constants.AddressZero
      );
    });

    it("should succeed if the caller is an authorized operator", async () => {
      await registry.setApprovalForAll(thirdParty, true);
      await expect(
        registry.connect(third).transferFrom(sender, recipient, domainId)
      )
        .to.emit(registry, TRANSFER_EVENT)
        .withArgs(sender, recipient, domainId);
      expect(await registry.getApproved(domainId)).to.equals(
        constants.AddressZero
      );
    });

    it("should fail when the caller is not the owner of the domain, an approved address, or an operator", async () => {
      await expect(
        registry.connect(third).transferFrom(sender, recipient, domainId)
      ).to.be.revertedWith(DOMAIN_CAN_NOT_BE_TRANSFERRED_BY_CALLER_ERROR);
    });
  });

  describe("safeTransferFrom", () => {
    it("should succeed if receiver is not a contract", async () => {});
    it("should succeed if receiver is a contract and returns the expected value", async () => {});
    it("should fail if receiver is a contract and returns an invalid value", async () => {});
    it("should fail to transfer domain if receiver uses too much gas", async () => {});
  });
});
