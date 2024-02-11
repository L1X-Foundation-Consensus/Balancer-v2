const { ethers } = require('hardhat');
import { BigNumber, BigNumberish, fp } from '@balancer-labs/v2-helpers/src/numbers';

(async () => {

    const signers = await ethers.getSigners();
    const deployer = signers[0];
    
    const vaultAddress = "0xfc212EF009e458abA426977A8783b2A6b6E1eCD0";
    const protocolFeeProviderAddress = "0x131D4D1295257CC568B36867e31F8Ac32f8bA998";
    const rateProviderAddress = "0x04310553244d7CE9284af39A4a17b72367cB46E0";
    const rateProvider2Address = "0xCbe7f4543a91747a8e411E84E8e75cE8C5c993Fe";
    const bscUSDCAddress = "0x8A19130BF73EA4F5C8591491C0a1e623eECeBA11";
    const wl1xAddress = "0x0936eF494971FE035300d4af6e6b38EC1FC4c934";

    const poolParams = {
        vault: vaultAddress,
        protocolFeeProvider: protocolFeeProviderAddress,
        name: 'L1X-BSCUSDC',
        symbol: 'L1X-BSCUSDC',
        tokens: [bscUSDCAddress, wl1xAddress].sort(),
        rateProviders: [rateProviderAddress, rateProvider2Address].sort(),
        tokenRateCacheDurations: [0, 0],
        exemptFromYieldProtocolFeeFlags: [false, false],
        amplificationParameter: BigInt('1'),
        swapFeePercentage: fp(0.1),
        pauseWindowDuration: 0,
        bufferPeriodDuration: 0,
        owner: deployer.address,
        version: '1.0.0',
      };
      const ContractFactory = await ethers.getContractFactory('ComposableStablePool');
    
      const contract = await ContractFactory.deploy(poolParams);
      console.log('L1X-BSCUSDC deployed to:', contract.address);
      const poolId = await contract.getPoolId()
      console.log('L1X-BSCUSDC poolId:', poolId);

})();