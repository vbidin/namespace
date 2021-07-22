import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-docgen";
import "solidity-coverage";

export default {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: {
        count: 1,
      },
      blockGasLimit: 15000000,
      hardfork: "berlin",
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      evmVersion: "berlin",
      optimizer: {
        enabled: true,
        runs: 4294967295,
      },
    },
  },
  paths: {
    root: "..",
    sources: "src",
    tests: "test/unit",
    cache: "build/cache",
    artifacts: "build",
  },
  typechain: {
    outDir: "build/types",
    target: "ethers-v5",
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPrice: process.env.GAS_PRICE,
    noColors: true,
    onlyCalledMethods: false,
    src: "src",
  },
  docgen: {
    path: "build/docs",
    clear: true,
    runOnCompile: true,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
