import { StablePoolEncoder } from '@balancer-labs/balancer-js';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
const { ethers } = require('hardhat');
const fs = require("fs");

const POOLS_TO_DEPLOY = [
  {
    name: 'L1XEVM L1XSOLUSDC L1XETHUSDC pool',
    symbol: 'L1XSOLUSDC_L1XETHUSDC',
    tokens: ["0x261f0309BdD6e1Be47D253Ecfc2a08a1d301f5AF", "0x611db317E1eB8c26Ae5cD166e208969696764a2d"],
    rateProviders: ["0x2F40608EE2f019b99310920023EB95FE022cD299", "0xDECe1d0e17EE6a6b40Fe9AD87E57b059DF88A091"],
    initialLiquidity: [750000, 750000]
  },
  {
    name: 'L1XEVM L1XSOLUSDC L1XBSCUSDT pool',
    symbol: 'L1XSOLUSDC_L1XBSCUSDT',
    tokens: ["0x261f0309BdD6e1Be47D253Ecfc2a08a1d301f5AF", "0x49bE7FF7EcB0e7BB98CA4a5e81D2e44C8c09a0F1"],
    rateProviders: ["0x2F40608EE2f019b99310920023EB95FE022cD299", "0xD293526CdC401265Ba4e2352ADa8b5BeE351C985"],
    initialLiquidity: [750000, 750000]
  },
  {
    name: 'L1XEVM L1XETHUSDC L1XBSCUSDT pool',
    symbol: 'L1XETHUSDC_L1XBSCUSDT',
    tokens: ["0x611db317E1eB8c26Ae5cD166e208969696764a2d", "0x49bE7FF7EcB0e7BB98CA4a5e81D2e44C8c09a0F1"],
    rateProviders: ["0xDECe1d0e17EE6a6b40Fe9AD87E57b059DF88A091", "0xD293526CdC401265Ba4e2352ADa8b5BeE351C985"],
    initialLiquidity: [750000, 750000]
  }
]

const balancerAddress = "0x7d8E21Ca562Cc31c0359b901BB63d7Cc27Ed7549";
const vaultAddress = "0xE4f927cca34d2A4B2c138a6C4D2903e07580d804";
const protocolFeePercentagesProviderAddress = "0x7Aa3FD4DC7C105D7bFe543160260C4B506d25d58";

