const { ethers } = require('hardhat');
const fs = require('fs');

(async () => {
  const signers = await ethers.getSigners();
  const deployer = signers[0];


  //  deploy weth
  const wethFactory = await ethers.getContractFactory('WETH');
  const weth = await wethFactory.deploy();
  console.log('Contract WETH deployed to:', weth.address);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // deploy authorizer
  const AuthorizerFactory = await ethers.getContractFactory('Authorizer');
  const authorizer = await AuthorizerFactory.deploy(deployer.address);
  console.log('Contract Authorizer deployed to:', authorizer.address);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // deploy vault
  const VaultFactory = await ethers.getContractFactory('Vault');
  const vaultParams = {
    authorizer: authorizer.address,
    weth: weth.address,
    pauseWindowDuration: 0,
    bufferPeriodDuration: 0,
  };

  const vault = await VaultFactory.deploy(
    vaultParams.authorizer,
    vaultParams.weth,
    vaultParams.pauseWindowDuration,
    vaultParams.bufferPeriodDuration
  );

  console.log('Contract Vault deployed to:', vault.address);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // deploy balancer queries
  const balancerQueriesFactory = await ethers.getContractFactory('BalancerQueries');
  const balancerQueries = await balancerQueriesFactory.deploy(vault.address);
  console.log('Contract BalancerQueries deployed to:', balancerQueries.address);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // deploy ProtocolFeePercentagesProvider
  const ProtocolFeePercentagesProviderFactory = await ethers.getContractFactory('ProtocolFeePercentagesProvider');
  const protocolFeePercentagesProvider = await ProtocolFeePercentagesProviderFactory.deploy(vault.address, 100, 200);
  console.log('Contract ProtocolFeePercentagesProvider deployed to:', protocolFeePercentagesProvider.address);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // deploy the rate provider
  const RateProviderFactory = await ethers.getContractFactory('RateProvider');
  const rateProvider = await RateProviderFactory.deploy();
  console.log('Contract RateProvider 1 deployed to:', rateProvider.address);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // deploy the rate provider
  const RateProviderFactory2 = await ethers.getContractFactory('RateProvider');
  const rateProvider2 = await RateProviderFactory2.deploy();
  console.log('Contract RateProvider 2 deployed to:', rateProvider2.address);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // deploy the rate provider
  const RateProviderFactory3 = await ethers.getContractFactory('RateProvider');
  const rateProvider3 = await RateProviderFactory3.deploy();
  console.log('Contract RateProvider 3 deployed to:', rateProvider3.address);
  await new Promise((resolve) => setTimeout(resolve, 5000));  

  /* 
    
  
  */
})();
