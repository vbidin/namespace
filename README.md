# Namespace - Smart Contracts

[![ci](https://github.com/vbidin/namespace-contracts/actions/workflows/ci.yml/badge.svg)](https://github.com/vbidin/namespace-contracts/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@namespace-domains/contracts/latest.svg)](https://www.npmjs.com/package/@namespace-domains/contracts/v/latest)

This repository contains the smart contracts that are used to create and manage Namespace domains and their associated records.

## Install

Install [Node](https://nodejs.org/en/) and then run the following commands:

```
yarn install
```

Install [Python](https://www.python.org/) and then run the following commands:

```
pip install -r configurations/requirements.txt
```

## Usage

Format and run all linters:

```
yarn lint
```

Compile solidity contracts:

```
yarn build
```

Run unit tests:

```
yarn test:unit
```

In order to deploy the contracts and run integration tests you will need to setup the following environment variables:

- INFURA_PROJECT_ID: Register an [Infura](https://infura.io/) account and create a new project.
- ETHEREUM_PRIVATE_KEY: Private key of a wallet with sufficient funds to cover any transaction fees.
- ETHERSCAN_API_KEY: Register an [Etherscan](https://etherscan.io/) account and create a new API KEY.

Deploy contracts:

```
yarn deploy --network <name>
```

Run integration tests:

```
yarn test:integration --network <name>
```

## Security

WIP

## Documentation

WIP