async function main() {
  try {
    console.log(`-----------------------------------------------------------`);
    const signers = await ethers.getSigners();
    const deployer = signers[0];

    // Read Balancer ABI
    const balancerAbiPath = "/home/nitish/Desktop/l1x-balancer-v2/pkg/pool-stable/artifacts/contracts/BalancerQueries.sol/BalancerQueries.json";
    const balancerAbiData = fs.readFileSync(balancerAbiPath);
    const balancerABI = JSON.parse(balancerAbiData).abi;
    const balancerContract = new ethers.Contract(balancerAddress, balancerABI, deployer);

    // Read Vault ABI
    const vaultAbiPath = "/home/nitish/Desktop/l1x-balancer-v2/pkg/pool-stable/artifacts/contracts/Vault.sol/Vault.json";
    const vaultAbiData = fs.readFileSync(vaultAbiPath);
    const vaultABI = JSON.parse(vaultAbiData).abi;
    const vaultContract = new ethers.Contract(vaultAddress, vaultABI, deployer);

    // ERC20 ABI
    const erc20AbiPath = "/home/nitish/Desktop/l1x-balancer-v2/pkg/pool-stable/artifacts/contracts/wrappedTokenFactory/Erc20Contract.sol/L1X_EVM_TOKEN.json";
    const erc20AbiData = fs.readFileSync(erc20AbiPath);
    const erc20ABI = JSON.parse(erc20AbiData).abi;

    for (let index = 0; index < POOLS_TO_DEPLOY.length; index++) {
      const poolDetails = POOLS_TO_DEPLOY[index];
      console.log(`-----------------------------------------------------------`);
      console.log(`Pool Deployment:`);
      console.log(`Pool Name`, poolDetails.name);
      console.log(`Pool Symbol`, poolDetails.symbol);

      // Deploying Pools
      const ContractFactory = await ethers.getContractFactory('ComposableStablePool');
      const poolParams = {
        vault: vaultAddress,
        protocolFeeProvider: protocolFeePercentagesProviderAddress,
        name: poolDetails.name,
        symbol: poolDetails.symbol,
        tokens: poolDetails.tokens,
        rateProviders: poolDetails.rateProviders,
        tokenRateCacheDurations: [0, 0],
        exemptFromYieldProtocolFeeFlags: [false, false],
        amplificationParameter: BigInt('1'),
        swapFeePercentage: fp(0.1),
        pauseWindowDuration: 0,
        bufferPeriodDuration: 0,
        owner: deployer.address,
        version: '1.0.0',
      };
    
      const poolContract = await ContractFactory.deploy(poolParams);
      await poolContract.deployed();
      console.log('Pool deployed to:', poolContract.address);
      const poolId = await poolContract.getPoolId();
      console.log('Pool id', poolId);

      let joinInitAmountsIn = [];
      let poolTokenInfo = await vaultContract.getPoolTokens(poolId);
      for (let tokenIndex = 0; tokenIndex < poolTokenInfo[0].length; tokenIndex++) {
        console.log(`-----------------------------------------------------------`);
        var pooltokenAddress = poolTokenInfo[0][tokenIndex];
        var poolTokenIndex = poolDetails.tokens.indexOf(pooltokenAddress); // 1

        if(poolTokenIndex != -1){
          const tokenAddress = poolDetails.tokens[poolTokenIndex];
          const tokenInitialSupply = poolDetails.initialLiquidity[poolTokenIndex];
          console.log(`Pool Token ${poolTokenIndex+1} Address`, tokenAddress);
          console.log(`Pool Token ${poolTokenIndex+1} Initial Supply`, tokenInitialSupply);

          const erc20Contract = new ethers.Contract(tokenAddress, erc20ABI, deployer);

          const approveTokenToVault = await erc20Contract
            .connect(deployer)
            .approve(vaultAddress, ethers.utils.parseEther(tokenInitialSupply+""));
          await approveTokenToVault.wait();
          console.log('Approve Vault For Token Transfer.');

          joinInitAmountsIn.push(ethers.utils.parseEther(tokenInitialSupply+""));
        } else {
          joinInitAmountsIn.push(ethers.utils.parseUnits('0', 18));
        }
      }
      console.log("🚀 ~ main ~ joinInitAmountsIn:", joinInitAmountsIn)
      
      const poolJoinInit = await vaultContract.joinPool(
        poolId, // pool id
        deployer.address,
        deployer.address,
        {
          assets: poolTokenInfo[0],
          maxAmountsIn: [
            ethers.utils.parseEther('10000000000000000'),
            ethers.utils.parseEther('10000000000000000'),
            ethers.utils.parseEther('10000000000000000'),
          ],
          fromInternalBalance: false,
          userData: StablePoolEncoder.joinInit(joinInitAmountsIn),
        },
      );
      await poolJoinInit.wait();
      console.log('Initial Join Completed.');

      const _responseQueryJoin = await balancerContract.queryJoin(
        poolId, // pool id
        deployer.address,
        deployer.address,
        {
          assets: poolTokenInfo[0],
          maxAmountsIn: [
            ethers.utils.parseEther('10000000000000000'),
            ethers.utils.parseEther('10000000000000000'),
            ethers.utils.parseEther('10000000000000000'),
          ],
          fromInternalBalance: false,
          userData: StablePoolEncoder.joinExactTokensInForBPTOut([ethers.utils.parseEther("20"), 0], 0),
        }
      );
      console.log("Testing Join Pool: ", _responseQueryJoin)
      console.log(`-----------------------------------------------------------`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
  console.log(`-----------------------------------------------------------`);
  console.log(`-----------------------------------------------------------`);
  console.log(`-----------------------------------------------------------`);
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
