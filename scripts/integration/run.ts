import { getContract } from "./utility";
import { Contracts } from "../enums";

async function main() {
  const options = { gasLimit: 1000000 };
  const domainRegistry = await getContract(Contracts.DomainRegistry);

  await (await domainRegistry.create(0, "org", options)).wait();
  await (await domainRegistry.create(1, "ethereum", options)).wait();

  const domainId = await domainRegistry.idOf("ethereum.org");
  const owner = await domainRegistry.ownerOf(domainId);
  await domainRegistry.balanceOf(owner);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
