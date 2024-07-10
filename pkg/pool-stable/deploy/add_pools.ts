import { StablePoolEncoder } from '@balancer-labs/balancer-js';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';

const { ethers } = require('hardhat');

async function main() {
  try {
    const fs = require("fs");

    const signers = await ethers.getSigners();
    const deployer = signers[0];

    // Create provider for Authorizer
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:50051");

    // Assuming you have a wallet with a private key
    const privateKey = "6913aeae91daf21a8381b1af75272fe6fae8ec4a21110674815c8f0691e32758";
    const wallet = new ethers.Wallet(privateKey, provider);

    // Connect the wallet to a signer
    const connectedWallet = wallet.connect(provider);

    // Read Vault ABI
    const vaultAbiPath = "/home/user1/l1x/l1x-balancer-v2/pkg/pool-stable/artifacts/contracts/Vault.sol/Vault.json";
    const vaultAbiData = fs.readFileSync(vaultAbiPath);
    const vaultABI = JSON.parse(vaultAbiData).abi;

    // Vault contract address
    const vaultAddress = "0x8E192Badc595C70Be25cbd1D4865e0c24aA92C29";

    // Create instance of Vault contract with the connected wallet
    const vaultContract = new ethers.Contract(vaultAddress, vaultABI, connectedWallet);

    console.log('Deploying contracts with the account:', deployer.address);
    const erc20Factory = await ethers.getContractFactory('OldWrappedToken');
    
    const maticUsdcParam = {
      _name: 'MATIC-USDC',
      _symbol: 'MATIC-USDC',
      _decimals: 18,
    };
    const maticUsdcContract = await erc20Factory.deploy(maticUsdcParam._name, maticUsdcParam._symbol, maticUsdcParam._decimals);
    console.log('Contract matic-USDC deployed to:', maticUsdcContract.address);

    const maticUsdcRateProviderFactory = await ethers.getContractFactory('RateProvider');
    const maticUsdcRateProvider = await maticUsdcRateProviderFactory.deploy();
    console.log('matic-usdc rate provider deployed to:', maticUsdcRateProvider.address);
    await waitFiveSeconds();

    const maticUsdtParam = {
      _name: 'MATIC-USDT',
      _symbol: 'MATIC-USDT',
      _decimals: 18,
    };
    const maticUsdtContract = await erc20Factory.deploy(maticUsdtParam._name, maticUsdtParam._symbol, maticUsdtParam._decimals);
    console.log('Contract matic-USDT deployed to:', maticUsdtContract.address);

    const maticUsdtRateProviderFactory = await ethers.getContractFactory('RateProvider');
    const maticUsdtRateProvider = await maticUsdtRateProviderFactory.deploy();
    console.log('matic-usdt rate provider deployed to:', maticUsdtRateProvider.address);
    await waitFiveSeconds();

    const maticL1xParam = {
      _name: 'MATIC-L1X',
      _symbol: 'MATIC-L1X',
      _decimals: 18,
    };
    const maticL1xContract = await erc20Factory.deploy(maticL1xParam._name, maticL1xParam._symbol, maticL1xParam._decimals);
    console.log('Contract matic-L1X deployed to:', maticL1xContract.address);

    const maticL1xRateProviderFactory = await ethers.getContractFactory('RateProvider');
    const maticL1xRateProvider = await maticL1xRateProviderFactory.deploy();
    console.log('matic-l1x rate provider deployed to:', maticL1xRateProvider.address);
    await maticL1xRateProvider.updateRate(ethers.utils.parseEther('.5'))
    await waitFiveSeconds();

    const avaxUsdcParam = {
      _name: 'AVAX-USDC',
      _symbol: 'AVAX-USDC',
      _decimals: 18,
    };
    const avaxUsdcContract = await erc20Factory.deploy(avaxUsdcParam._name, avaxUsdcParam._symbol, avaxUsdcParam._decimals);
    console.log('Contract avax-USDC deployed to:', avaxUsdcContract.address);

    const avaxUsdcRateProviderFactory = await ethers.getContractFactory('RateProvider');
    const avaxUsdcRateProvider = await avaxUsdcRateProviderFactory.deploy();
    console.log('avax-usdc rate provider deployed to:', avaxUsdcRateProvider.address);
    await waitFiveSeconds();

    const avaxUsdtParam = {
      _name: 'AVAX-USDT',
      _symbol: 'AVAX-USDT',
      _decimals: 18,
    };
    const avaxUsdtContract = await erc20Factory.deploy(avaxUsdtParam._name, avaxUsdtParam._symbol, avaxUsdtParam._decimals);
    console.log('Contract avax-USDT deployed to:', avaxUsdtContract.address);

    const avaxUsdtRateProviderFactory = await ethers.getContractFactory('RateProvider');
    const avaxUsdtRateProvider = await avaxUsdtRateProviderFactory.deploy();
    console.log('avax-usdt rate provider deployed to:', avaxUsdtRateProvider.address);
    await waitFiveSeconds();

    const avaxL1xParam = {
      _name: 'AVAX-L1X',
      _symbol: 'AVAX-L1X',
      _decimals: 18,
    };
    const avaxL1xContract = await erc20Factory.deploy(avaxL1xParam._name, avaxL1xParam._symbol, avaxL1xParam._decimals);
    console.log('Contract avax-L1X deployed to:', avaxL1xContract.address);

    const avaxL1xRateProviderFactory = await ethers.getContractFactory('RateProvider');
    const avaxL1xRateProvider = await avaxL1xRateProviderFactory.deploy();
    console.log('avax-l1x rate provider deployed to:', avaxL1xRateProvider.address);
    await waitFiveSeconds();
    await avaxL1xRateProvider.updateRate(ethers.utils.parseEther('.5'))
    await waitFiveSeconds();

    // Read Vault ABI
    const protocolFeePercentagesProviderAbiPath = "/home/user1/l1x/l1x-balancer-v2/pkg/pool-stable/artifacts/contracts/ProtocolFeePercentagesProvider.sol/ProtocolFeePercentagesProvider.json";
    const protocolFeePercentagesProviderAbiData = fs.readFileSync(protocolFeePercentagesProviderAbiPath);
    const protocolFeePercentagesProviderABI = JSON.parse(protocolFeePercentagesProviderAbiData).abi;

    // Vault contract address
    const protocolFeePercentagesProviderAddress = "0x4C1fA6559569286Dc1C8D0Fe97c170640b8d2855";

    // Create instance of Vault contract with the connected wallet
    const protocolFeePercentagesProviderContract = new ethers.Contract(protocolFeePercentagesProviderAddress, protocolFeePercentagesProviderABI, connectedWallet);

    const ContractFactory = await ethers.getContractFactory('ComposableStablePool');

    const maticUsdcPoolParams = {
      vault: vaultContract.address,
      protocolFeeProvider: protocolFeePercentagesProviderContract.address,
      name: 'MATIC USDC pool',
      symbol: 'MSP',
      tokens: [maticUsdcContract.address, maticL1xContract.address].sort(),
      rateProviders: [maticUsdcRateProvider.address, maticL1xRateProvider.address].sort(),
      tokenRateCacheDurations: [0, 0],
      exemptFromYieldProtocolFeeFlags: [false, false],
      amplificationParameter: BigInt('1'),
      swapFeePercentage: fp(0.1),
      pauseWindowDuration: 0,
      bufferPeriodDuration: 0,
      owner: deployer.address,
      version: '1.0.0',
    };
  
    const maticUsdcPoolContract = await ContractFactory.deploy(maticUsdcPoolParams, );
    console.log('matic usdc pool deployed to:', maticUsdcPoolContract.address);
    await waitFiveSeconds();
    const maticUsdcPoolId = await maticUsdcPoolContract.getPoolId();
    console.log('matic-usdc pool id', maticUsdcPoolId);

    const maticUsdtPoolParams = {
      vault: vaultContract.address,
      protocolFeeProvider: protocolFeePercentagesProviderContract.address,
      name: 'MATIC USDT pool',
      symbol: 'MSP',
      tokens: [maticUsdtContract.address, maticL1xContract.address].sort(),
      rateProviders: [maticUsdtRateProvider.address, maticL1xRateProvider.address].sort(),
      tokenRateCacheDurations: [0, 0],
      exemptFromYieldProtocolFeeFlags: [false, false],
      amplificationParameter: BigInt('1'),
      swapFeePercentage: fp(0.1),
      pauseWindowDuration: 0,
      bufferPeriodDuration: 0,
      owner: deployer.address,
      version: '1.0.0',
    };
  
    const maticUsdtPoolContract = await ContractFactory.deploy(maticUsdtPoolParams, );
    console.log('matic usdt pool deployed to:', maticUsdtPoolContract.address);
    await waitFiveSeconds();
    const maticUsdtPoolId = await maticUsdtPoolContract.getPoolId();
    console.log('matic-usdt pool id', maticUsdtPoolId);

    const avaxUsdcPoolParams = {
      vault: vaultContract.address,
      protocolFeeProvider: protocolFeePercentagesProviderContract.address,
      name: 'AVAX USDC pool',
      symbol: 'MSP',
      tokens: [avaxUsdcContract.address, avaxL1xContract.address].sort(),
      rateProviders: [avaxUsdcRateProvider.address, avaxL1xRateProvider.address].sort(),
      tokenRateCacheDurations: [0, 0],
      exemptFromYieldProtocolFeeFlags: [false, false],
      amplificationParameter: BigInt('1'),
      swapFeePercentage: fp(0.1),
      pauseWindowDuration: 0,
      bufferPeriodDuration: 0,
      owner: deployer.address,
      version: '1.0.0',
    };
  
    const avaxUsdcPoolContract = await ContractFactory.deploy(avaxUsdcPoolParams, );
    console.log('avax-usdc pool deployed to:', avaxUsdcPoolContract.address);
    await waitFiveSeconds();
    const avaxUsdcPoolId = await avaxUsdcPoolContract.getPoolId();
    console.log('avax-usdc pool id', avaxUsdcPoolId);

    const avaxUsdtPoolParams = {
      vault: vaultContract.address,
      protocolFeeProvider: protocolFeePercentagesProviderContract.address,
      name: 'MATIC pool',
      symbol: 'MSP',
      tokens: [avaxUsdtContract.address, avaxL1xContract.address].sort(),
      rateProviders: [avaxUsdtRateProvider.address, avaxL1xRateProvider.address].sort(),
      tokenRateCacheDurations: [0, 0],
      exemptFromYieldProtocolFeeFlags: [false, false],
      amplificationParameter: BigInt('1'),
      swapFeePercentage: fp(0.1),
      pauseWindowDuration: 0,
      bufferPeriodDuration: 0,
      owner: deployer.address,
      version: '1.0.0',
    };
  
    const avaxUsdtPoolContract = await ContractFactory.deploy(avaxUsdtPoolParams, );
    console.log('avax-usdt pool deployed to:', avaxUsdtPoolContract.address);
    await waitFiveSeconds();
    const avaxUsdtPoolId = await avaxUsdtPoolContract.getPoolId();
    console.log('avax-usdt pool id', avaxUsdtPoolId);


    await maticUsdcContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vaultContract.address, );
    await waitFiveSeconds();

    await maticL1xContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vaultContract.address, );
    await waitFiveSeconds();

    await avaxUsdcContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vaultContract.address, );
    await waitFiveSeconds();

    await avaxL1xContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vaultContract.address, );
    await waitFiveSeconds();


    let maticUsdcTokenInfo = await vaultContract.getPoolTokens(maticUsdcPoolId);

    let maticUsdcAmountsIn = [];
    for (let i = 0; i < maticUsdcTokenInfo[0].length; i++) {
      if (maticUsdcTokenInfo[0][i] == maticUsdcContract.address) {
        maticUsdcAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
      } else if (maticUsdcTokenInfo[0][i] == maticL1xContract.address) {
        maticUsdcAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
      } else {
        maticUsdcAmountsIn.push(ethers.utils.parseUnits('0', 18));
      }
    }
    
    const maticUsdcTxJoin = await vaultContract.joinPool(
      maticUsdcPoolId, // pool id
      deployer.address,
      deployer.address,
      {
        assets: maticUsdcTokenInfo[0],
        maxAmountsIn: [
          ethers.utils.parseEther('10000000000000000'),
          ethers.utils.parseEther('10000000000000000'),
          ethers.utils.parseEther('10000000000000000'),
        ],
        fromInternalBalance: false,
        userData: StablePoolEncoder.joinInit(maticUsdcAmountsIn),
      },
      
    );
    await maticUsdcTxJoin.wait();
    await waitFiveSeconds();

    console.log('matic-usdc bpt deployer balance after init the pool', bignumberToNumber(await maticUsdcPoolContract.balanceOf(deployer.address)));




    let maticUsdtTokenInfo = await vaultContract.getPoolTokens(maticUsdtPoolId);

    let maticUsdtAmountsIn = [];
    for (let i = 0; i < maticUsdtTokenInfo[0].length; i++) {
      if (maticUsdtTokenInfo[0][i] == maticUsdtContract.address) {
        maticUsdtAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
      } else if (maticUsdtTokenInfo[0][i] == maticL1xContract.address) {
        maticUsdtAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
      } else {
        maticUsdtAmountsIn.push(ethers.utils.parseUnits('0', 18));
      }
    }
    
    const maticUsdtTxJoin = await vaultContract.joinPool(
      maticUsdtPoolId, // pool id
      deployer.address,
      deployer.address,
      {
        assets: maticUsdtTokenInfo[0],
        maxAmountsIn: [
          ethers.utils.parseEther('10000000000000000'),
          ethers.utils.parseEther('10000000000000000'),
          ethers.utils.parseEther('10000000000000000'),
        ],
        fromInternalBalance: false,
        userData: StablePoolEncoder.joinInit(maticUsdtAmountsIn),
      },
      
    );
    await maticUsdtTxJoin.wait();
    await waitFiveSeconds();

    console.log('matic-usdt bpt deployer balance after init the pool', bignumberToNumber(await maticUsdtPoolContract.balanceOf(deployer.address)));

    let avaxUsdcTokenInfo = await vaultContract.getPoolTokens(avaxUsdcPoolId);

    let avaxUsdcAmountsIn = [];
    for (let i = 0; i < avaxUsdcTokenInfo[0].length; i++) {
      if (avaxUsdcTokenInfo[0][i] == avaxUsdcContract.address) {
        avaxUsdcAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
      } else if (avaxUsdcTokenInfo[0][i] == avaxL1xContract.address) {
        avaxUsdcAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
      } else {
        avaxUsdcAmountsIn.push(ethers.utils.parseUnits('0', 18));
      }
    }
    
    const avaxUsdcTxJoin = await vaultContract.joinPool(
      avaxUsdcPoolId, // pool id
      deployer.address,
      deployer.address,
      {
        assets: avaxUsdcTokenInfo[0],
        maxAmountsIn: [
          ethers.utils.parseEther('10000000000000000'),
          ethers.utils.parseEther('10000000000000000'),
          ethers.utils.parseEther('10000000000000000'),
        ],
        fromInternalBalance: false,
        userData: StablePoolEncoder.joinInit(avaxUsdcAmountsIn),
      },
      
    );
    await avaxUsdcTxJoin.wait();
    await waitFiveSeconds();

    console.log('avax-usdc bpt deployer balance after init the pool', bignumberToNumber(await avaxUsdcPoolContract.balanceOf(deployer.address)));




    let avaxUsdtTokenInfo = await vaultContract.getPoolTokens(avaxUsdtPoolId);

    let avaxUsdtAmountsIn = [];
    for (let i = 0; i < avaxUsdtTokenInfo[0].length; i++) {
      if (avaxUsdtTokenInfo[0][i] == avaxUsdtContract.address) {
        avaxUsdtAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
      } else if (avaxUsdtTokenInfo[0][i] == avaxL1xContract.address) {
        avaxUsdtAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
      } else {
        avaxUsdtAmountsIn.push(ethers.utils.parseUnits('0', 18));
      }
    }
    
    const avaxUsdtTxJoin = await vaultContract.joinPool(
      avaxUsdtPoolId, // pool id
      deployer.address,
      deployer.address,
      {
        assets: maticUsdtTokenInfo[0],
        maxAmountsIn: [
          ethers.utils.parseEther('10000000000000000'),
          ethers.utils.parseEther('10000000000000000'),
          ethers.utils.parseEther('10000000000000000'),
        ],
        fromInternalBalance: false,
        userData: StablePoolEncoder.joinInit(avaxUsdtAmountsIn),
      },
      
    );
    await maticUsdtTxJoin.wait();
    await waitFiveSeconds();

    console.log('avax-usdt bpt deployer balance after init the pool', bignumberToNumber(await avaxUsdtPoolContract.balanceOf(deployer.address)));

  } catch (error) {
    console.error("Error:", error);
  }
}

// Execute main function
main();

function waitFiveSeconds() {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 10000);
  });
}

export function bignumberToNumber(num: any) {
  return num.div(ethers.BigNumber.from(10).pow(18)).toNumber();
}

