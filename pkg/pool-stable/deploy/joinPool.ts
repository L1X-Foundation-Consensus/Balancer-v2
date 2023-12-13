// import { Input, bignumberToNumber } from './deploy';
import { ethers } from 'hardhat';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';

import fs from 'fs';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { getPoolInstance } from './tool';
import { Input } from './deploy';
export const filePath = './deploy/input.json';
async function main() {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData: Input = JSON.parse(data);
  console.log('JSON Data:', jsonData);

  const initVaule = [];

  for (let i = 0; i < jsonData.joinPoolCall.amountsIn.length; i++) {
    initVaule.push(ethers.utils.parseEther(jsonData.joinPoolCall.amountsIn[i]));
  }

  const contract = await getPoolInstance();
  console.log(
    'join pool bytecode',
    await contract.vault.populateTransaction.joinPool(
      jsonData.TokenListByPoolIdCall.poolId, // pool id
      jsonData.joinPoolCall.address,
      jsonData.joinPoolCall.address,
      {
        assets: jsonData.joinPoolCall.tokenInfo,
        maxAmountsIn: jsonData.joinPoolCall.maxAmountsIn,
        fromInternalBalance: false,
        userData: StablePoolEncoder.joinExactTokensInForBPTOut(initVaule, 0),
      }
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
