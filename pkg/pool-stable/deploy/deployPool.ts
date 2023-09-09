import { SwapKind, WeightedPoolEncoder } from '@balancer-labs/balancer-js';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';
import { MAX_UINT256 } from '@balancer-labs/v2-helpers/src/constants';
import { BigNumber, BigNumberish, fp } from '@balancer-labs/v2-helpers/src/numbers';
import { Input, toBytes32 } from './deploy';
import { ethers } from 'hardhat';
import fs from 'fs';

async function main() {
  const ContractFactory = await ethers.getContractFactory('ComposableStablePool');
  const filePath = './deploy/input.json';
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData: Input = JSON.parse(data);
    console.log(jsonData);
    const encodedParams5 = ContractFactory.interface.encodeDeploy([
      // for deploying new stable pool directly
      {
        vault: jsonData.vault,
        protocolFeeProvider: jsonData.protocol,
        name: 'wETHUSDC-wETHUSDT',
        symbol: 'wETHUSDC-wETHUSDT',
        tokens: [jsonData.erc20, jsonData.erc201].sort(),
        rateProviders: [
          jsonData.rateProvider,
          jsonData.rateProvider1, // change
        ].sort(),
        tokenRateCacheDurations: [0, 0],
        exemptFromYieldProtocolFeeFlags: [false, false],
        amplificationParameter: BigInt('1'),
        swapFeePercentage: fp(0.1),
        pauseWindowDuration: 0,
        bufferPeriodDuration: 0,
        owner: jsonData.owner,
        version: '1.0.0',
      },
    ]);

    fs.writeFileSync(
      './creationCode/creationCodePool.txt',
      ContractFactory.bytecode.substring(2) + encodedParams5.slice(2)
    );
  } catch (err) {
    console.error('Error reading or writing file:', err);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
