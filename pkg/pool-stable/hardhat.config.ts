import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-ignore-warnings';

import { hardhatBaseConfig } from '@balancer-labs/v2-common';
import { name } from './package.json';

import { task } from 'hardhat/config';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import overrideQueryFunctions from '@balancer-labs/v2-helpers/plugins/overrideQueryFunctions';
const PRIVATE_KEY = 'c27ef8908116761bfa9a6fe6aaa9e95518f2f00481cbd442f34ca32991a7bc2a';
const SECOND_PRIVATE_KEY = 'bfe8bba039cbd812e970735d505dd64b38f0e7f7a0d2ef5db6b4a9f7363e7509';

task(TASK_COMPILE).setAction(overrideQueryFunctions);

export default {
  networks: {
    remote: {
      // url: 'http://35.92.72.139',
      // url: 'https://v2-devnet-rpc.l1x.foundation',
      url: 'https://testnet-prerelease-rpc.l1x.foundation',
      accounts: [PRIVATE_KEY, SECOND_PRIVATE_KEY],
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
