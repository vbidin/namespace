export default {
  networks: {
    hardhat: {
      accounts: {
        count: 1
      },
      blockGasLimit: 15000000,
      hardfork: "berlin"
    }
  },
  solidity: {
    version: '0.8.6',
    settings: {
      evmVersion: 'berlin',
      optimizer: {
        enabled: true,
        runs: 4294967295,
      }
    }
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./build"
  }
}
