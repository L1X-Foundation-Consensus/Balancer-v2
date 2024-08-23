const { ethers } = require('hardhat');
import abi from '/home/nitish/Desktop/l1x-balancer-v2/pkg/pool-stable/artifacts/contracts/RateProvider.sol/RateProvider.json';

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  console.log('Deploying contracts with the account:', deployer.address);

  const tokens = [
    { _name: 'ZDX', _symbol: 'ZDX', decimals: 18, totalSupply: 15000000, price: 0.03, deployerKey: process.env.DEPLOYER_L1XEVM },
    // { _name: 'L1XEVM', _symbol: 'L1XEVM', decimals: 18, totalSupply: 10000000, price: 0.02632, deployerKey: process.env.DEPLOYER_L1XEVM },
    // { _name: 'L1XETH', _symbol: 'L1XETH', decimals: 18, totalSupply: 100000, price: 2629.19, deployerKey: process.env.DEPLOYER_L1XETH },
    { _name: 'L1XETHUSDC', _symbol: 'L1XETHUSDC', decimals: 18, totalSupply: 15000000, price: 1, deployerKey: process.env.DEPLOYER_L1XETH },
    // { _name: 'L1XETHUSDT', _symbol: 'L1XETHUSDT', decimals: 18, totalSupply: 10000000, price: 1, deployerKey: process.env.DEPLOYER_L1XETH },
    // { _name: 'L1XBSC', _symbol: 'L1XBSC', decimals: 18, totalSupply: 100000, price: 576.2, deployerKey: process.env.DEPLOYER_L1XBSC },
    // { _name: 'L1XBSCUSDC', _symbol: 'L1XBSCUSDC', decimals: 18, totalSupply: 10000000, price: 1, deployerKey: process.env.DEPLOYER_L1XBSC },
    { _name: 'L1XBSCUSDT', _symbol: 'L1XBSCUSDT', decimals: 18, totalSupply: 15000000, price: 1, deployerKey: process.env.DEPLOYER_L1XBSC },
    // { _name: 'L1XMATIC', _symbol: 'L1XMATIC', decimals: 18, totalSupply: 100000, price: 0.5192, deployerKey: process.env.DEPLOYER_L1XMATIC },
    // { _name: 'L1XMATICUSDC', _symbol: 'L1XMATICUSDC', decimals: 18, totalSupply: 10000000, price: 1, deployerKey: process.env.DEPLOYER_L1XMATIC },
    // { _name: 'L1XMATICUSDT', _symbol: 'L1XMATICUSDT', decimals: 18, totalSupply: 10000000, price: 1, deployerKey: process.env.DEPLOYER_L1XMATIC },
    // { _name: 'L1XAVAX', _symbol: 'L1XAVAX', decimals: 18, totalSupply: 100000, price: 23.27, deployerKey: process.env.DEPLOYER_L1XAVAX },
    // { _name: 'L1XAVAXUSDC', _symbol: 'L1XAVAXUSDC', decimals: 18, totalSupply: 10000000, price: 1, deployerKey: process.env.DEPLOYER_L1XAVAX },
    // { _name: 'L1XAVAXUSDT', _symbol: 'L1XAVAXUSDT', decimals: 18, totalSupply: 10000000, price: 1, deployerKey: process.env.DEPLOYER_L1XAVAX },
    // { _name: 'L1XARBETH', _symbol: 'L1XARBETH', decimals: 18, totalSupply: 100000, price: 2629.19, deployerKey: process.env.DEPLOYER_L1XARBETH },
    // { _name: 'L1XARBUSDC', _symbol: 'L1XARBUSDC', decimals: 18, totalSupply: 10000000, price: 1, deployerKey: process.env.DEPLOYER_L1XARBETH },
    // { _name: 'L1XARBUSDT', _symbol: 'L1XARBUSDT', decimals: 18, totalSupply: 10000000, price: 1, deployerKey: process.env.DEPLOYER_L1XARBETH },
    // { _name: 'L1XOPTETH', _symbol: 'L1XOPTETH', decimals: 18, totalSupply: 100000, price: 2629.19, deployerKey: process.env.DEPLOYER_L1XOPTETH },
    // { _name: 'L1XOPTUSDC', _symbol: 'L1XOPTUSDC', decimals: 18, totalSupply: 10000000, price: 1, deployerKey: process.env.DEPLOYER_L1XOPTETH },
    // { _name: 'L1XOPTUSDT', _symbol: 'L1XOPTUSDT', decimals: 18, totalSupply: 10000000, price: 1, deployerKey: process.env.DEPLOYER_L1XOPTETH },
    // { _name: 'L1XSOL', _symbol: 'L1XSOL', decimals: 18, totalSupply: 100000, price: 142.97, deployerKey: process.env.DEPLOYER_L1XSOL },
    { _name: 'L1XSOLUSDC', _symbol: 'L1XSOLUSDC', decimals: 18, totalSupply: 15000000, price: 1, deployerKey: process.env.DEPLOYER_L1XSOL },
    // { _name: 'L1XSOLUSDT', _symbol: 'L1XSOLUSDT', decimals: 18, totalSupply: 10000000, price: 1, deployerKey: process.env.DEPLOYER_L1XSOL },
  ];

  for (const token of tokens) {
    console.log(`Deploying ${token._name} with initial supply of ${token.totalSupply.toString()}`);
    const provider = ethers.provider;
    const signer = new ethers.Wallet(token?.deployerKey, provider)
    
    console.log(`-----------------------------------------------------------`);
    console.log(token._name);

    const erc20Factory = await ethers.getContractFactory('L1X_EVM_TOKEN');
    const tokenContract = await erc20Factory.connect(signer).deploy(token._name, token._symbol, token.decimals, token.totalSupply);
    await tokenContract.deployed();
    console.log(`Token deployed to:`, tokenContract.address, `, Owner: `, await tokenContract.owner());

    const erc20RateProviderFactory = await ethers.getContractFactory('RateProvider');
    const tokenRateProviderContract = await erc20RateProviderFactory.deploy();
    await tokenRateProviderContract.deployed();
    console.log(`Rate provider deployed to:`, tokenRateProviderContract.address);
    const l1xRateUpdated = await tokenRateProviderContract.updateRate(ethers.utils.parseEther(token.price+""))
    await l1xRateUpdated.wait();
    console.log(`Price: `, token.price, ` - `, (await tokenRateProviderContract.getRate())?.toString());
    console.log(`-----------------------------------------------------------`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});