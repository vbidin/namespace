import { getContract } from "./utility";

async function main() {
  const domainRegistry = await getContract("DomainRegistry");
  await domainRegistry.idOf("google.com");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
