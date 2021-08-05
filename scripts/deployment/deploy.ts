import hre from "hardhat";
import { writeFile } from "fs/promises";
import { ethers } from "hardhat";
import { Signer, Wallet, providers, Contract } from "ethers";
import { CONSTRUCTOR_ARGUMENTS, DEPLOYMENT_OUTPUT } from "./options";

async function main() {
  validate();
  const provider = getProvider((<any>hre.network.config).url);
  const signer = getSigner((<any>hre.config).privateKey, provider);
  const contractAddresses = await deployAndVerify(
    CONSTRUCTOR_ARGUMENTS,
    signer
  );
  await writeFile(
    DEPLOYMENT_OUTPUT,
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

async function deployAndVerify(
  contracts: Map<string, any[]>,
  signer: Signer
): Promise<Map<string, string>> {
  const contractAddresses = new Map<string, string>();
  for (const contractName of contracts.keys()) {
    const contract = await deploy(
      contractName,
      contracts.get(contractName)!,
      signer
    );
    contractAddresses.set(contractName, contract.address);
    updateConstructorArguments(contracts, contractName, contract.address);
    await verify(contract.address, contracts.get(contractName)!);
  }
  return contractAddresses;
}

async function deploy(
  contractName: string,
  constructorArguments: any[],
  signer: Signer
): Promise<Contract> {
  let factory = await ethers.getContractFactory(contractName);
  factory = factory.connect(signer);
  const contract = await factory.deploy(...constructorArguments);
  console.log(`deploying ${contractName}...`);
  console.log(`transaction hash: ${contract.deployTransaction.hash}`);
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
    for (let i = 0; i < constructorArguments.length; i++) {
      if (constructorArguments[i] == deployedContractName) {
        constructorArguments[i] = deployedContractAddress;
        console.log(`updated constructor arguments of ${contractName}`);
      }
    }
  }
}

async function verify(contractAddress: string, constructorArguments: any[]) {
  // TODO
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
