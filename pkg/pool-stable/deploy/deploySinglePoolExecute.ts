import { FundManagement, SwapKind } from '@balancer-labs/balancer-js';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
const { ethers } = require('hardhat');

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  const gasLimit = ethers.utils.parseUnits("200", 'gwei'); // 5 gwei

  console.log('Deploying contracts with the account:', deployer.address);

  const erc20Factory = await ethers.getContractFactory('L1X_EVM_TOKEN');

  const ethUsdcParam = {
    _name: 'eth-USDC',
    _symbol: 'eth-USDC',
    _decimals: 18,
    _initialSupply: 100000,
  };
  const ethUsdcContract = await erc20Factory.deploy(ethUsdcParam._name, ethUsdcParam._symbol, ethUsdcParam._decimals, ethUsdcParam._initialSupply, { gasLimit });
  console.log('Contract eth-USDC deployed to:', ethUsdcContract.address);
  console.log("ethUsdcContracts.address ------------ ", await ethUsdcContract.balanceOf(deployer.address))

  const ethL1xParam = {
    _name: 'eth-L1X',
    _symbol: 'eth-L1X',
    _decimals: 18,
    _initialSupply: 100000,
  };
  const ethl1xContract = await erc20Factory.deploy(ethL1xParam._name, ethL1xParam._symbol, ethL1xParam._decimals, ethL1xParam._initialSupply, { gasLimit });

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
  const usdcRateUpdated = await ethUsdcRateProvider.updateRate(ethers.utils.parseEther('1'))
  await usdcRateUpdated.wait();

  // SET L1X RATE
  const ethL1xRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const ethL1xRateProvider = await ethL1xRateProviderFactory.deploy({ gasLimit });
  const l1xRateUpdated = await ethL1xRateProvider.updateRate(ethers.utils.parseEther('0.03'))
  await l1xRateUpdated.wait();
  console.log('eth-l1x rate provider deployed to:', ethL1xRateProvider.address);

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
  console.log("vault.address ------------ ", await ethContract.balanceOf(vault.address))

  const ethPoolId = await ethContract.getPoolId();
  console.log('eth-pool id', ethPoolId);

  console.log("ethUsdcContract.address ------------ ", await ethUsdcContract.balanceOf(deployer.address))
  const transferUsdcToVault = await ethUsdcContract
    .connect(deployer)
    .transfer(vault.address, ethers.utils.parseEther('100'), { gasLimit });
  await transferUsdcToVault.wait();
  console.log('Deposit USDC depositUsdcToVault');
  
  console.log("ethl1xContract.address ------------ ", await ethl1xContract.balanceOf(deployer.address))
  const transferL1xToVault = await ethl1xContract
    .connect(deployer)
    .transfer(vault.address, ethers.utils.parseEther('6666.66'), { gasLimit });
  await transferL1xToVault.wait();
  console.log('Deposit L1X depositL1xToVault');

  // const depositUsdcToVault = await ethUsdcContract
  //   .connect(deployer)
  //   .deposit(ethers.utils.parseEther('100'), vault.address, { gasLimit });
  // await depositUsdcToVault.wait();
  // console.log('Deposit USDC depositUsdcToVault');

  // const depositL1xToVault = await ethl1xContract
  //   .connect(deployer)
  //   .deposit(ethers.utils.parseEther('3333'), vault.address, { gasLimit });
  // await depositL1xToVault.wait();
  // console.log('Deposit L1X depositL1xToVault');

  let ethTokenInfo = await vault.getPoolTokens(ethPoolId);
  const ethGetpool = await vault.getPool(ethPoolId);
  console.log('eth get pool', ethGetpool);
  console.log('eth pool token address', ethTokenInfo);

  console.log('eth-bpt balance before init the pool', bignumberToNumber(await ethContract.balanceOf(vault.address)));

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
      ethAmountsIn.push(ethers.utils.parseUnits('0', 18));
    }
  }
  console.log("ethAmountsIn ----------- ", ethAmountsIn);
  console.log("vault.address ------------ ", await ethContract.balanceOf(vault.address))
  console.log("ethUsdcContract.address ------------ ", await ethContract.balanceOf(ethUsdcContract.address))
  console.log("ethl1xContract.address ------------ ", await ethContract.balanceOf(ethl1xContract.address))


  const totalPoolValue = ethValue + l1xValue;
  console.log(`Total Pool Value in USD BEFORE ------: ${totalPoolValue}`);



  const approveUsdcToVault = await ethUsdcContract
    .connect(deployer)
    .approve(vault.address, ethers.utils.parseEther('100'), { gasLimit });
  await approveUsdcToVault.wait();
  console.log('Approve USDC depositUsdcToVault');
  
  const approveL1xToVault = await ethl1xContract
    .connect(deployer)
    .approve(vault.address, ethers.utils.parseEther('6666.66'), { gasLimit });
  await approveL1xToVault.wait();
  console.log('Approve L1X depositL1xToVault');


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
  console.log("vault.address ------------ ", await ethContract.balanceOf(vault.address))
  console.log("ethUsdcContract.address ------------ ", await ethContract.balanceOf(ethUsdcContract.address))
  console.log("ethl1xContract.address ------------ ", await ethContract.balanceOf(ethl1xContract.address))

  let ethAmountsInJoinPool = [];
  let usdcIndex = -1;
  let l1xIndex = -1;
  let bptIndex = -1;

  for (let i = 0; i < ethTokenInfo[0].length; i++) {
    if (ethTokenInfo[0][i] == ethUsdcContract.address) {
      ethAmountsInJoinPool.push(ethers.utils.parseUnits('20', 18).toString());
      usdcIndex = i;
    } else if (ethTokenInfo[0][i] == ethl1xContract.address) {
      ethAmountsInJoinPool.push(ethers.utils.parseUnits('0', 18).toString());
      l1xIndex = i;
    } else {
      bptIndex = i;
    }
  }

  if (usdcIndex == 2) {
    usdcIndex = bptIndex;
  } else if (l1xIndex == 2) {
    l1xIndex = bptIndex;
  }

  const _responseQueryJoin = await balancerQueries.queryJoin(
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
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(ethAmountsInJoinPool, 0),
    }, { gasLimit }
  );
  console.log("🚀 ~ main ~ _responseQueryJoin:", _responseQueryJoin)

  const approveUsdcToPool = await ethUsdcContract
    .connect(deployer)
    .approve(vault.address, ethers.utils.parseEther('20'), { gasLimit });
  await approveUsdcToPool.wait();
  console.log('Approve USDC depositUsdcToVault');

  const ethTxJoinBob = await vault.joinPool(
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
      fromInternalBalance: true,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(ethAmountsInJoinPool, 0),
    }, { gasLimit }
  );
  await ethTxJoinBob.wait();
  console.log("🚀 ~ main ~ ethTxJoinBob?.hash -- :", ethTxJoinBob?.hash)
  let afterTokenAJoins = await vault.getPoolTokens(ethPoolId);
  console.log('$20 in Token A afterTokenAJoins -- ', afterTokenAJoins);

  const _exitSingleTokenUserData = StablePoolEncoder.exitExactBPTInForOneTokenOut(ethers.utils.parseEther('10'), l1xIndex)
  const _responseQueryExitSingleToken = await balancerQueries.queryExit(
    ethPoolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: ethTokenInfo[0],
      minAmountsOut: [
        0,
        0,
        0
      ],
      toInternalBalance: false,
      userData: _exitSingleTokenUserData,
    }, { gasLimit }
  );
  console.log("🚀 ~ main ~ _responseQueryExitSingleToken: - Token 1 - ", _responseQueryExitSingleToken)

  const ethTxExitBob = await vault.exitPool(
    ethPoolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: ethTokenInfo[0],
      minAmountsOut: [
        0,
        0,
        0
      ],
      toInternalBalance: false,
      userData: _exitSingleTokenUserData,
    }, { gasLimit }
  );
  await ethTxExitBob.wait();
  console.log("🚀 ~ main ~ ethTxExitBob?.hash -- :", ethTxExitBob?.hash)
  let afterTokenBExit = await vault.getPoolTokens(ethPoolId);
  console.log('$10 out Token B afterTokenBExit -- ', afterTokenBExit);

  let ethAmountsInJoinPool1 = [];

  for (let i = 0; i < ethTokenInfo[0].length; i++) {
    if (ethTokenInfo[0][i] == ethUsdcContract.address) {
      ethAmountsInJoinPool1.push(ethers.utils.parseUnits('0', 18).toString());
    } else if (ethTokenInfo[0][i] == ethl1xContract.address) {
      ethAmountsInJoinPool1.push(ethers.utils.parseUnits('20', 18).toString());
    }
  }

  const _responseQueryJoin1 = await balancerQueries.queryJoin(
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
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(ethAmountsInJoinPool1, 0),
    }, { gasLimit }
  );
  console.log("🚀 ~ main ~ _responseQueryJoin1:", _responseQueryJoin1)

  const ethTxJoinBob1 = await vault.joinPool(
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
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(ethAmountsInJoinPool1, 0),
    }, { gasLimit }
  );
  await ethTxJoinBob1.wait();
  console.log("🚀 ~ main ~ ethTxJoinBob1?.hash -- :", ethTxJoinBob1?.hash)
  let afterTokenBJoin = await vault.getPoolTokens(ethPoolId);
  console.log('$10 in Token B afterTokenBJoin -- ', afterTokenBJoin);

  const _exitSingleTokenUserData1 = StablePoolEncoder.exitExactBPTInForOneTokenOut(ethers.utils.parseEther('10'), usdcIndex)
  const _responseQueryExitSingleToken1 = await balancerQueries.queryExit(
    ethPoolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: ethTokenInfo[0],
      minAmountsOut: [
        0,
        0,
        0
      ],
      toInternalBalance: false,
      userData: _exitSingleTokenUserData1,
    }, { gasLimit }
  );
  console.log("🚀 ~ main ~ _responseQueryExitSingleToken1: - Token 1 - ", _responseQueryExitSingleToken1)

  const ethTxExitBob1 = await vault.exitPool(
    ethPoolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: ethTokenInfo[0],
      minAmountsOut: [
        0,
        0,
        0
      ],
      toInternalBalance: false,
      userData: _exitSingleTokenUserData1,
    }, { gasLimit }
  );
  await ethTxExitBob1.wait();
  console.log("🚀 ~ main ~ ethTxExitBob1?.hash -- :", ethTxExitBob1?.hash)
  let afterTokenAExit = await vault.getPoolTokens(ethPoolId);
  console.log('$10 out Token A afterTokenAExit -- ', afterTokenAExit);

  let funds: FundManagement;
  funds = {
    sender: deployer.address,
    recipient: deployer.address,
    fromInternalBalance: false,
    toInternalBalance: false,
  };

  const _responseQuerySwap = await balancerQueries.querySwap(
    {
      poolId: ethPoolId,
      kind: SwapKind.GivenIn,
      assetIn: ethUsdcContract.address,
      assetOut: ethl1xContract.address,
      amount: ethers.utils.parseEther('10'),
      userData: '0x',
    },
    funds,
    { gasLimit }
  );
  console.log("🚀 ~ main ~ _responseQuerySwap: USDC -> L1X", _responseQuerySwap)

  const approveUsdcToSwap = await ethUsdcContract
    .connect(deployer)
    .approve(vault.address, ethers.utils.parseEther('10'), { gasLimit });
  await approveUsdcToSwap.wait();
  console.log('Approve USDC depositUsdcToVault');

  const ethTxSwapBob = await vault.swap(
    {
      poolId: ethPoolId,
      kind: SwapKind.GivenIn,
      assetIn: ethUsdcContract.address,
      assetOut: ethl1xContract.address,
      amount: ethers.utils.parseEther('10'),
      userData: '0x',
    },
    funds,
    0,
    ethers.utils.parseEther('10000000000000000'),
    { gasLimit }
  );
  await ethTxSwapBob.wait();
  console.log("🚀 ~ main ~ ethTxSwapBob?.hash -- :", ethTxSwapBob?.hash)
  let afterTokenASwap = await vault.getPoolTokens(ethPoolId);
  console.log('$10 Token A <-> Token B afterTokenASwap -- ', afterTokenASwap);
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