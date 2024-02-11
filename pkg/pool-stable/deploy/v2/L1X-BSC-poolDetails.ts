const { ethers } = require('hardhat');
import { BigNumber, BigNumberish, fp } from '@balancer-labs/v2-helpers/src/numbers';

(async () => {

    const signers = await ethers.getSigners();
    const deployer = signers[0];
    
    const VaultFactory = await ethers.getContractFactory("Vault");
    const Vault = VaultFactory.attach("0xfc212EF009e458abA426977A8783b2A6b6E1eCD0");

    // L1X-BSCUSDC
    const poolId = "0xfee38a1c4324c4b6684de11bacdfb4d3bbf97c31000000000000000000000000";
    let poolTokensL1XBSCUSDC = await Vault.getPoolTokens(poolId);
    console.log("L1X-BSCUSDC poolTokens: ", poolTokensL1XBSCUSDC);

})();