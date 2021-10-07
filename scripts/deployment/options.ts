import hre from "hardhat";
import { Contracts } from "../enums";

// The file where addresses of deployed contracts are stored during deployment.
export const DeploymentOutputFile =
  hre.config.paths.artifacts + "/deployment.json";

// List of libraries that will be deployed and linked with contracts before they are deployed.
export const Libraries: string[] = [];

/* 
  A map that links contracts with their constructor arguments.
  All contracts are deployed in the same order as defined here.
  Constructor arguments can be references to other contracts,
  and will be replaced with deployment addresses during deployment.
*/
export const ConstructorArguments: Map<string, any> = new Map([
  [
    Contracts.DomainRegistry,
    { domainSeparator: 0x2e, domainDuration: 31536000 },
  ],
  [Contracts.RecordStorage, { domainRegistry: Contracts.DomainRegistry }],
]);
