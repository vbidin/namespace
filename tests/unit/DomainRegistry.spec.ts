import { ethers } from "hardhat";
import { constants, ContractFactory, Signer } from "ethers";
import { expect } from "chai";
import { DomainRegistry } from "../../artifacts/types/DomainRegistry";
import { DOMAIN_REGISTRY_CONTRACT } from "../../scripts/constants";
import { CONSTRUCTOR_ARGUMENTS } from "../../scripts/deployment/options";

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
        "domain does not exist"
      );
    });

    it("should create a public domain when parent domain is the root domain", async () => {
      await expect(registry.create(0, "org"))
        .to.emit(registry, "Transfer")
        .withArgs(constants.AddressZero, constants.AddressZero, 1);
    });

    it("should create a private domain when parent domain is a public domain", async () => {
      await registry.create(0, "org");
      await expect(registry.create(1, "ethereum"))
        .to.emit(registry, "Transfer")
        .withArgs(constants.AddressZero, await first.getAddress(), 2);
    });

    it("should succeed when parent domain is a private domain and is owned by the caller", async () => {
      await registry.create(0, "org");
      await registry.create(1, "ethereum");
      await expect(registry.create(2, "memereum"))
        .to.emit(registry, "Transfer")
        .withArgs(constants.AddressZero, await first.getAddress(), 3);
    });

    it("should revert when it's not owned by the caller", async () => {
      await registry.create(0, "org");
      await registry.create(1, "ethereum");
      await expect(
        registry.connect(second).create(2, "memereum")
      ).to.be.revertedWith("domain is not owned by caller");
    });

    it("should fail when prefix is empty", async () => {
      await expect(registry.create(0, "")).to.be.revertedWith(
        "prefix is empty"
      );
    });

    it("should fail when prefix contains periods", async () => {
      await expect(registry.create(0, "ethereum.org")).to.be.revertedWith(
        "prefix contains periods"
      );
    });

    it("should fail when created domain already exists", async () => {
      await registry.create(0, "org");
      await expect(registry.create(0, "org")).to.be.revertedWith(
        "domain already exists"
      );
    });

    it("should succeed when domain name is extremely long", async () => {
      const name = "a".repeat(10000);
      await expect(await registry.create(0, name))
        .to.emit(registry, "Transfer")
        .withArgs(constants.AddressZero, constants.AddressZero, 1);
      await expect(await registry.idOf(name)).to.be.equal(1);
    });

    it("should succeed when domain names are very long and heavily nested", async () => {
      const name = "a".repeat(100);
      const levels = 100;
      for (let i = 0; i < levels; i++) {
        await registry.create(i, name);
      }
      const domainName = await registry.nameOf(100);
    });
  });

  describe("claim", async () => {
    it("should fail when domain does not exist", async () => {
      await expect(registry.claim(1337)).to.be.revertedWith(
        "domain does not exist"
      );
    });

    it("should fail when domain is public", async () => {
      await registry.create(0, "org");
      await expect(registry.claim(1)).to.be.revertedWith("domain is public");
    });

    it("should fail when domain is owned by the caller", async () => {
      await registry.create(0, "org");
      await registry.create(1, "ethereum");
      await expect(registry.claim(2)).to.be.revertedWith(
        "domain is owned by caller"
      );
    });

    it("should fail when domain is not owned by the caller and has not expired", async () => {
      await registry.create(0, "org");
      await registry.connect(second).create(1, "ethereum");
      await expect(registry.claim(2)).to.be.revertedWith(
        "domain has not expired"
      );
    });

    it("should succeed when domain is not owned by the caller and has expired", async () => {
      const args = { ...CONSTRUCTOR_ARGUMENTS.get(DOMAIN_REGISTRY_CONTRACT) };
      args.domainDuration = 0;
      registry = (await factory.deploy(args)) as DomainRegistry;

      await registry.create(0, "org");
      await registry.connect(second).create(1, "ethereum");
      await expect(registry.claim(2))
        .to.emit(registry, "Transfer")
        .withArgs(await second.getAddress(), await first.getAddress(), 2);
    });
  });

  describe("refresh", async () => {
    it("should fail when domain does not exist", async () => {
      await expect(registry.refresh(1337)).to.be.revertedWith(
        "domain does not exist"
      );
    });

    it("should fail when domain is public", async () => {
      await registry.create(0, "org");
      await expect(registry.refresh(1)).to.be.revertedWith("domain is public");
    });

    it("should fail when domain is not owned by the caller", async () => {
      await registry.create(0, "org");
      await registry.connect(second).create(1, "ethereum");
      await expect(registry.refresh(2)).to.be.revertedWith(
        "domain is not owned by caller"
      );
    });

    it("should succeed when domain is owned by the caller", async () => {
      await registry.create(0, "org");
      await registry.create(1, "ethereum");
      await expect(registry.refresh(2))
        .to.be.emit(registry, "Refresh")
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
      ).to.be.revertedWith("address is zero");
    });

    it("should fail when recipient address is the zero address", async () => {
      await expect(
        registry.transferFrom(sender, constants.AddressZero, domainId)
      ).to.be.revertedWith("address is zero");
    });

    it("should fail when sender and recipient address are equal", async () => {
      await expect(
        registry.transferFrom(sender, sender, domainId)
      ).to.be.revertedWith("addresses are equal");
    });

    it("should fail when domain does not exist", async () => {
      await expect(
        registry.transferFrom(sender, recipient, 1337)
      ).to.be.revertedWith("domain does not exist");
    });

    it("should fail when the domain is public", async () => {
      await expect(
        registry.transferFrom(sender, recipient, 1)
      ).to.be.revertedWith("domain is public");
    });

    it("should fail when domain is not owned by the sender", async () => {
      await expect(
        registry.transferFrom(recipient, sender, domainId)
      ).to.be.revertedWith("domain is not owned by sender");
    });

    it("should succeed if the caller is the domain owner", async () => {
      await expect(registry.transferFrom(sender, recipient, domainId))
        .to.emit(registry, "Transfer")
        .withArgs(sender, recipient, domainId);
    });

    it("should succeed if the caller is the approved address", async () => {
      await registry.approve(thirdParty, domainId);
      await expect(
        registry.connect(third).transferFrom(sender, recipient, domainId)
      )
        .to.emit(registry, "Transfer")
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
        .to.emit(registry, "Transfer")
        .withArgs(sender, recipient, domainId);
      expect(await registry.getApproved(domainId)).to.equals(
        constants.AddressZero
      );
    });

    it("should fail when the caller is not the owner of the domain, an approved address, or an operator", async () => {
      await expect(
        registry.connect(third).transferFrom(sender, recipient, domainId)
      ).to.be.revertedWith("caller can not transfer domain");
    });
  });
});
