import hre from "hardhat";
import { writeFile } from "fs/promises";
import { ethers } from "hardhat";
import { Signer, Wallet, providers, Contract } from "ethers";
import { DeploymentOutputFile, ConstructorArguments } from "./options";

async function main() {
  validate();
  const provider = getProvider((<any>hre.network.config).url);
  const signer = getSigner((<any>hre.config).privateKey, provider);
  const contractAddresses = await deployAndVerifyContracts(
    ConstructorArguments,
    signer
  );
  await writeFile(
    DeploymentOutputFile,
    JSON.stringify(Object.fromEntries(contractAddresses.entries()))
  );
}

function validate() {
  if (!("url" in hre.network.config))
    throw new Error("Hardhat network is not allowed.");
  if (process.env.INFURA_PROJECT_ID == null)
    throw new Error("Infura Project ID is required.");
  if (process.env.ETHEREUM_PRIVATE_KEY == null)
    throw new Error("Ethereum private key is required.");
  if (process.env.ETHERSCAN_API_KEY == null)
    throw new Error("Etherscan API key is required.");
}

function getProvider(url: string): providers.Provider {
  return new providers.JsonRpcProvider(url);
}

function getSigner(privateKey: string, provider: providers.Provider): Signer {
  return new Wallet(privateKey, provider);
}

async function deployAndVerifyContracts(
  contracts: Map<string, any>,
  signer: Signer
): Promise<Map<string, string>> {
  const contractAddresses = new Map<string, string>();
  for (const contractName of contracts.keys()) {
    const contract = await deployContract(
      contractName,
      contracts.get(contractName)!,
      signer
    );
    contractAddresses.set(contractName, contract.address);
    updateConstructorArguments(contracts, contractName, contract.address);
    await verifyContract();
  }
  return contractAddresses;
}

async function deployContract(
  contractName: string,
  constructorArguments: any[],
  signer: Signer
): Promise<Contract> {
  let factory = await ethers.getContractFactory(contractName);
  factory = factory.connect(signer);
  const contract = await factory.deploy(constructorArguments);
  console.log(`--- ${contractName} ---`);
  console.log(`constructor arguments: ${JSON.stringify(constructorArguments)}`);
  console.log(`transaction hash: ${contract.deployTransaction.hash}`);
  console.log("waiting...");
  await contract.deployed();
  console.log(`deployed on address: ${contract.address}`);
  return contract;
}

function updateConstructorArguments(
  contracts: Map<string, any[]>,
  deployedContractName: string,
  deployedContractAddress: string
) {
  for (const contractName of contracts.keys()) {
    const constructorArguments = contracts.get(contractName)!;
    for (const argument in constructorArguments) {
      let updated = false;
      if (constructorArguments[argument] == deployedContractName) {
        constructorArguments[argument] = deployedContractAddress;
        updated = true;
      }
      if (updated) {
        console.log(`updated constructor arguments of ${contractName}`);
      }
    }
  }
}

async function verifyContract() {
  console.log("skipping contract verification");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
