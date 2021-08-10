import hre from "hardhat";
import { Contracts } from "../enums/contracts";

// location where addresses of all deployed contracts will be stored
export const DeploymentOutputFile =
  hre.config.paths.artifacts + "/deployment.json";

// contract names and their constructor arguments
// contracts will be deployed in insertion order
// references to other contracts will be replaced with deployment addresses
export const ConstructorArguments: Map<string, any> = new Map([
  [Contracts.DomainRegistry, { domainDuration: 31536000 }],
  [Contracts.RecordStorage, { domainRegistry: Contracts.DomainRegistry }],
]);
