// import { Input, bignumberToNumber } from './deploy';
import { ethers } from 'hardhat';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';

import fs from 'fs';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { getPoolInstance } from './tool';
import { FundManagement, SwapKind } from './../../balancer-js/src';
import { MAX_UINT256, ZERO_ADDRESS } from '@balancer-labs/v2-helpers/src/constants';
import { zeroPad } from 'ethers/lib/utils';
export const filePath = './deploy/input.json';
async function main() {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
  // console.log('JSON Data:', jsonData);
  const contract = await getPoolInstance();

  let funds: FundManagement;
  funds = {
    sender: jsonData.vault,
    recipient: ZERO_ADDRESS,
    fromInternalBalance: false,
    toInternalBalance: false,
  };

  const amount = fp(1000);

  console.log(
    'join query bytecode',
    await contract.query.populateTransaction.queryJoin(
      jsonData.TokenListByPoolIdCall.poolId,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      {
        assets: jsonData.joinPoolCall.tokenInfo,
        maxAmountsIn: [MAX_UINT256, MAX_UINT256, MAX_UINT256, MAX_UINT256],
        fromInternalBalance: false,
        userData: StablePoolEncoder.joinExactTokensInForBPTOut([0, ethers.utils.parseEther('1000'), 0], 0),
      }
    )
  );

  console.log(
    'swap query bytecode',

    await contract.query.populateTransaction.querySwap(
      {
        poolId: jsonData.TokenListByPoolIdCall.poolId,
        kind: SwapKind.GivenIn,
        assetIn: jsonData.erc20,
        assetOut: jsonData.erc201,
        amount,
        userData: '0x',
      },
      funds
    )
  );

  console.log(
    'exit query bytecode',

    await contract.query.populateTransaction.queryExit(
      jsonData.TokenListByPoolIdCall.poolId,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      {
        assets: jsonData.joinPoolCall.tokenInfo,
        minAmountsOut: [ethers.utils.parseEther('0'), ethers.utils.parseEther('0'), ethers.utils.parseEther('0')],
        userData: StablePoolEncoder.exitExactBptInForTokensOut(ethers.utils.parseEther('100')),
        toInternalBalance: false,
      }
    )
  );

  console.log('status', await contract.vault.populateTransaction.getPausedState());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
