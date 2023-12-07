// import { Input, bignumberToNumber } from './deploy';
import { ethers } from 'hardhat';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';

import fs from 'fs';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { getPoolInstance } from './tool';
import { FundManagement, SwapKind } from '@balancer-labs/balancer-js';
import { ZERO_ADDRESS } from '@balancer-labs/v2-helpers/src/constants';
export const filePath = './deploy/input.json';
async function main() {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
  console.log('JSON Data:', jsonData);
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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
