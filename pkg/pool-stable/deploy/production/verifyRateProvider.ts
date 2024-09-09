const { ethers } = require('hardhat');

(async () => {
    const signers = await ethers.getSigners();
    const deployer = signers[0];

    const rateProviderAddress = "0xa2169e6c037b1D04ABb14050D12Cf2b616bEE162";


    const rateProviderFactory = await ethers.getContractFactory('RateProvider');
    const rateProviderInstance  = rateProviderFactory.attach(rateProviderAddress);

    console.log("RateProvider > getRate ", await rateProviderInstance.getRate());

})()