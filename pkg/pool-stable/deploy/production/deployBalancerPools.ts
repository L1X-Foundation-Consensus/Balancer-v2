import { StablePoolEncoder } from '@balancer-labs/balancer-js';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
const { ethers } = require('hardhat');
const fs = require("fs");

// 166666666 > 500000 / 0.003
const POOLS_TO_DEPLOY = [
  // {
  //   name: 'L1XSOLUSDC-L1XETHUSDC-POOL',
  //   symbol: 'L1XSOLUSDC_L1XETHUSDC',
  //   tokens: ["0x2E3aB08BC67B858dB28c4849a0C755eA63978D1E", "0x3034d7160040936398a240d5Cf990496869eFE87"],
  //   rateProviders: ["0x301F8635A2Ae12005518c41B5Acc4FfE4eCe6e4f", "0x5a84ad69EcFD52B7988D5b2064d408C77b85d473"],
  //   initialLiquidity: [750000, 750000]
  // },
  // {
  //   name: 'L1XSOLUSDC-L1XBSCUSDT-POOL',
  //   symbol: 'L1XSOLUSDC_L1XBSCUSDT',
  //   tokens: ["0x2E3aB08BC67B858dB28c4849a0C755eA63978D1E", "0x5cD9269A8914a000a85d8f3f4C0702ce79eFbd2a"],
  //   rateProviders: ["0x301F8635A2Ae12005518c41B5Acc4FfE4eCe6e4f", "0xBfB7De31D0419f5736703CeBac0AB5a844A83242"],
  //   initialLiquidity: [750000, 750000]
  // },
  // {
  //   name: 'L1XETHUSDC-L1XBSCUSDT-POOL',
  //   symbol: 'L1XETHUSDC_L1XBSCUSDT',
  //   tokens: ["0x3034d7160040936398a240d5Cf990496869eFE87", "0x5cD9269A8914a000a85d8f3f4C0702ce79eFbd2a"],
  //   rateProviders: ["0x5a84ad69EcFD52B7988D5b2064d408C77b85d473", "0xBfB7De31D0419f5736703CeBac0AB5a844A83242"],
  //   initialLiquidity: [750000, 750000]
  // },
  // {
  //   name: 'ETHUSDZDX',
  //   symbol: 'ETHUSDZDX',
  //   tokens: ["0x3034d7160040936398a240d5Cf990496869eFE87", "0x4523258C90Fa91E834f10394f89f859aA1EfDF10"],
  //   rateProviders: ["0x5a84ad69EcFD52B7988D5b2064d408C77b85d473", "0x42fA88a53dff1231d82a987849c7543b96E0648f"],
  //   initialLiquidity: [500000, 16666666]
  // },
  // {
  //   name: 'BSCUSDZDX',
  //   symbol: 'BSCUSDZDX',
  //   tokens: ["0x4523258C90Fa91E834f10394f89f859aA1EfDF10","0x5cD9269A8914a000a85d8f3f4C0702ce79eFbd2a"],
  //   rateProviders: ["0x42fA88a53dff1231d82a987849c7543b96E0648f","0xBfB7De31D0419f5736703CeBac0AB5a844A83242"],
  //   initialLiquidity: [16666666, 500000]
  // },
  // {
  //   name: 'SOLUSDZDX',
  //   symbol: 'SOLUSDZDX',
  //   tokens: ["0x2E3aB08BC67B858dB28c4849a0C755eA63978D1E", "0x4523258C90Fa91E834f10394f89f859aA1EfDF10"],
  //   rateProviders: ["0x301F8635A2Ae12005518c41B5Acc4FfE4eCe6e4f", "0x42fA88a53dff1231d82a987849c7543b96E0648f"],
  //   initialLiquidity: [500000, 16666666]
  // },
  // {
  //   name: 'AVAUSDZDX',
  //   symbol: 'AVAUSDZDX',
  //   tokens: ["0x4523258C90Fa91E834f10394f89f859aA1EfDF10","0xa23127a1F5614d3f621d18B8F09e5679B1d14753"],
  //   rateProviders: ["0x42fA88a53dff1231d82a987849c7543b96E0648f","0xa2169e6c037b1D04ABb14050D12Cf2b616bEE162"],
  //   initialLiquidity: [16666666, 500000]
  // },
  // {
  //   name: 'L1XZDX',
  //   symbol: 'L1XZDX',
  //   tokens: ["0x39E96F7dEb7398E5D43Bcdfe05740Ae398925f22","0x4523258C90Fa91E834f10394f89f859aA1EfDF10"],
  //   rateProviders: ["0xE847c13a71fE7a16A86F350fd09dec5575C0fc3E","0x42fA88a53dff1231d82a987849c7543b96E0648f"],
  //   initialLiquidity: [18566654, 16666666]
  // },
  // {
  //   name: 'ETHUSDSZDX',
  //   symbol: 'ETHUSDCSZDX',
  //   tokens: ["0x3034d7160040936398a240d5Cf990496869eFE87","0x71D0b3950f4AF784Eeb12e49d4bB9207bB56adA4"],
  //   rateProviders: ["0x5a84ad69EcFD52B7988D5b2064d408C77b85d473","0x6AE8D467fBE634e161d34CfF22F478cb0a4CD59d"],
  //   initialLiquidity: [1000, 33333]
  // }
  {
    name: 'BSCUSDSZDX',
    symbol: 'BSCUSDSZDX',
    tokens: ["0x5cD9269A8914a000a85d8f3f4C0702ce79eFbd2a","0x71D0b3950f4AF784Eeb12e49d4bB9207bB56adA4"],
    rateProviders: ["0xBfB7De31D0419f5736703CeBac0AB5a844A83242","0x6AE8D467fBE634e161d34CfF22F478cb0a4CD59d"],
    initialLiquidity: [1000, 33333]
  }
]

