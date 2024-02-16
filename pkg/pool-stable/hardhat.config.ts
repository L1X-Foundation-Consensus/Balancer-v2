import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-ignore-warnings';

import { hardhatBaseConfig } from '@balancer-labs/v2-common';
import { name } from './package.json';

import { task } from 'hardhat/config';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import overrideQueryFunctions from '@balancer-labs/v2-helpers/plugins/overrideQueryFunctions';
const PRIVATE_KEY = 'f6b82b53ecbe1978b8651f740739b1d181f0285381e65e5e3491d8e821ab9bd0';
const SECOND_PRIVATE_KEY = 'bf7b645cad4c527189fe9bf59a8db74f28dd6f927637b19e4fe0fe60b1afc72f';

task(TASK_COMPILE).setAction(overrideQueryFunctions);

export default {
  networks: {
    remote: {
      // url: 'http://127.0.0.1:8545',
      // url: 'http://54.214.8.200:50051',
      //url: 'https://v2-mainnet-rpc.l1x.foundation',
      url: 'http://54.251.122.134:50051',
      // gas: 30000000,
      // accounts: [PRIVATE_KEY, SECOND_PRIVATE_KEY],
    },

    hardhatEnv: {
      url: 'http://127.0.0.1:8545',
    },

    localhost: {
      url: 'http://0.0.0.0:50051',
      // accounts: [PRIVATE_KEY, SECOND_PRIVATE_KEY],
    },

    hardhat: {
      // blockGasLimit: 100000000429720, // whatever you want here
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
  },
  warnings: hardhatBaseConfig.warnings,
};
