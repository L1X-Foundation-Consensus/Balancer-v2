// import { Input, bignumberToNumber } from './deploy';
import { ethers } from 'hardhat';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';

import fs from 'fs';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { getPoolInstance } from './tool';
import { Input } from './deploy';
import { MAX_UINT256 } from '@balancer-labs/v2-helpers/src/constants';
import { log } from 'console';
import { SwapKind } from '@balancer-labs/balancer-js';
export const filePath = './deploy/input.json';
async function main() {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData: Input = JSON.parse(data);
  console.log('JSON Data:', jsonData);

  const initVaule = [];

  for (let i = 0; i < jsonData.joinPoolCall.amountsIn.length; i++) {
    initVaule.push(ethers.utils.parseEther('0.001'));
  }

  const contract = await getPoolInstance();
  console.log(
    'join pool bytecode',
    await contract.vault.populateTransaction.joinPool(
      jsonData.TokenListByPoolIdCall.poolId, // pool id
      jsonData.joinPoolCall.address,
      jsonData.joinPoolCall.address,
      {
        assets: jsonData.joinPoolCall.tokenInfo.sort(),
        maxAmountsIn: [MAX_UINT256, MAX_UINT256, MAX_UINT256, MAX_UINT256],
        fromInternalBalance: false,
        userData: StablePoolEncoder.joinExactTokensInForBPTOut(
          [ethers.utils.parseEther('1000'), ethers.utils.parseEther('1000'), ethers.utils.parseEther('1000')],
          0
        ),
      }
    )
  );

  console.log(
    'swap bytecode',
    await contract.vault.populateTransaction.swap(
      {
        kind: SwapKind.GivenIn,
        poolId: jsonData.TokenListByPoolIdCall.poolId, // pool id
        assetIn: jsonData.erc20,
        assetOut: jsonData.erc201,
        amount: ethers.utils.parseUnits('10', 18),

        userData: '0x',
      },
      {
        sender: jsonData.joinPoolCall.address,
        recipient: jsonData.joinPoolCall.address,
        fromInternalBalance: false,
        toInternalBalance: false,
      },
      0,
      MAX_UINT256
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