const balancerAddress = "0x949039227793f39014572dD495B5C88Dad5cAB62";
const vaultAddress = "0xfE03B59de58847D872335dff0a099B81278F8f09";
const protocolFeePercentagesProviderAddress = "0x4ed3d5d370d8770014D58F99C7518C4e1af9f04c";

async function main() {
  try {
    console.log(`-----------------------------------------------------------`);
    const signers = await ethers.getSigners();
    const deployer = signers[0];

    console.log("Deployer Address: ",deployer.address);

    // Read Balancer ABI
    const balancerContractFactory = await ethers.getContractFactory('BalancerQueries');
    const balancerContract  = balancerContractFactory.attach(balancerAddress);

    // const balancerAbiPath = "/home/nitish/Desktop/l1x-balancer-v2/pkg/pool-stable/artifacts/contracts/BalancerQueries.sol/BalancerQueries.json";
    // const balancerAbiData = fs.readFileSync(balancerAbiPath);
    // const balancerABI = JSON.parse(balancerAbiData).abi;
    // const balancerContract = new ethers.Contract(balancerAddress, balancerABI, deployer);

    // Read Vault ABI

    const vaultFactory = await ethers.getContractFactory('Vault');
    const vaultContract  = vaultFactory.attach(vaultAddress);


    // const vaultAbiPath = "/home/nitish/Desktop/l1x-balancer-v2/pkg/pool-stable/artifacts/contracts/Vault.sol/Vault.json";
    // const vaultAbiData = fs.readFileSync(vaultAbiPath);
    // const vaultABI = JSON.parse(vaultAbiData).abi;
    // const vaultContract = new ethers.Contract(vaultAddress, vaultABI, deployer);

    // ERC20 ABI

    const erc20Factory = await ethers.getContractFactory('L1X_EVM_TOKEN');
    
    // const erc20AbiPath = "/home/nitish/Desktop/l1x-balancer-v2/pkg/pool-stable/artifacts/contracts/wrappedTokenFactory/Erc20Contract.sol/L1X_EVM_TOKEN.json";
    // const erc20AbiData = fs.readFileSync(erc20AbiPath);
    // const erc20ABI = JSON.parse(erc20AbiData).abi;

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
      // await poolContract.deployed();
      await poolContract.deployTransaction.wait();

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

          // const erc20Contract = new ethers.Contract(tokenAddress, erc20ABI, deployer);
          const erc20Contract = erc20Factory.attach(tokenAddress);

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
