const { ethers } = require('hardhat');
import abi from '../../artifacts/contracts/RateProvider.sol/RateProvider.json';

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const tokenPrice = 0.03;
  console.log('Deploying contracts with the account:', deployer.address);


    const erc20RateProviderFactory = await ethers.getContractFactory('RateProvider');
    const tokenRateProviderContract = await erc20RateProviderFactory.deploy();
    await tokenRateProviderContract.deployed();
    // console.log(`Rate provider deployed to:`, tokenRateProviderContract.address);
    console.log(`Rate provider deployed to:`, tokenRateProviderContract.address, `, Owner: `, await tokenRateProviderContract.owner());
    const l1xRateUpdated = await tokenRateProviderContract.updateRate(ethers.utils.parseEther(tokenPrice+""))
    await l1xRateUpdated.wait();
    await Promise.all([(resolve: any) => setTimeout((resolve) => {}, 3000)])
    console.log(`Price: `, tokenPrice, ` - `, (await tokenRateProviderContract.getRate())?.toString());
    console.log(`-----------------------------------------------------------`);
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// function waitFiveSeconds() {
//   return new Promise<void>((resolve) => {
//     setTimeout(() => {
//       resolve();
//     }, 10000);
//   });
// }