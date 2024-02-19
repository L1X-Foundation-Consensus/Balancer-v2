import { FundManagement, SwapKind, WeightedPoolEncoder } from '@balancer-labs/balancer-js';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';
import { MAX_UINT256, ZERO_ADDRESS } from '@balancer-labs/v2-helpers/src/constants';
import { actionId } from '@balancer-labs/v2-helpers/src/models/misc/actions';
import { BigNumber, BigNumberish, fp } from '@balancer-labs/v2-helpers/src/numbers';
import { log } from 'console';
import { utils } from 'ethers';
const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  console.log('Deploying contracts with the account:', deployer.address);
  const erc20Factory = await ethers.getContractFactory('OldWrappedToken');
  
  const ethUsdcParam = {
    _name: 'eth-USDC',
    _symbol: 'eth-USDC',
    _decimals: 18,
  };
  const ethUsdcContract = await erc20Factory.deploy(ethUsdcParam._name, ethUsdcParam._symbol, ethUsdcParam._decimals);

  console.log('Contract eth-USDC deployed to:', ethUsdcContract.address);

  const ethUsdtParam = {
    _name: 'eth-USDT',
    _symbol: 'eth-USDT',
    _decimals: 18,
  };
  const ethUsdtContract = await erc20Factory.deploy(ethUsdtParam._name, ethUsdtParam._symbol, ethUsdtParam._decimals);

  console.log('Contract eth-USDT deployed to:', ethUsdtContract.address);

  const ethL1xParam = {
    _name: 'eth-L1X',
    _symbol: 'eth-L1X',
    _decimals: 18,
  };
  const ethl1xContract = await erc20Factory.deploy(ethL1xParam._name, ethL1xParam._symbol, ethL1xParam._decimals);

  console.log('Contract eth-L1X deployed to:', ethl1xContract.address);

  const bscUsdcParam = {
    _name: 'bsc-USDC',
    _symbol: 'bsc-USDC',
    _decimals: 18,
  };
  const bscUsdcContract = await erc20Factory.deploy(bscUsdcParam._name, bscUsdcParam._symbol, bscUsdcParam._decimals);

  console.log('Contract bsc-USDC deployed to:', bscUsdcContract.address);

  const bscUsdtParam = {
    _name: 'bsc-USDT',
    _symbol: 'bsc-USDT',
    _decimals: 18,
  };
  const bscUsdtContract = await erc20Factory.deploy(bscUsdtParam._name, bscUsdtParam._symbol, bscUsdtParam._decimals);

  console.log('Contract bsc-USDT deployed to:', bscUsdtContract.address);

  const bscL1xParam = {
    _name: 'bsc-L1X',
    _symbol: 'bsc-L1X',
    _decimals: 18,
  };
  const bscl1xContract = await erc20Factory.deploy(bscL1xParam._name, bscL1xParam._symbol, bscL1xParam._decimals);

  console.log('Contract bsc-L1X deployed to:', bscl1xContract.address);
  
  const wethFactory = await ethers.getContractFactory('WETH');
  const weth = await wethFactory.deploy();
  console.log('Contract weth deployed to:', weth.address);
  // write weth creation code to file

  const AuthorizerFactory = await ethers.getContractFactory('Authorizer');
  // 100 to soldity bytes32

  const authorizer = await AuthorizerFactory.deploy(deployer.address);
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
  );
  await waitFiveSeconds();
  console.log('Contract vault deployed to:', vault.address);

  const balancerQueriesFactory = await ethers.getContractFactory('BalancerQueries');
  const balancerQueries = await balancerQueriesFactory.deploy(vault.address);
  console.log('Contract balancerQueries deployed to:', balancerQueries.address);
  await waitFiveSeconds();
  // deploy ProtocolFeePercentagesProvider
  const ProtocolFeePercentagesProviderFactory = await ethers.getContractFactory('ProtocolFeePercentagesProvider');
  const protocolFeePercentagesProvider = await ProtocolFeePercentagesProviderFactory.deploy(vault.address, 100, 200);
  console.log('Contract protovol fee deployed to:', protocolFeePercentagesProvider.address);
  await waitFiveSeconds();

  const ethUsdcRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const ethUsdcRateProvider = await ethUsdcRateProviderFactory.deploy();
  console.log('eth-usdc rate provider deployed to:', ethUsdcRateProvider.address);
  await waitFiveSeconds();

  const ethUsdtRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const ethUsdtRateProvider = await ethUsdtRateProviderFactory.deploy();
  console.log('eth-usdt rate provider deployed to:', ethUsdtRateProvider.address);
  await waitFiveSeconds();

  const ethL1xRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const ethL1xRateProvider = await ethL1xRateProviderFactory.deploy();
  console.log('eth-l1x rate provider deployed to:', ethL1xRateProvider.address);
  await waitFiveSeconds();
  await ethL1xRateProvider.updateRate(ethers.utils.parseEther('.5'))
  await waitFiveSeconds();

  const bscUsdcRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const bscUsdcRateProvider = await bscUsdcRateProviderFactory.deploy();
  console.log('bsc-usdc rate provider deployed to:', bscUsdcRateProvider.address);
  await waitFiveSeconds();

  const bscUsdtRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const bscUsdtRateProvider = await bscUsdtRateProviderFactory.deploy();
  console.log('bsc-usdt rate provider deployed to:', bscUsdtRateProvider.address);
  await waitFiveSeconds();

  const bscL1xRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const bscL1xRateProvider = await bscL1xRateProviderFactory.deploy();
  console.log('bsc-l1x rate provider deployed to:', bscL1xRateProvider.address);
  await waitFiveSeconds();
  await bscL1xRateProvider.updateRate(ethers.utils.parseEther('.5'))
  await waitFiveSeconds();
  
  console.log([ethUsdcContract.address, ethUsdtContract.address,ethl1xContract.address, bscUsdcContract.address,bscUsdtContract.address,bscl1xContract.address].sort());
  console.log([ethUsdcRateProvider.address, ethUsdtRateProvider.address, ethL1xRateProvider.address, bscUsdcRateProvider.address,bscUsdtRateProvider.address,bscL1xRateProvider.address].sort());

  const ContractFactory = await ethers.getContractFactory('ComposableStablePool');

  const ethUsdcPoolParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    name: 'L1X/ETHUSDC',
    symbol: 'L1X/ETHUSDC',
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

  const ethUSDCPoolContract = await ContractFactory.deploy(ethUsdcPoolParams, );
  console.log('L1X/ETHUSDC pool deployed to:', ethUSDCPoolContract.address);
  await waitFiveSeconds();
  const ethUSDCPoolId = await ethUSDCPoolContract.getPoolId();
  console.log('L1X/ETHUSDC id', ethUSDCPoolId);

  const ethUsdtPoolParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    name: 'L1X/ETHUSDT',
    symbol: 'L1X/ETHUSDT',
    tokens: [ethUsdtContract.address, ethl1xContract.address].sort(),
    rateProviders: [ethUsdtRateProvider.address, ethL1xRateProvider.address].sort(),
    tokenRateCacheDurations: [0, 0],
    exemptFromYieldProtocolFeeFlags: [false, false],
    amplificationParameter: BigInt('1'),
    swapFeePercentage: fp(0.1),
    pauseWindowDuration: 0,
    bufferPeriodDuration: 0,
    owner: deployer.address,
    version: '1.0.0',
  };

  const ethUSDTPoolContract = await ContractFactory.deploy(ethUsdtPoolParams, );
  console.log('L1X/ETHUSDT pool deployed to:', ethUSDTPoolContract.address);
  await waitFiveSeconds();
  const ethUSDTPoolId = await ethUSDTPoolContract.getPoolId();
  console.log('L1X/ETHUSDT id', ethUSDTPoolId);

  const bscUSDCPoolParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    name: 'L1X/BSCUSDC',
    symbol: 'L1X/BSCUSDC',
    tokens: [bscUsdcContract.address, bscl1xContract.address].sort(),
    rateProviders: [bscUsdcRateProvider.address, bscL1xRateProvider.address].sort(),
    tokenRateCacheDurations: [0, 0],
    exemptFromYieldProtocolFeeFlags: [false, false],
    amplificationParameter: BigInt('1'),
    swapFeePercentage: fp(0.1),
    pauseWindowDuration: 0,
    bufferPeriodDuration: 0,
    owner: deployer.address,
    version: '1.0.0',
  };

  const bscUSDCPoolContract = await ContractFactory.deploy(bscUSDCPoolParams, );
  console.log('L1X/BSCUSDC pool deployed to:', bscUSDCPoolContract.address);
  await waitFiveSeconds();
  const bscUSDCPoolId = await bscUSDCPoolContract.getPoolId();
  console.log('L1X/BSCUSDC id', bscUSDCPoolId);

  const bscUSDTPoolParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    name: 'L1X/BSCUSDT',
    symbol: 'L1X/BSCUSDT',
    tokens: [bscUsdtContract.address, bscl1xContract.address].sort(),
    rateProviders: [bscUsdtRateProvider.address, bscL1xRateProvider.address].sort(),
    tokenRateCacheDurations: [0, 0],
    exemptFromYieldProtocolFeeFlags: [false, false],
    amplificationParameter: BigInt('1'),
    swapFeePercentage: fp(0.1),
    pauseWindowDuration: 0,
    bufferPeriodDuration: 0,
    owner: deployer.address,
    version: '1.0.0',
  };

  const bscUSDTPoolContract = await ContractFactory.deploy(bscUSDTPoolParams, );
  console.log('L1X/BSCUSDT pool deployed to:', bscUSDTPoolContract.address);
  await waitFiveSeconds();
  const bscUSDTPoolId = await bscUSDTPoolContract.getPoolId();
  console.log('L1X/BSCUSDT id', bscUSDTPoolId);

  await ethUsdcContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vault.address, );
  await waitFiveSeconds();
  console.log('1');

  await ethUsdtContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vault.address, );
  await waitFiveSeconds();
  console.log('1');

  await ethl1xContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('2000000000'), deployer.address, vault.address, );
  await waitFiveSeconds();
  console.log('1');

  await bscUsdcContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vault.address, );
  await waitFiveSeconds();
  console.log('1');

  await bscUsdtContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vault.address, );
  await waitFiveSeconds();
  console.log('1');

  await bscl1xContract
  .connect(deployer)
  .deposit(ethers.utils.parseEther('2000000000'), deployer.address, vault.address, );
  await waitFiveSeconds();
  console.log('1');

  let ethUSDCTokenInfo = await vault.getPoolTokens(ethUSDCPoolId);
  await waitFiveSeconds();
  const ethUSDCGetpool = await vault.getPool(ethUSDCPoolId);
  console.log('L1X/ETHUSDC pool ', ethUSDCGetpool);
  console.log('L1X/ETHUSDC pool token address', ethUSDCTokenInfo[0]);

  let ethUSDTTokenInfo = await vault.getPoolTokens(ethUSDTPoolId);
  await waitFiveSeconds();
  const ethUSDTGetpool = await vault.getPool(ethUSDTPoolId);
  console.log('L1X/ETHUSDT pool ', ethUSDTGetpool);
  console.log('L1X/ETHUSDT pool token address', ethUSDTTokenInfo[0]);

  let bscUSDCTokenInfo = await vault.getPoolTokens(bscUSDCPoolId);
  await waitFiveSeconds();
  const bscUSDCGetpool = await vault.getPool(bscUSDCPoolId);
  console.log('L1X/BSCUSDC pool ', bscUSDCGetpool);
  console.log('L1X/BSCUSDC pool token address', bscUSDCTokenInfo[0]);

  let bscUSDTTokenInfo = await vault.getPoolTokens(bscUSDTPoolId);
  await waitFiveSeconds();
  const bscUSDTGetpool = await vault.getPool(bscUSDTPoolId);
  console.log('L1X/BSCUSDT pool ', bscUSDTGetpool);
  console.log('L1X/BSCUSDT pool token address', bscUSDTTokenInfo[0]);

  console.log('eth-usdc bpt balance before init the pool', bignumberToNumber(await ethUSDCPoolContract.balanceOf(deployer.address)));
  console.log('eth-usdt bpt balance before init the pool', bignumberToNumber(await ethUSDTPoolContract.balanceOf(deployer.address)));
  console.log('bsc-usdc bpt deployer balance before pool initiation', bignumberToNumber(await bscUSDCPoolContract.balanceOf(deployer.address)));
  console.log('bsc-usdt bpt deployer balance before pool initiation', bignumberToNumber(await bscUSDTPoolContract.balanceOf(deployer.address)));
  

  let ethUsdcAmountsIn = [];
  for (let i = 0; i < ethUSDCTokenInfo[0].length; i++) {
    if (ethUSDCTokenInfo[0][i] == ethUsdcContract.address) {
      ethUsdcAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
    } else if (ethUSDCTokenInfo[0][i] == ethl1xContract.address) {
      ethUsdcAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
    } else {
      ethUsdcAmountsIn.push(ethers.utils.parseUnits('0', 18));
    }
  }

  await waitFiveSeconds();

  const ethUSDCTxJoin = await vault.joinPool(
    ethUSDCPoolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: ethUSDCTokenInfo[0],
      maxAmountsIn: [
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
      ],
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinInit(ethUsdcAmountsIn),
    },
    
  );
  await ethUSDCTxJoin.wait();
  console.log('join pool info', ethUSDCTxJoin)
  await waitFiveSeconds();

  let ethUsdtAmountsIn = [];
  for (let i = 0; i < ethUSDTTokenInfo[0].length; i++) {
    if (ethUSDTTokenInfo[0][i] == ethUsdtContract.address) {
      ethUsdtAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
    } else if (ethUSDTTokenInfo[0][i] == ethl1xContract.address) {
      ethUsdtAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
    } else {
      ethUsdtAmountsIn.push(ethers.utils.parseUnits('0', 18));
    }
  }

  const ethUSDTTxJoin = await vault.joinPool(
    ethUSDTPoolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: ethUSDTTokenInfo[0],
      maxAmountsIn: [
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
      ],
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinInit(ethUsdtAmountsIn),
    },
    
  );
  await ethUSDTTxJoin.wait();
  await waitFiveSeconds();

  let bscUsdcAmountsIn = [];
  for (let i = 0; i < bscUSDCTokenInfo[0].length; i++) {
    if (bscUSDCTokenInfo[0][i] == bscUsdcContract.address) {
      bscUsdcAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
    } else if (bscUSDCTokenInfo[0][i] == bscl1xContract.address) {
      bscUsdcAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
    } else {
      bscUsdcAmountsIn.push(ethers.utils.parseUnits('0', 18));
    }
  }

  const bscUSDCTxJoin = await vault.joinPool(
    bscUSDCPoolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: bscUSDCTokenInfo[0],
      maxAmountsIn: [
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
      ],
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinInit(bscUsdcAmountsIn),
    },
    
  );
  await bscUSDCTxJoin.wait();
  await waitFiveSeconds();

  let bscUsdtAmountsIn = [];
  for (let i = 0; i < bscUSDTTokenInfo[0].length; i++) {
    if (bscUSDTTokenInfo[0][i] == bscUsdtContract.address) {
      bscUsdtAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
    } else if (bscUSDTTokenInfo[0][i] == bscl1xContract.address) {
      bscUsdtAmountsIn.push(ethers.utils.parseUnits('1000000000', 18));
    } else {
      bscUsdtAmountsIn.push(ethers.utils.parseUnits('0', 18));
    }
  }

  const bscUSDTTxJoin = await vault.joinPool(
    bscUSDTPoolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: bscUSDTTokenInfo[0],
      maxAmountsIn: [
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
      ],
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinInit(bscUsdtAmountsIn),
    },
    
  );
  await bscUSDTTxJoin.wait();
  await waitFiveSeconds();

  console.log('eth-usdc bpt deployer balance after init the pool', bignumberToNumber(await ethUSDCPoolContract.balanceOf(deployer.address)));
  console.log('eth-usdt bpt deployer balance after init the pool', bignumberToNumber(await ethUSDTPoolContract.balanceOf(deployer.address)));
  console.log('bsc-usdc bpt deployer balance after pool initiation', bignumberToNumber(await bscUSDTPoolContract.balanceOf(deployer.address)));
  console.log('bsc-usdt bpt deployer balance after pool initiation', bignumberToNumber(await bscUSDCPoolContract.balanceOf(deployer.address)));

  await waitFiveSeconds();

  let ethUSDCMax = [];
  let ethUSDCAmountsInBob = [];
  let ethUSDCTokenInfoBob = [];

  for (let i = 0; i < ethUSDCTokenInfo[0].length; i++) {
    if (ethUSDCTokenInfo[0][i] != ethUSDCPoolContract.address) {
      ethUSDCTokenInfoBob.push(ethUSDCTokenInfo[0][i]);
      ethUSDCAmountsInBob.push(ethers.utils.parseUnits('2', 18));
      ethUSDCMax.push(MAX_UINT256);
    } else {
      ethUSDCTokenInfoBob.push(ethUSDCTokenInfo[0][i]);
      ethUSDCMax.push(MAX_UINT256);
    }
  }

  const ethUSDCTxJoinBob = await vault.joinPool(
    ethUSDCPoolId, // pool id
    deployer.address,
    bob.address,
    {
      assets: ethUSDCTokenInfoBob,
      maxAmountsIn: ethUSDCMax,
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(ethUSDCAmountsInBob, 0),
    }
  );
  await ethUSDCTxJoinBob.wait();
  await waitFiveSeconds();
  console.log('eth-usdc join pool bob',ethUSDCTxJoinBob);

  let ethUSDTMax = [];
  let ethUSDTAmountsInBob = [];
  let ethUSDTTokenInfoBob = [];

  for (let i = 0; i < ethUSDTTokenInfo[0].length; i++) {
    if (ethUSDTTokenInfo[0][i] != ethUSDTPoolContract.address) {
      ethUSDTTokenInfoBob.push(ethUSDTTokenInfo[0][i]);
      ethUSDTAmountsInBob.push(ethers.utils.parseUnits('2', 18));
      ethUSDTMax.push(MAX_UINT256);
    } else {
      ethUSDTTokenInfoBob.push(ethUSDTTokenInfo[0][i]);
      ethUSDTMax.push(MAX_UINT256);
    }
  }

  const ethUSDTTxJoinBob = await vault.joinPool(
    ethUSDTPoolId, // pool id
    deployer.address,
    bob.address,
    {
      assets: ethUSDTTokenInfoBob,
      maxAmountsIn: ethUSDTMax,
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(ethUSDTAmountsInBob, 0),
    }
  );
  await ethUSDTTxJoinBob.wait();
  await waitFiveSeconds();
  console.log('eth-usdt join pool bob',ethUSDTTxJoinBob);

  let bscUSDCMax = [];
  let bscUSDCAmountsInBob = [];
  let bscUSDCTokenInfoBob = [];

  for (let i = 0; i < bscUSDCTokenInfo[0].length; i++) {
    if (bscUSDCTokenInfo[0][i] != bscUSDCPoolContract.address) {
      bscUSDCTokenInfoBob.push(bscUSDCTokenInfo[0][i]);
      bscUSDCAmountsInBob.push(ethers.utils.parseUnits('2', 18));
      bscUSDCMax.push(MAX_UINT256);
    } else {
      bscUSDCTokenInfoBob.push(bscUSDCTokenInfo[0][i]);
      bscUSDCMax.push(MAX_UINT256);
    }
  }

  const bscUSDCTxJoinBob = await vault.joinPool(
    bscUSDCPoolId, // pool id
    deployer.address,
    bob.address,
    {
      assets: bscUSDCTokenInfoBob,
      maxAmountsIn: bscUSDCMax,
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(bscUSDCAmountsInBob, 0),
    }
  );
  await bscUSDCTxJoinBob.wait();
  console.log('bsc-usdc join pool bob',bscUSDCTxJoinBob);
  await waitFiveSeconds();

  let bscUSDTMax = [];
  let bscUSDTAmountsInBob = [];
  let bscUSDTTokenInfoBob = [];

  for (let i = 0; i < bscUSDTTokenInfo[0].length; i++) {
    if (bscUSDTTokenInfo[0][i] != bscUSDTPoolContract.address) {
      bscUSDTTokenInfoBob.push(bscUSDTTokenInfo[0][i]);
      bscUSDTAmountsInBob.push(ethers.utils.parseUnits('2', 18));
      bscUSDTMax.push(MAX_UINT256);
    } else {
      bscUSDTTokenInfoBob.push(bscUSDTTokenInfo[0][i]);
      bscUSDTMax.push(MAX_UINT256);
    }
  }

  const bscUSDTTxJoinBob = await vault.joinPool(
    bscUSDTPoolId, // pool id
    deployer.address,
    bob.address,
    {
      assets: bscUSDTTokenInfoBob,
      maxAmountsIn: bscUSDTMax,
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(bscUSDTAmountsInBob, 0),
    }
  );
  await bscUSDTTxJoinBob.wait();
  console.log('bsc-usdt join pool bob',bscUSDTTxJoinBob);
  await waitFiveSeconds();

  console.log('eth-usdc bpt bob balance after bob joining the pool', bignumberToNumber(await ethUSDCPoolContract.balanceOf(bob.address)));
  console.log('eth-usdt bpt bob balance after bob joining the pool', bignumberToNumber(await ethUSDTPoolContract.balanceOf(bob.address)));
  console.log('bsc-usdc bpt bob balance after bob joining the pool', bignumberToNumber(await bscUSDCPoolContract.balanceOf(bob.address)));
  console.log('bsc-usdt bpt bob balance after bob joining the pool', bignumberToNumber(await bscUSDTPoolContract.balanceOf(bob.address)));

  const actionSwap = await actionId(vault, 'swap');
  await authorizer.grantRole(actionSwap, '0xffa375cdd34a73fc01e450ecfb22f64e69b92c09');

  const actionJoin = await actionId(vault, 'joinPool');
  await authorizer.grantRole(actionJoin, '460ac291425bdf2bfab1c5864c2ce6f3debcd725');

  const actionExit = await actionId(vault, 'exitPool');
  await authorizer.grantRole(actionExit, '0x6ec4adc9a2459639b60787b744b9d46623d2ebd5');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
