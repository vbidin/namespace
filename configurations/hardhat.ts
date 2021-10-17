import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-docgen";
import "solidity-coverage";

export default {
  privateKey: process.env.ETHEREUM_PRIVATE_KEY,
  networks: {
    hardhat: {
      accounts: {
        count: 10,
      },
      hardfork: "london",
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    },
  },
  solidity: {
    version: "0.8.9",
    settings: {
      evmVersion: "london",
      optimizer: {
        enabled: true,
        runs: 4294967295,
      },
    },
  },
  paths: {
    root: "..",
    sources: "contracts",
    tests: "tests",
    artifacts: "artifacts",
    cache: "artifacts/cache",
  },
  typechain: {
    outDir: "artifacts/types",
    target: "ethers-v5",
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPrice: process.env.GAS_PRICE,
    noColors: true,
    onlyCalledMethods: false,
    src: "contracts",
  },
  docgen: {
    path: "artifacts/docs",
    clear: true,
    runOnCompile: false,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
