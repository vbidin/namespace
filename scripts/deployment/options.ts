import hre from "hardhat";

// location where addresses of deployed contracts are stored
export const DEPLOYMENT_FILE = hre.config.paths.artifacts + "/deployment.json";

// contract names and their constructor arguments, deployed by insertion order
// references to other contracts will be replaced with addresses during deployment
export const CONTRACTS = new Map<string, any[]>();
CONTRACTS.set("DomainRegistry", []);
CONTRACTS.set("RecordStorage", ["DomainRegistry"]);