export function toBytes32(num: any) {
  let hex = num.toString(16); // Convert number to hexadecimal
  while (hex.length < 64) {
    // Pad with zeros until it's 64 characters (32 bytes)
    hex = '0' + hex;
  }
  return '0x' + hex;
}

export function bignumberToNumber(num: any) {
  return num.div(ethers.BigNumber.from(10).pow(18)).toNumber();
}

export const CHAINED_REFERENCE_TEMP_PREFIX = 'ba10'; // Temporary reference: it is deleted after a read.
export const CHAINED_REFERENCE_READONLY_PREFIX = 'ba11'; // Read-only reference: it is not deleted after a read.
export function toChainedReference(key: BigNumberish, isTemporary = true): BigNumber {
  const prefix = isTemporary ? CHAINED_REFERENCE_TEMP_PREFIX : CHAINED_REFERENCE_READONLY_PREFIX;
  // The full padded prefix is 66 characters long, with 64 hex characters and the 0x prefix.
  const paddedPrefix = `0x${prefix}${'0'.repeat(64 - prefix.length)}`;

  return BigNumber.from(paddedPrefix).add(key);
}

export interface Input {
  dumpPath: string;
  owner: string;
  vault: string;
  protocol: string;
  erc20: string;
  erc201: string;
  rateProvider: string;
  rateProvider1: string;
  authorizer: string;
  weth: string;
  approveCall: ApproveCall;
  TokenListByPoolIdCall: TokenListByPoolIDCall;
  initPoolCall: InitPoolCall;
  joinPoolCall: JoinPoolCall;
}

export interface TokenListByPoolIDCall {
  poolId: string;
}

export interface ApproveCall {
  amount: string;
}

export interface InitPoolCall {
  tokenInfo: string[];
  maxAmountsIn: string[];
  amountsIn: string[];
  address: string;
}

export interface JoinPoolCall {
  amountsIn: string[];
  maxAmountsIn: string[];
  tokenInfo: string[];
  address: string;
}
function waitFiveSeconds() {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 10000);
  });
}
