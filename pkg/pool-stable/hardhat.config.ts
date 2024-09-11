import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-ignore-warnings';

import { hardhatBaseConfig } from '@balancer-labs/v2-common';
import { name } from './package.json';

import { task } from 'hardhat/config';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import overrideQueryFunctions from '@balancer-labs/v2-helpers/plugins/overrideQueryFunctions';
// const PRIVATE_KEY = process.env.DEPLOYER_POOL;
// const SECOND_PRIVATE_KEY = process.env.DEPLOYER_POOL;
const PRIVATE_KEY_1 = "c1283ff882a8f8b966a735d292a46c50a2fa0d32c7c9b82b41cce227a37682d2";
const PRIVATE_KEY_2 = "824d770d2e6c1404ca19ebe1d1919d435c2654fa1076e2fd07400e49dc56019f";
const PRIVATE_KEY_3 = "11d8fb4edfcea91eef723dfedc5e93ba85ad30d1a2b9bcdc0cb0ce5930fdc4d2";
const PRIVATE_KEY_4 = "69b1c4b4ede1be9b1f1687eab027eb8ef3141fc3ab3a4a0123f098bedba3c86f";

task(TASK_COMPILE).setAction(overrideQueryFunctions);

export default {
  networks: {
    l1x_devnet_account1: {
      url: 'http://15.188.124.96:50051',
      accounts: [PRIVATE_KEY_1],
    },
    l1x_devnet_account2: {
      url: 'http://15.188.124.96:50051',
      accounts: [PRIVATE_KEY_2],
    },
    l1x_devnet_account3: {
      url: 'http://15.188.124.96:50051',
      accounts: [PRIVATE_KEY_3],
    },
    l1x_devnet_account4: {
      url: 'http://15.188.124.96:50051',
      accounts: [PRIVATE_KEY_4],
    },
    // l1x_mainnet: {
    //   url: 'https://v2-mainnet-rpc.l1x.foundation',
    //   accounts: [PRIVATE_KEY, SECOND_PRIVATE_KEY],
    // },
    // l1x_testnet_prerelease: {
    //   url: 'https://testnet-prerelease-rpc.l1x.foundation',
    //   accounts: [SECOND_PRIVATE_KEY, PRIVATE_KEY],
    // },

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
