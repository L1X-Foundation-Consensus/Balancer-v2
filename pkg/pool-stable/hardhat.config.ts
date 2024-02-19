import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-ignore-warnings';

import { hardhatBaseConfig } from '@balancer-labs/v2-common';
import { name } from './package.json';

import { task } from 'hardhat/config';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import overrideQueryFunctions from '@balancer-labs/v2-helpers/plugins/overrideQueryFunctions';
const PRIVATE_KEY = '6913aeae91daf21a8381b1af75272fe6fae8ec4a21110674815c8f0691e32758';
const SECOND_PRIVATE_KEY = 'f6b82b53ecbe1978b8651f740739b1d181f0285381e65e5e3491d8e821ab9bd0';

task(TASK_COMPILE).setAction(overrideQueryFunctions);

export default {
  networks: {
    remote: {
      url: 'http://54.251.122.134:50051',
      // accounts: [PRIVATE_KEY, SECOND_PRIVATE_KEY],
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
