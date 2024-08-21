import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-ignore-warnings';

import { hardhatBaseConfig } from '@balancer-labs/v2-common';
import { name } from './package.json';

import { task } from 'hardhat/config';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import overrideQueryFunctions from '@balancer-labs/v2-helpers/plugins/overrideQueryFunctions';
const PRIVATE_KEY = 'e8a0649c44208124b3735f05f3f9995fbf8b2361226f4f3cdebd366c170a8bfc';
const SECOND_PRIVATE_KEY = 'adbb3de1500555c338c22cc5d41b263eb398dc220af8936054d10f7452038a01';

task(TASK_COMPILE).setAction(overrideQueryFunctions);

export default {
  networks: {
    remote: {
      // url: 'http://35.92.72.139',
      // url: 'https://v2-devnet-rpc.l1x.foundation',
      // url: 'https://testnet-prerelease-rpc.l1x.foundation',
      url: 'https://v2-mainnet-rpc.l1x.foundation',
      accounts: [PRIVATE_KEY, SECOND_PRIVATE_KEY],
    },
    remoteAccount2: {
      // url: 'http://35.92.72.139',
      // url: 'https://v2-devnet-rpc.l1x.foundation',
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
