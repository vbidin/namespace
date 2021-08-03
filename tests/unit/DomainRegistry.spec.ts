import { ethers } from "hardhat";
import { constants, Signer } from "ethers";
import { expect } from "chai";
import { DomainRegistry } from "../../artifacts/types/DomainRegistry";

describe("DomainRegistry", () => {
  let registry: DomainRegistry;
  let main: Signer;
  let other: Signer;

  beforeEach(async () => {
    [main, other] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("DomainRegistry");
    registry = (await factory.deploy()) as DomainRegistry;
    await registry.deployed();
  });

  describe("when creating a new domain", async () => {
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
        .withArgs(constants.AddressZero, await main.getAddress(), 2);
    });

    describe("when parent domain is a private domain", async () => {
      beforeEach(async () => {
        await registry.create(0, "org");
        await registry.create(1, "ethereum");
      });

      it("should succeed when it's owned by the caller", async () => {
        await expect(registry.create(2, "memereum"))
          .to.emit(registry, "Transfer")
          .withArgs(constants.AddressZero, await main.getAddress(), 3);
      });

      it("should revert when it's not owned by the caller", async () => {
        await expect(
          registry.connect(other).create(2, "memereum")
        ).to.be.revertedWith("domain is not owned by caller");
      });
    });

    describe("should fail when prefix", async () => {
      it("is empty", async () => {
        await expect(registry.create(0, "")).to.be.revertedWith(
          "prefix is empty"
        );
      });

      it("contains periods", async () => {
        await expect(registry.create(0, "ethereum.org")).to.be.revertedWith(
          "prefix contains periods"
        );
      });
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
    });
  });
});
