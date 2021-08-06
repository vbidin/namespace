import hre from "hardhat";
import {
  DOMAIN_REGISTRY_CONTRACT,
  RECORD_STORAGE_CONTRACT,
} from "../constants/contracts";

// location where addresses of deployed contracts will be stored
export const DEPLOYMENT_OUTPUT =
  hre.config.paths.artifacts + "/deployment.json";

// contract names and their constructor arguments, deployed by insertion order
// references to other contracts will be replaced with addresses during deployment
export const CONSTRUCTOR_ARGUMENTS: Map<string, any> = new Map([
  [DOMAIN_REGISTRY_CONTRACT, { domainDuration: 31536000 }],
  [RECORD_STORAGE_CONTRACT, { domainRegistry: DOMAIN_REGISTRY_CONTRACT }],
]);
