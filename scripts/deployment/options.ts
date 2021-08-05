import hre from "hardhat";

// location where addresses of deployed contracts are stored
export const DEPLOYMENT_OUTPUT =
  hre.config.paths.artifacts + "/deployment.json";

// contract names and their constructor arguments, deployed by insertion order
// references to other contracts will be replaced with addresses during deployment
export const CONSTRUCTOR_ARGUMENTS = new Map<string, any[]>();
CONSTRUCTOR_ARGUMENTS.set("DomainRegistry", [31536000]);
CONSTRUCTOR_ARGUMENTS.set("RecordStorage", ["DomainRegistry"]);
