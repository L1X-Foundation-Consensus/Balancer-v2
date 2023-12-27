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
  // Deploying contracts with the account: 0x75104938bAa47c54a86004eF998CC76C2e616289
  // 1000000000
  // Contract USDC deployed to: 0x21F93099BA2407e6534bF6B07802Fbe1E5A878A6
  // Contract USDT deployed to: 0xAe8Bf6634E4155D4B5beFFBE36D0258Bc0f0c65d
  // Contract BUSD deployed to: 0x8A19130BF73EA4F5C8591491C0a1e623eECeBA11
  // Contract weth deployed to: 0x0936eF494971FE035300d4af6e6b38EC1FC4c934
  // Contract authorizer deployed to: 0x1033D1e790A979a3FcC490b1F3d97D1d7d8Ae589
  // Contract vault deployed to: 0x1e1ec9cd126a6d4941e9dc7D3761f2279EeFb309
  // Contract balancerQueries deployed to: 0xDAd97E32Bc23e18b92B05889B6eD44Bd39E340B1
  // Contract protovol fee deployed to: 0xadE41Ac529EA5c71462E8f2fa821cA6788E2C143
  // Contract rate provider deployed to: 0xf1cF1e66B16D9f91b361fEB038B1B16902E10021
  // Contract rate provider 2 deployed to: 0xd4186c8f9d7B81C241B1b777Fbf687366c971768
  // Contract rate provider 3 deployed to: 0xC6329A5d7d3F9a827083789734cb3207a8eFbffb
  // [
  //   '0x21F93099BA2407e6534bF6B07802Fbe1E5A878A6', USDC
  //   '0x8A19130BF73EA4F5C8591491C0a1e623eECeBA11', BUSD
  //   '0xAe8Bf6634E4155D4B5beFFBE36D0258Bc0f0c65d' USDT
  // ]
  // [
  //   '0xC6329A5d7d3F9a827083789734cb3207a8eFbffb', rate provider  for USDC
  //   '0xd4186c8f9d7B81C241B1b777Fbf687366c971768', rate provider  for BUSD
  //   '0xf1cF1e66B16D9f91b361fEB038B1B16902E10021' rate provider  for USDT
  // ]
  // pool deployed to: 0xe7F300B560442167ed5b8210A5cabdaA0db32C10

  // pool id 38fff2d0
