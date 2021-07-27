import hre from "hardhat";

import { ethers } from "hardhat";
import { Signer, Wallet, providers, Contract, ContractFactory } from "ethers";

type Provider = providers.Provider;

async function main() {
  const [providerUrl, privateKey, etherscanKey] = validate(process.env);
  const provider: Provider = getProvider(providerUrl);
  const signer: Signer = getSigner(privateKey, provider);
  const gasLimit: number = getBlockSize();
  const gasPrice: number = getGasPrice();
  const contractNames: string[] = getContractNames();

  for (const contractName of contractNames) {
    const constructorArguments = getConstructorArguments(contractName);
    const contract = await deploy(
      contractName,
      constructorArguments,
      signer,
      gasLimit,
      gasPrice
    );
    //await verify(contractName, etherscanKey);
  }
}

function validate(env: any): string[] {
  if (!("url" in hre.network.config))
    throw new Error("Hardhat network is not allowed.");
  if (env.INFURA_PROJECT_ID == null)
    throw new Error("Infura Project ID is required.");
  if (env.ETHEREUM_PRIVATE_KEY == null)
    throw new Error("Ethereum private key is required.");
  if (env.ETHERSCAN_API_KEY == null)
    throw new Error("Etherscan API key is required.");

  return [
    hre.network.config.url,
    env.ETHEREUM_PRIVATE_KEY!,
    env.ETHERSCAN_API_KEY!,
  ];
}

function getProvider(url: string): providers.Provider {
  return new providers.JsonRpcProvider(url);
}

function getSigner(privateKey: string, provider: providers.Provider): Signer {
  return new Wallet(privateKey, provider);
}

function getBlockSize(): number {
  return 10;
}

function getGasPrice(): number {
  return 10;
}

function getContractNames(): string[] {
  return ["DomainRegistry"];
}

function getConstructorArguments(name: string): any[] {
  return [];
}

async function deploy(
  contractName: string,
  constructorArguments: any[],
  signer: Signer,
  gasLimit: number,
  gasPrice: number
) {
  let factory: ContractFactory = await ethers.getContractFactory(contractName);
  factory = factory.connect(signer);
  constructorArguments.push({ gasLimit, gasPrice });
  const contract: Contract = await factory.deploy(...constructorArguments);
  return await contract.deployed();
}

async function verify(name: string, etherscanKey: string) {
  return;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
