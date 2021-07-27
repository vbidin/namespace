import hre from "hardhat";

import { ethers } from "hardhat";
import { Signer, Wallet, providers, Contract, ContractFactory, BigNumber } from "ethers";

type Block = providers.Block;
type Provider = providers.Provider;

async function main() {
  const [providerUrl, privateKey, etherscanKey] = validate(process.env);

  const provider: Provider = getProvider(providerUrl);
  const signer: Signer = getSigner(privateKey, provider);
  const gasLimit: BigNumber = await getGasLimit(provider);
  const gasPrice: BigNumber = await getGasPrice();

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
    console.log(`${contractName}: ${contract.address}`);
  }
}

function validate(env: any): string[] {
  if (!("url" in hre.network.config))
    throw new Error("Hardhat network is not allowed.");
  if (env.INFURA_PROJECT_ID == null)
    throw new Error("Infura Project ID is required.");
  if (env.ETHEREUM_PRIVATE_KEY == null)
    throw new Error("Ethereum private key is required.");
  if (env.DEFI_PULSE_API_KEY == null)
    throw new Error("Defi Pulse API key is required.")
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

async function getGasLimit(provider: Provider): Promise<BigNumber> {
  const blockNumber: number = await provider.getBlockNumber();
  const block: Block = await provider.getBlock(blockNumber);
  return block.gasLimit.sub(block.gasLimit.mod(10**6));
}

async function getGasPrice(): Promise<BigNumber> {
  // add dynamic checks for gas price here (ethgasstation?)
  return BigNumber.from(10 * 10**9);
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
  gasLimit: BigNumber,
  gasPrice: BigNumber
): Promise<Contract> {
  let factory: ContractFactory = await ethers.getContractFactory(contractName);
  factory = factory.connect(signer);
  constructorArguments.push({ gasLimit, gasPrice });
  const contract: Contract = await factory.deploy(...constructorArguments);
  return await contract.deployed();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
