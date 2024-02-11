const { ethers } = require('hardhat');

(async () => {

    const signers = await ethers.getSigners();
    const deployer = signers[0];
    const bob = signers[1];
    const charlie = signers[2];
    console.log('Deploying contracts with the account:', deployer.address);
    const erc20Factory = await ethers.getContractFactory('OldWrappedToken');
    const erc20Params = {
        _name: 'bscUSDC',
        _symbol: 'bscUSDC',
        _decimals: 18,
    };

    const erc20 = await erc20Factory.deploy(erc20Params._name, erc20Params._symbol, erc20Params._decimals);

    console.log(erc20.address,"bscUSDC > Address ");
})();