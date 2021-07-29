import { writeFile } from "fs/promises";
import get from "axios";
import { ethers } from "hardhat";
import hre from "hardhat";
import {
  Signer,
  Wallet,
  providers,
  Contract,
  ContractFactory,
  BigNumber,
} from "ethers";

import { options } from "./options";

type Block = providers.Block;
type Provider = providers.Provider;

async function main() {
  const [providerUrl, privateKey, ethGasStationUrl, etherscanKey] = validate();
  const provider: Provider = getProvider(providerUrl);
  const signer: Signer = getSigner(privateKey, provider);
  const contractAddresses: string[] = await deployAndVerify(
    signer,
    etherscanKey
  );
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
    console.log(`deploying ${options.contractNames[i]}`);
    const contract = await deploy(
      options.contractNames[i],
      options.constructorArguments[i],
      signer
    );
    console.log(`deployed ${options.contractNames[i]}`);
    contractAddresses.push(contract.address);
    link(i, contract.address);
    await verify(contract.address, etherscanKey);
  }
  return contractAddresses;
}

async function deploy(
  contractName: string,
  constructorArguments: any[],
  signer: Signer
): Promise<Contract> {
  let factory: ContractFactory = await ethers.getContractFactory(contractName);
  factory = factory.connect(signer);
  const contract: Contract = await factory.deploy(...constructorArguments);
  return await contract.deployed();
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

async function verify(contractAddress: string, etherscanKey: string) {
  // verify with Etherscan
  return;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
