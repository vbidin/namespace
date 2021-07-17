import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'hardhat-docgen';
import 'hardhat-contract-sizer';
import 'hardhat-spdx-license-identifier';
import 'solidity-coverage';

export default {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts: {
        count: 1,
      },
      blockGasLimit: 15000000,
      hardfork: 'berlin',
    },
  },
  solidity: {
    version: '0.8.4',
    settings: {
      evmVersion: 'berlin',
      optimizer: {
        enabled: true,
        runs: 4294967295,
      },
    },
  },
  paths: {
    sources: './src',
    tests: './test/unit',
    cache: './cache',
    artifacts: './build',
  },
  typechain: {
    outDir: './build/types',
    target: 'ethers-v5',
  },
  spdxLicenseIdentifier: {
    overwrite: false,
    runOnCompile: false,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPrice: 50,
    outputFile: './build/gas.txt',
    noColors: true,
    onlyCalledMethods: false,
    src: './src',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
  docgen: {
    path: './build/docs',
    clear: true,
    runOnCompile: false,
  },
};
