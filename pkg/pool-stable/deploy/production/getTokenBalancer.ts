const { ethers } = require('hardhat');

(async () => {
    const signers = await ethers.getSigners();
    const deployer = signers[0];

    const arrTokenAddress = [
        "0x4523258C90Fa91E834f10394f89f859aA1EfDF10",
        "0x39E96F7dEb7398E5D43Bcdfe05740Ae398925f22",
        "0x3034d7160040936398a240d5Cf990496869eFE87",
        "0x5cD9269A8914a000a85d8f3f4C0702ce79eFbd2a",
        "0x2E3aB08BC67B858dB28c4849a0C755eA63978D1E",
        "0xa23127a1F5614d3f621d18B8F09e5679B1d14753"
    ]

    const balanceOfAddress = deployer.address;
    for(let tokenAddress of arrTokenAddress){
        const erc20Factory = await ethers.getContractFactory('L1X_EVM_TOKEN');
        const erc20Instance  = erc20Factory.attach(tokenAddress);

        console.log("Token Address: ", erc20Instance.address);
        console.log("Token Symbol", await erc20Instance.symbol());
        console.log("Token Name", await erc20Instance.name());
        console.log("Token Decimals", await erc20Instance.decimals());
        // console.log("Token Balance for ", deployer.address, " , Balance: ", await erc20Instance.balanceOf(deployer.address));

        const balance = await erc20Instance.balanceOf(balanceOfAddress);
        console.log("Token Balance for "+balanceOfAddress+" , Balance: ", ethers.utils.formatEther(balance.toString()));
    }


})()