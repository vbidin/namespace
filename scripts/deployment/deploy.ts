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
  const contractAddresses: string[] = await deployAndVerify(
    getSigner(privateKey, getProvider(providerUrl)),
    await getGasLimit(providerUrl),
    await getGasPrice(ethGasStationUrl),
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
  if (process.env.DEFI_PULSE_API_KEY == null)
    throw new Error("Defi Pulse API key is required.");
  if (process.env.ETHERSCAN_API_KEY == null)
    throw new Error("Etherscan API key is required.");

  return [
    hre.network.config.url,
    (<any>hre.config).privateKey,
    (<any>hre.config).ethGasStation.url,
    (<any>hre.config).etherscan.apiKey,
  ];
}

function getProvider(url: string): providers.Provider {
  return new providers.JsonRpcProvider(url);
}

function getSigner(privateKey: string, provider: providers.Provider): Signer {
  return new Wallet(privateKey, provider);
}

async function getGasLimit(providerUrl: string): Promise<BigNumber> {
  //provider: Provider = getProvider(providerUrl);
  //const blockNumber: number = await provider.getBlockNumber();
  //const block: Block = await provider.getBlock(blockNumber);
  return BigNumber.from(4 * 10 ** 6);
}

async function getGasPrice(ethGasStationUrl: string): Promise<BigNumber> {
  //const request = await get(ethGasStationUrl);
  //return BigNumber.from(request.data["average"])
  //  .div(10)
  //  .mul(10 ** 9);
  return BigNumber.from(2 * 10 ** 9);
}

async function deployAndVerify(
  signer: Signer,
  gasLimit: BigNumber,
  gasPrice: BigNumber,
  etherscanKey: string
): Promise<string[]> {
  const contractAddresses: string[] = [];
  for (let i = 0; i < options.contractNames.length; i++) {
    console.log(
      `deploying ${options.contractNames[i]}, gasLimit: ${gasLimit}, gasPrice: ${gasPrice}`
    );
    const contract = await deploy(
      options.contractNames[i],
      options.constructorArguments[i],
      signer,
      gasLimit,
      gasPrice
    );
    console.log(`deployed ${options.contractNames[i]}`);
    contractAddresses.push(contract.address);
    console.log("before linking:", options.constructorArguments);
    link(i, contract.address);
    console.log("after linking:", options.constructorArguments);
    await verify(contract.address, etherscanKey);
  }

  return contractAddresses;
}

async function deploy(
  contractName: string,
  constructorArguments: any[],
  signer: Signer,
  gasLimit: BigNumber,
  gasPrice: BigNumber
): Promise<Contract> {
  let factory: ContractFactory = await ethers.getContractFactory(contractName);
  factory = factory.connect(signer);
  constructorArguments.push({ gasLimit, gasPrice });
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
