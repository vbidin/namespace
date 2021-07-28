import { ethers } from "hardhat";
import { expect } from "chai";

import { DomainRegistry } from "../../artifacts/types/DomainRegistry";

const contract = "DomainRegistry";
describe(contract, () => {
  let registry: DomainRegistry;

  beforeEach(async () => {
    const factory = await ethers.getContractFactory(contract);
    registry = (await factory.deploy()) as DomainRegistry;
    await registry.deployed();
  });

  it("should throw an exception", async () => {
    await expect(registry.ownerOf(1)).to.be.reverted;
  });
});