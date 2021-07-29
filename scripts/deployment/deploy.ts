import hre from "hardhat";

import { writeFile } from "fs/promises";
import { ethers } from "hardhat";
import { Signer, Wallet, providers, Contract } from "ethers";

import { CONTRACTS, DEPLOYMENT_FILE } from "./options";

async function main() {
  const [providerUrl, privateKey, etherscanKey] = validate();
  const provider = getProvider(providerUrl);
  const signer = getSigner(privateKey, provider);
  const contractAddresses = await deployAndVerify(
    CONTRACTS,
    signer,
    etherscanKey
  );
  await writeFile(
    DEPLOYMENT_FILE,
    JSON.stringify(Object.fromEntries(contractAddresses.entries()))
  );
}

function validate(): string[] {
  if (!("url" in hre.network.config))
    throw new Error("Hardhat network is not allowed.");

  if (process.env.INFURA_PROJECT_ID == null)
    throw new Error("Infura Project ID is required.");
  if (process.env.ETHEREUM_PRIVATE_KEY == null)
    throw new Error("Ethereum private key is required.");
  if (process.env.ETHERSCAN_API_KEY == null)
    throw new Error("Etherscan API key is required.");

  return [
    hre.network.config.url,
    (<any>hre.config).privateKey,
    (<any>hre.config).etherscan.apiKey,
  ];
}

function getProvider(url: string): providers.Provider {
  return new providers.JsonRpcProvider(url);
}

function getSigner(privateKey: string, provider: providers.Provider): Signer {
  return new Wallet(privateKey, provider);
}

async function deployAndVerify(
  contracts: Map<string, any[]>,
  signer: Signer,
  etherscanKey: string
): Promise<Map<string, string>> {
  const contractAddresses = new Map<string, string>();
  for (const contractName of contracts.keys()) {
    const contract = await deploy(
      contractName,
      contracts.get(contractName)!,
      signer
    );
    contractAddresses.set(contractName, contract.address);
    link(contracts, contractName, contract.address);
    await verify(contractName, contract.address, etherscanKey);
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

function link(
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

async function verify(
  contractName: string,
  contractAddress: string,
  etherscanKey: string
) {
  // verify with Etherscan
  return;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
