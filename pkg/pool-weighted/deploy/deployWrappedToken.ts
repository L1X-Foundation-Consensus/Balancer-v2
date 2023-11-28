const { ethers } = require('hardhat');

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  const charlie = signers[2];
  console.log('Deploying contracts with the account:', deployer.address);
  const wrappedTokenFactory = await ethers.getContractFactory('WrappedTokenFactory');

  const wrappedToken = await wrappedTokenFactory.deploy();

  const weth = await wrappedToken.createWrappedToken2('weth', 'weth', 18);
  const weth1 = await wrappedToken.createWrappedToken2('weth', 'weth', 18);
  console.log('weth', await wrappedToken.getWrappedToken('weth'));
  
  const wethAddr = await wrappedToken.calculateAddr('weth', 'weth', 18);
  console.log('wethAddr', wethAddr);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
