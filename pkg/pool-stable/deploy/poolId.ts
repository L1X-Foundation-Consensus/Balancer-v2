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
  // Contract USDC deployed to: 0x228E5173b68e37b19F2528E9472Af9F24D0f0A94
  // Contract USDT deployed to: 0xA34765F3ccaD54512Ef286F8765F99DAF76beEEA
  // Contract BUSD deployed to: 0x12C76b2f0fEC633dA8B640fD9f2CD654209139C3
  // Contract weth deployed to: 0x6e0CfF64278be367D2d9dB81Ae3b2B504edf3fCB
  // Contract authorizer deployed to: 0x98722AD74Fa4a10086211b8404c258D8AD94F039
  // Contract vault deployed to: 0x801Aa7FCF12F3D602F21D2DD18f30161Db8F65e8
  // Contract balancerQueries deployed to: 0xF9888aA65bC99F70C15D5CdB5407a9Be8446d136
  // Contract protovol fee deployed to: 0x96ad9349732DB81d610CDa4bFFE4ECCCa4c12Aab
  // Contract rate provider deployed to: 0x94c60c33c2A4E0310ba5EF4085747F282857d621
  // Contract rate provider 2 deployed to: 0x949C0ac71b7D49B1d20419119e555c89b2c980Ae
  // Contract rate provider 3 deployed to: 0x8710d4ce8fec9af5279C884faCA04B5667A38B86
  // [
  //   '0x12C76b2f0fEC633dA8B640fD9f2CD654209139C3',
  //   '0x228E5173b68e37b19F2528E9472Af9F24D0f0A94',
  //   '0xA34765F3ccaD54512Ef286F8765F99DAF76beEEA'
  // ]
  // [
  //   '0x8710d4ce8fec9af5279C884faCA04B5667A38B86',
  //   '0x949C0ac71b7D49B1d20419119e555c89b2c980Ae',
  //   '0x94c60c33c2A4E0310ba5EF4085747F282857d621'
  // ]
  // pool deployed to: 0x1251Cc6b0CFD6bD202ce2D53a9058AD3447b18d9
  // pool id 0x1251cc6b0cfd6bd202ce2d53a9058ad3447b18d9000000000000000000000000