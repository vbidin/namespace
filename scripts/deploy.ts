import hre from "hardhat";

async function main() {
  validate();
}

function validate() {
  if (!("url" in hre.network.config))
    throw new Error("Hardhat network is not allowed.");
  if (process.env.INFURA_PROJECT_ID == null)
    throw new Error("Infura Project ID is required.");
  if (process.env.ETHERSCAN_API_KEY == null)
    throw new Error("Etherscan API key is required.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
