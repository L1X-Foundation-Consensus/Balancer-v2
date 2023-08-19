import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-ignore-warnings';

import { hardhatBaseConfig } from '@balancer-labs/v2-common';
import { name } from './package.json';

import { task } from 'hardhat/config';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import overrideQueryFunctions from '@balancer-labs/v2-helpers/plugins/overrideQueryFunctions';

task(TASK_COMPILE).setAction(overrideQueryFunctions);

export default {
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    hardhat: {
      blockGasLimit: 100000000429720, // whatever you want here
    },
  },
  allowUnlimitedContractSize: true,
  solidity: {
    compilers: hardhatBaseConfig.compilers,
    // version: '0.7.1',
    overrides: { ...hardhatBaseConfig.overrides(name) },
    // setting: {
    //   optimizer: {
    //     enabled: true,
    //     runs: 20,
    //   },
    // },
  },
  warnings: hardhatBaseConfig.warnings,
};
