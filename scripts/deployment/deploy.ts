import { writeFile } from "fs/promises";
import { ethers } from "hardhat";
import hre from "hardhat";
import { Signer, Wallet, providers, Contract } from "ethers";

import { options } from "./options";

type Provider = providers.Provider;

async function main() {
  const [providerUrl, privateKey, etherscanKey] = validate();
  const provider = getProvider(providerUrl);
  const signer = getSigner(privateKey, provider);
  const contractAddresses = await deployAndVerify(signer, etherscanKey);
  await writeFile(options.outputFile, JSON.stringify(contractAddresses));
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
  signer: Signer,
  etherscanKey: string
): Promise<string[]> {
  const contractAddresses: string[] = [];
  for (let i = 0; i < options.contractNames.length; i++) {
    const contract = await deploy(
      options.contractNames[i],
      options.constructorArguments[i],
      signer
    );
    contractAddresses.push(contract.address);
    link(i, contract.address);
    await verify(options.contractNames[i], contract.address, etherscanKey);
  }
  return contractAddresses;
}

async function deploy(
  contractName: string,
  constructorArguments: string[],
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

function link(contractIndex: number, contractAddress: string) {
  for (let i = contractIndex + 1; i < options.contractNames.length; i++) {
    for (let j = 0; j < options.constructorArguments[i].length; j++) {
      if (
        options.constructorArguments[i][j] ==
        options.contractNames[contractIndex]
      ) {
        options.constructorArguments[i][j] = contractAddress;
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
