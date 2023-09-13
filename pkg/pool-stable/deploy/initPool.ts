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

  const poolParams = {
    vault: jsonData.vault,
    protocolFeeProvider: jsonData.protocol,
    name: 'My Stable Pool',
    symbol: 'MSP',
    tokens: [jsonData.erc20, jsonData.erc201].sort(),
    rateProviders: [jsonData.rateProvider, jsonData.rateProvider1].sort(),
    tokenRateCacheDurations: [0, 0],
    exemptFromYieldProtocolFeeFlags: [false, false],
    amplificationParameter: BigInt('1'),
    swapFeePercentage: fp(0.1),
    pauseWindowDuration: 0,
    bufferPeriodDuration: 0,
    owner: jsonData.owner,
    version: '1.0.0',
  };

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
