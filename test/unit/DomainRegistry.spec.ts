import { ethers } from "hardhat";
import { Signer } from "ethers";
import { expect } from "chai";

import { DomainRegistry } from "../../build/types/DomainRegistry";

const contract = "DomainRegistry";
describe(contract, () => {
  let signer: Signer;
  let registry: DomainRegistry;

  beforeEach(async () => {
    [signer] = await ethers.getSigners();
    const factory = await ethers.getContractFactory(contract);
    registry = (await factory.deploy()) as DomainRegistry;
    await registry.deployed();
  });

  it("should throw an exception", async () => {
    await expect(registry.ownerOf(1)).to.be.reverted;
  });
});
