const { ethers } = require('hardhat');

(async () => {

    const signers = await ethers.getSigners();
    const deployer = signers[0];
   

    const OldWrappedTokenFactory = await ethers.getContractFactory("OldWrappedToken");
    // const ethUSDC = OldWrappedTokenFactory.attach("0x0d28fCA112fF3B932F30DABD7e984DD530026a00");
    const bscUSDC = OldWrappedTokenFactory.attach("0x8A19130BF73EA4F5C8591491C0a1e623eECeBA11");
    const WL1X = OldWrappedTokenFactory.attach("0x0936eF494971FE035300d4af6e6b38EC1FC4c934");


    // console.log("Balance of ethUSDC: ", await ethUSDC.balanceOf(deployer.address));
    console.log("Balance of bscUSDC: ", await bscUSDC.balanceOf(deployer.address));
    console.log("Balance of WL1X: ", await WL1X.balanceOf(deployer.address));
})();