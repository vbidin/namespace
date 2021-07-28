import hre from "hardhat";

export const options = {
  outputFile: hre.config.paths.artifacts + "/deployment.json",
  contractNames: ["DomainRegistry", "RecordStorage"],
  constructorArguments: [[], ["DomainRegistry"]],
};
