// import { Input, bignumberToNumber } from './deploy';
import { ethers } from 'hardhat';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';

import fs from 'fs';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { getPoolInstance } from './tool';
export const filePath = './deploy/input.json';
async function main() {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
  console.log('JSON Data:', jsonData);

  const contract = await getPoolInstance();
  console.log(
    'init pool bytecode',
    await contract.vault.populateTransaction.joinPool(
      jsonData.TokenListByPoolIdCall.poolId, // pool id
      jsonData.initPoolCall.address,
      jsonData.initPoolCall.address,
      {
        assets: jsonData.initPoolCall.tokenInfo,
        maxAmountsIn: [
          ethers.utils.parseEther(jsonData.initPoolCall.maxAmountsIn[0]),
          ethers.utils.parseEther(jsonData.initPoolCall.maxAmountsIn[1]),
          ethers.utils.parseEther(jsonData.initPoolCall.maxAmountsIn[2]),
          ethers.utils.parseEther(jsonData.initPoolCall.maxAmountsIn[3]),
        ],
        fromInternalBalance: false,
        userData: StablePoolEncoder.joinInit(jsonData.initPoolCall.amountsIn),
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
