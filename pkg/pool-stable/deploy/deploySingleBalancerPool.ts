import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';
import { MAX_UINT256 } from '@balancer-labs/v2-helpers/src/constants';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { parseEther } from 'ethers/lib/utils';
const { ethers } = require('hardhat');

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  const gasLimit = undefined; // 5 gwei

  console.log('Deploying contracts with the account:', deployer.address);

  const erc20Factory = await ethers.getContractFactory('OldWrappedToken');
  
  const ethUsdcParam = {
    _name: 'eth-USDC',
    _symbol: 'eth-USDC',
    _decimals: 18,
  };
  const ethUsdcContract = await erc20Factory.deploy(ethUsdcParam._name, ethUsdcParam._symbol, ethUsdcParam._decimals, { gasLimit });

  console.log('Contract eth-USDC deployed to:', ethUsdcContract.address);

  const ethL1xParam = {
    _name: 'eth-L1X',
    _symbol: 'eth-L1X',
    _decimals: 18,
  };
  const ethl1xContract = await erc20Factory.deploy(ethL1xParam._name, ethL1xParam._symbol, ethL1xParam._decimals, { gasLimit });

  console.log('Contract eth-L1X deployed to:', ethl1xContract.address);
 
  const wethFactory = await ethers.getContractFactory('WETH');
  const weth = await wethFactory.deploy({ gasLimit });
  console.log('Contract weth deployed to:', weth.address);
  // write weth creation code to file

  const AuthorizerFactory = await ethers.getContractFactory('Authorizer');
  const authorizer = await AuthorizerFactory.deploy(deployer.address, { gasLimit });
  console.log('Contract authorizer deployed to:', authorizer.address);
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
    vaultParams.bufferPeriodDuration,
    { gasLimit }
  );
  console.log('Contract vault deployed to:', vault.address);

  const balancerQueriesFactory = await ethers.getContractFactory('BalancerQueries');
  const balancerQueries = await balancerQueriesFactory.deploy(vault.address, { gasLimit });
  console.log('Contract balancerQueries deployed to:', balancerQueries.address);

  const ProtocolFeePercentagesProviderFactory = await ethers.getContractFactory('ProtocolFeePercentagesProvider');
  const protocolFeePercentagesProvider = await ProtocolFeePercentagesProviderFactory.deploy(vault.address, 100, 200, { gasLimit });
  console.log('Contract protovol fee deployed to:', protocolFeePercentagesProvider.address);

  // SET USDC RATE
  const ethUsdcRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const ethUsdcRateProvider = await ethUsdcRateProviderFactory.deploy({ gasLimit });
  console.log('eth-usdc rate provider deployed to:', ethUsdcRateProvider.address);
  await ethUsdcRateProvider.updateRate(ethers.utils.parseEther('1'))

  // SET L1X RATE
  const ethL1xRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const ethL1xRateProvider = await ethL1xRateProviderFactory.deploy({ gasLimit });
  console.log('eth-l1x rate provider deployed to:', ethL1xRateProvider.address);
  await ethL1xRateProvider.updateRate(ethers.utils.parseEther('0.03'))
  
  console.log([ethUsdcContract.address, ethl1xContract.address].sort());
  console.log([ethUsdcRateProvider.address, ethL1xRateProvider.address].sort());

  const ContractFactory = await ethers.getContractFactory('ComposableStablePool');

  const ethPoolParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    name: 'ETH pool',
    symbol: 'MSP',
    tokens: [ethUsdcContract.address, ethl1xContract.address].sort(),
    rateProviders: [ethUsdcRateProvider.address, ethL1xRateProvider.address].sort(),
    tokenRateCacheDurations: [0, 0],
    exemptFromYieldProtocolFeeFlags: [false, false],
    amplificationParameter: BigInt('1'),
    swapFeePercentage: fp(0.1),
    pauseWindowDuration: 0,
    bufferPeriodDuration: 0,
    owner: deployer.address,
    version: '1.0.0',
  };

  const ethContract = await ContractFactory.deploy(ethPoolParams, { gasLimit });
  console.log('eth-pool deployed to:', ethContract.address);
  await waitFiveSeconds();
  console.log("vault.address ------------ ", await ethContract.balanceOf(vault.address))
  
  const ethPoolId = await ethContract.getPoolId();
  console.log('eth-pool id', ethPoolId);

  await ethUsdcContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('100'), deployer.address, vault.address , { gasLimit });
  await waitFiveSeconds();
  console.log('Deposit USDC');

  await ethl1xContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('3333'), deployer.address, vault.address , { gasLimit });
  await waitFiveSeconds();
  console.log('Deposit L1X');

  let ethTokenInfo = await vault.getPoolTokens(ethPoolId);
  const ethGetpool = await vault.getPool(ethPoolId);
  console.log('eth get pool', ethGetpool);
  console.log('eth pool token address', ethTokenInfo);

  console.log('eth-bpt balance before init the pool', bignumberToNumber(await ethContract.balanceOf(deployer.address)));


  let ethValue = 0;
  let l1xValue = 0;
  const ethRate = await ethUsdcRateProvider.getRate();
  const l1xRate = await ethL1xRateProvider.getRate();

  let ethAmountsIn = [];
  for (let i = 0; i < ethTokenInfo[0].length; i++) {
    if (ethTokenInfo[0][i] == ethUsdcContract.address) {
      ethAmountsIn.push(ethers.utils.parseUnits('100', 18));
      ethValue = (ethTokenInfo[1][i] * ethRate) / 1e18;
    } else if (ethTokenInfo[0][i] == ethl1xContract.address) {
      ethAmountsIn.push(ethers.utils.parseUnits('3333', 18));
      l1xValue = (ethTokenInfo[1][i] * l1xRate) / 1e18;
    } else {
      ethAmountsIn.push(ethers.utils.parseUnits('500', 18));
    }
  }
  console.log("vault.address ------------ ", await ethContract.balanceOf(vault.address))


  const totalPoolValue = ethValue + l1xValue;
  console.log(`Total Pool Value in USD BEFORE ------: ${totalPoolValue}`);


  const ethTxJoin = await vault.joinPool(
    ethPoolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: ethTokenInfo[0],
      maxAmountsIn: [
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
      ],
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinInit(ethAmountsIn),
    }, { gasLimit }
  );
  await ethTxJoin.wait();
  console.log('eth-bpt balance after init the pool', bignumberToNumber(await ethContract.balanceOf(deployer.address)));

  let ethValue1 = 0;
  let l1xValue1 = 0;
  const ethRate1 = await ethUsdcRateProvider.getRate();
  const l1xRate1 = await ethL1xRateProvider.getRate();
  let ethAmountsInJoinPool = [];

  for (let i = 0; i < ethTokenInfo[0].length; i++) {
    if (ethTokenInfo[0][i] == ethUsdcContract.address) {
        ethAmountsInJoinPool.push(ethers.utils.parseUnits('20', 18).toString());
      ethValue1 = (ethTokenInfo[1][i] * ethRate1) / 1e18;
    } else if (ethTokenInfo[0][i] == ethl1xContract.address) {
        ethAmountsInJoinPool.push(ethers.utils.parseUnits('0', 18).toString());
      l1xValue1 = (ethTokenInfo[1][i] * l1xRate1) / 1e18;
    }
  }

  const totalPoolValue1 = ethValue1 + l1xValue1;
  console.log(`Total Pool Value in USD AFTER ------ : ${totalPoolValue1}`);
  const _responseQueryJoin = await balancerQueries.queryJoin(
    ethPoolId, // pool id
    deployer.address,
    bob.address,
    {
      assets: ethTokenInfo[0],
      maxAmountsIn: [
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
      ],
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(ethAmountsInJoinPool, 0),
    }, { gasLimit }
  );
  console.log("🚀 ~ main ~ _responseQueryJoin:", _responseQueryJoin)
  console.log("vault.address ------------ ", await ethContract.balanceOf(vault.address))
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

function waitFiveSeconds() {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 10000);
  });
}