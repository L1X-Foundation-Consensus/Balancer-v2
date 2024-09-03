import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-ignore-warnings';

import { hardhatBaseConfig } from '@balancer-labs/v2-common';
import { name } from './package.json';

import { task } from 'hardhat/config';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import overrideQueryFunctions from '@balancer-labs/v2-helpers/plugins/overrideQueryFunctions';
const PRIVATE_KEY = process.env.DEPLOYER_POOL;
const SECOND_PRIVATE_KEY = process.env.DEPLOYER_POOL;

task(TASK_COMPILE).setAction(overrideQueryFunctions);

export default {
  networks: {
    l1x_mainnet: {
      url: 'https://v2-mainnet-rpc.l1x.foundation',
      accounts: [PRIVATE_KEY, SECOND_PRIVATE_KEY],
    },
    l1x_testnet_prerelease: {
      url: 'https://testnet-prerelease-rpc.l1x.foundation',
      accounts: [SECOND_PRIVATE_KEY, PRIVATE_KEY],
    },

    hardhatEnv: {
      url: 'http://127.0.0.1:8545',
    },

    localhost: {
      url: 'http://127.0.0.1:50051',
    },

    hardhat: {
      allowUnlimitedContractSize: true,
    },
  },

  solidity: {
    compilers: hardhatBaseConfig.compilers,
    // version: '0.7.1',
    overrides: { ...hardhatBaseConfig.overrides(name) },
    // setting: {
    //   optimizer: {
    //     enabled: true,
    //     runs: 1,
    //   },
    // },
    evmVersion: 'byzantium',
  },
  warnings: hardhatBaseConfig.warnings,
};
