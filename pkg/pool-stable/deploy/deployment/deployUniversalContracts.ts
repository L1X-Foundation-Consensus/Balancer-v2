const { ethers } = require('hardhat');

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const gasLimit = ethers.utils.parseUnits("200", 'gwei'); // 5 gwei

  console.log(`-----------------------------------------------------------`);
  console.log(`-----------------------------------------------------------`);
  console.log('Deploying contracts with the account:', deployer.address);
  console.log(`-----------------------------------------------------------`);

  const wethFactory = await ethers.getContractFactory('WETH');
  const weth = await wethFactory.deploy();
  await weth.deployed();
  console.log('WETH deployed to: ', weth.address);
  // write weth creation code to file

  const AuthorizerFactory = await ethers.getContractFactory('Authorizer');
  const authorizer = await AuthorizerFactory.deploy(deployer.address);
  await authorizer.deployed();
  console.log('Authorizer deployed to: ', authorizer.address);
  // write weth creation code to file
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
  await vault.deployed();
  console.log('Vault deployed to: ', vault.address);

  const balancerQueriesFactory = await ethers.getContractFactory('BalancerQueries');
  const balancerQueries = await balancerQueriesFactory.deploy(vault.address);
  await balancerQueries.deployed();
  console.log('BalancerQueries deployed to: ', balancerQueries.address);

  const ProtocolFeePercentagesProviderFactory = await ethers.getContractFactory('ProtocolFeePercentagesProvider');
  const protocolFeePercentagesProvider = await ProtocolFeePercentagesProviderFactory.deploy(vault.address, 100, 200);
  await protocolFeePercentagesProvider.deployed();
  console.log('ProtocolFeePercentageProvider deployed to: ', protocolFeePercentagesProvider.address);

  console.log(`-----------------------------------------------------------`);
  console.log(`-----------------------------------------------------------`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export function bignumberToNumber(num: any) {
  return num.div(ethers.BigNumber.from(10).pow(18)).toNumber();
}