// import { Input, bignumberToNumber } from './deploy';
import { ethers } from 'hardhat';
import fs from 'fs';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { getPoolInstance } from './tool';
export const filePath = './deploy/input.json';
async function main() {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
  console.log('JSON Data:', jsonData);

  // const contract = (await getPoolInstance()).pool;

  const xx = await ethers.getContractAt('ComposableStablePool', '0x5DFC98A863E5Dcd05E7B4eEBE9b1F774D33f61D0'.toLowerCase());
  console.log('pool address :', xx.address);
  console.log('pool id bytecode', await xx.populateTransaction.getPoolId({gasLimit: 10000}));
  const poolId = await xx.getPoolId();
  console.log('ppol id :', poolId);
  console.log('pool id bytecode', await xx.populateTransaction.getPoolId({gasLimit: 10000}));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//   Deploying contracts with the account: 0x7B7AB20f75B691E90c546e89E41aA23b0A821444
// 1000000000
// Contract USDC deployed to: 0x97E60C286703fd5172d223992bE95125F2D07e24
// Contract USDT deployed to: 0x11297a86aBCB44B5f992747102f455eD0d760C17
// Contract BUSD deployed to: 0x81AFB5Cb78Feadf9eC66915a1b12A009CC50f288
// Contract weth deployed to: 0xbAF09caF39Ee44D540ddEF60c8E1fddAF02871B8
// Contract authorizer deployed to: 0x22C488A8211165a4bd00933506302748B08E65E5
// Contract vault deployed to: 0x1EbE1CdE0D6E05635cEFe244439d12973b7f04c0
// Contract balancerQueries deployed to: 0x8800D0FA57A066e9e4AADDe8d48713eD1493b906
// Contract protovol fee deployed to: 0xaA056EEc89354A73aaE11Cb5c9085C63A5cE0565
// Contract rate provider deployed to: 0x5A407A7aB183Dea6741929E370EdDce2473BF31a
// Contract rate provider 2 deployed to: 0xEe7584C06b798a83f8cD5B2f6420De8567ff0431
// Contract rate provider 3 deployed to: 0xb6c68867d8ABaE0ba82eA1b75FD4AF84C2816a4a
// Contract composableStablePoolFactory deployed to: 0x1EF6e77FFF1251dAcBfb5ae2DA5882c7bd5C6B4e
// [
//   '0x11297a86aBCB44B5f992747102f455eD0d760C17',
//   '0x81AFB5Cb78Feadf9eC66915a1b12A009CC50f288',
//   '0x97E60C286703fd5172d223992bE95125F2D07e24'
// ]
// [
//   '0x5A407A7aB183Dea6741929E370EdDce2473BF31a' rate USDT,
//   '0xEe7584C06b798a83f8cD5B2f6420De8567ff0431' rate BUSD,
//   '0xb6c68867d8ABaE0ba82eA1b75FD4AF84C2816a4a' rate USDC
// ]
// pool deployed to: 0x492A783A6cca860397f579e43319ea1032E92405
