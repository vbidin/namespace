import hre from "hardhat";
import { ethers } from "hardhat";
import { readFile } from "fs/promises";
import { providers, Signer, Wallet, Contract } from "ethers";
import { DEPLOYMENT_OUTPUT } from "../deployment/options";

export async function getContract(contractName: string): Promise<Contract> {
  const contractAddress = await getContractAddress(contractName);
  const contractInterface = await getContractInterface(contractName);
  const signer = getSigner();
  return new Contract(contractAddress, contractInterface, signer);
}

async function getContractAddress(contractName: string) {
  const json = await readFile(DEPLOYMENT_OUTPUT, "utf-8");
  const map = new Map<string, string>(Object.entries(JSON.parse(json)));
  return map.get(contractName)!;
}

async function getContractInterface(contractName: string) {
  const factory = await ethers.getContractFactory(contractName);
  return factory.interface;
}

function getSigner(): Signer {
  const provider = getProvider((<any>hre.network.config).url);
  return new Wallet(process.env.ETHEREUM_PRIVATE_KEY!, provider);
}

function getProvider(url: string): providers.Provider {
  return new providers.JsonRpcProvider(url);
}
