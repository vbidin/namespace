import { Contract, Signer } from "ethers";

export async function createPublicDomain(
  registry: Contract,
  caller: Signer,
  name: string
): Promise<number> {
  return createDomain(registry, caller, 0, name);
}

export async function createDomain(
  registry: Contract,
  caller: Signer,
  parentDomainId: number,
  prefix: string
): Promise<number> {
  const receipt = await (
    await registry.connect(caller).create(parentDomainId, prefix)
  ).wait();
  return receipt.events![0].args!["domainId"].toNumber();
}
