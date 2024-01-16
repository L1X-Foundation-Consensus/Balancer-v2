import { FundManagement, SwapKind, WeightedPoolEncoder } from '@balancer-labs/balancer-js';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';
import { MAX_UINT256, ZERO_ADDRESS } from '@balancer-labs/v2-helpers/src/constants';
import { BigNumber, BigNumberish, fp } from '@balancer-labs/v2-helpers/src/numbers';
const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  const charlie = signers[2];
  console.log('Deploying contracts with the account:', deployer.address);

  const revertFactory1 = await ethers.getContractFactory('Revert1');

  const revert1 = await revertFactory1.deploy(100, 88, {
    gasLimit: 30000000,
  });
  console.log('revert1.address', revert1.address);
  const revertFactory = await ethers.getContractFactory('Revert');

  const revert = await revertFactory.deploy(100, 88, revert1.address, {
    gasLimit: 30000000,
  });
  console.log('revert.address', revert.address);
  const res = await revert.setNumber(1, 1, 1, 100);
  console.log('res', await revert.myNumber(), await revert.myNumber1());
  console.log('res', await revert1.myNumber(), await revert1.myNumber1());
// const revert = await ethers.getContractAt('Revert', '0xD0141E899a65C95a556fE2B27e5982A6DE7fDD7A'.toLowerCase());
// const revert1 = await ethers.getContractAt('Revert1', '0x07882Ae1ecB7429a84f1D53048d35c4bB2056877'.toLowerCase());
//   console.log('res', await revert.myNumber(), await revert.myNumber1());

//   console.log('res', await revert1.myNumber(), await revert1.myNumber1());


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
