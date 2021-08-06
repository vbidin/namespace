import { getContract } from "./utility";
import { DOMAIN_REGISTRY_CONTRACT } from "../constants";

async function main() {
  const options = { gasLimit: 1000000 };
  const domainRegistry = await getContract(DOMAIN_REGISTRY_CONTRACT);

  await (await domainRegistry.create(0, "org", options)).wait();
  await (await domainRegistry.create(1, "ethereum", options)).wait();

  const domainId = await domainRegistry.idOf("ethereum.org");
  const owner = await domainRegistry.ownerOf(domainId);
  const balance = await domainRegistry.balanceOf(owner);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
