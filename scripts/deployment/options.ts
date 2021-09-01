import hre from "hardhat";
import { Contracts } from "../enums/contracts";

// The file where contract addresses are stored during deployment.
export const DeploymentOutputFile =
  hre.config.paths.artifacts + "/deployment.json";

/* 
  A map that links contracts with their constructor arguments.
  All contracts are deployed in the same order as defined here.
  Constructor arguments can be references to other contracts,
  and will be replaced with actual contract addresses during deployment.
*/
export const ConstructorArguments: Map<string, any> = new Map([
  [Contracts.DomainRegistry, { domainDuration: 31536000 }],
  [Contracts.RecordStorage, { domainRegistry: Contracts.DomainRegistry }],
]);
