import hre from "hardhat";

// location where addresses of deployed contracts are stored
export const DEPLOYMENT_OUTPUT =
  hre.config.paths.artifacts + "/deployment.json";

// unique names of all contracts that are to be deployed
export const DOMAIN_REGISTRY = "DomainRegistry";
export const RECORD_STORAGE = "RecordStorage";

// contract names and their constructor arguments, deployed by insertion order
// references to other contracts will be replaced with addresses during deployment
export const CONSTRUCTOR_ARGUMENTS: Map<string, any> = new Map([
  [DOMAIN_REGISTRY, { domainDuration: 31536000 }],
  [RECORD_STORAGE, { domainRegistry: DOMAIN_REGISTRY }],
]);
