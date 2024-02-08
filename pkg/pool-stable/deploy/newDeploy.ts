import { FundManagement, SwapKind, WeightedPoolEncoder } from '@balancer-labs/balancer-js';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';
import { MAX_UINT256, ZERO_ADDRESS } from '@balancer-labs/v2-helpers/src/constants';
import { actionId } from '@balancer-labs/v2-helpers/src/models/misc/actions';
import { BigNumber, BigNumberish, fp } from '@balancer-labs/v2-helpers/src/numbers';
import { log } from 'console';
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

  const bscUsdcParam = {
    _name: 'bsc-USDC',
    _symbol: 'bsc-USDC',
    _decimals: 18,
  };
  const bscUsdcContract = await erc20Factory.deploy(bscUsdcParam._name, bscUsdcParam._symbol, bscUsdcParam._decimals);

  console.log('Contract bsc-USDC deployed to:', bscUsdcContract.address);

  const ethL1xParam = {
    _name: 'eth-L1X',
    _symbol: 'eth-L1X',
    _decimals: 18,
  };
  const ethl1xContract = await erc20Factory.deploy(ethL1xParam._name, ethL1xParam._symbol, ethL1xParam._decimals);

  console.log('Contract eth-L1X deployed to:', ethl1xContract.address);

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

  const bscUsdcRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const bscUsdcRateProvider = await bscUsdcRateProviderFactory.deploy();
  console.log('bsc-usdc rate provider deployed to:', bscUsdcRateProvider.address);
  await waitFiveSeconds();

  const ethL1xRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const ethL1xRateProvider = await ethL1xRateProviderFactory.deploy();
  console.log('eth-l1x rate provider deployed to:', ethL1xRateProvider.address);
  await waitFiveSeconds();

  const bscL1xRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const bscL1xRateProvider = await bscL1xRateProviderFactory.deploy();
  console.log('bsc-l1x rate provider deployed to:', bscL1xRateProvider.address);
  await waitFiveSeconds();
  
  console.log([ethUsdcContract.address, ethl1xContract.address, bscUsdcContract.address,bscl1xContract.address].sort());
  console.log([ethUsdcRateProvider.address, ethL1xRateProvider.address, bscUsdcRateProvider.address,bscL1xRateProvider.address].sort());

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

  const ethContract = await ContractFactory.deploy(ethPoolParams, );
  console.log('eth-pool deployed to:', ethContract.address);
  await waitFiveSeconds();
  const ethPoolId = await ethContract.getPoolId();
  console.log('eth-pool id', ethPoolId);

  const bscPoolParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    name: 'BSC pool',
    symbol: 'MSP',
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

  const bscContract = await ContractFactory.deploy(bscPoolParams, );
  console.log('bsc-pool deployed to:', bscContract.address);
  await waitFiveSeconds();
  const bscPoolId = await bscContract.getPoolId();
  console.log('bsc-pool id', bscPoolId);

  await ethUsdcContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vault.address, );
  await waitFiveSeconds();
  console.log('1');

  await ethl1xContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vault.address, );
  await waitFiveSeconds();
  console.log('1');

  await bscUsdcContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vault.address, );
  await waitFiveSeconds();
  console.log('1');

  await bscl1xContract
  .connect(deployer)
  .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vault.address, );
  await waitFiveSeconds();
  console.log('1');

  let ethTokenInfo = await vault.getPoolTokens(ethPoolId);
  await waitFiveSeconds();

  const ethGetpool = await vault.getPool(ethPoolId);
  console.log('eth get pool', ethGetpool);
  console.log('eth pool token address', ethTokenInfo[0]);

  let bscTokenInfo = await vault.getPoolTokens(bscPoolId);
  await waitFiveSeconds();

  const bscGetpool = await vault.getPool(bscPoolId);
  console.log('bsc get pool', bscGetpool);
  console.log('bsc pool token address', bscTokenInfo[0]);

  let amountsIn = [];
  for (let i = 0; i < ethTokenInfo[0].length; i++) {
    amountsIn.push(ethers.utils.parseUnits('500000000', 18));
  }

  console.log('eth-bpt balance before init the pool', bignumberToNumber(await ethContract.balanceOf(deployer.address)));
  console.log('bsc-bpt deployer balance before pool initiation', bignumberToNumber(await bscContract.balanceOf(deployer.address)));

  await waitFiveSeconds();

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
      userData: StablePoolEncoder.joinInit(amountsIn),
    },
    
  );
  await ethTxJoin.wait();

  await waitFiveSeconds();

  const bscTxJoin = await vault.joinPool(
    bscPoolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: bscTokenInfo[0],
      maxAmountsIn: [
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
      ],
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinInit(amountsIn),
    },
    
  );
  await bscTxJoin.wait();

  console.log('eth-bpt balance after init the pool', bignumberToNumber(await ethContract.balanceOf(deployer.address)));
  console.log('bsc-bpt deployer balance after pool initiation', bignumberToNumber(await bscContract.balanceOf(deployer.address)));
  await waitFiveSeconds();

  let ethMax = [];
  let ethAmountsInBob = [];
  let ethTokenInfoBob = [];

  for (let i = 0; i < ethTokenInfo[0].length; i++) {
    if (ethTokenInfo[0][i] != ethContract.address) {
      ethTokenInfoBob.push(ethTokenInfo[0][i]);
      ethAmountsInBob.push(ethers.utils.parseUnits('10000', 18));
      ethMax.push(MAX_UINT256);
    } else {
      ethTokenInfoBob.push(ethTokenInfo[0][i]);
      ethMax.push(MAX_UINT256);
    }
  }

  const ethTxJoinBob = await vault.joinPool(
    ethPoolId, // pool id
    deployer.address,
    bob.address,
    {
      assets: ethTokenInfoBob,
      maxAmountsIn: ethMax,
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(ethAmountsInBob, 0),
    }
  );
  await ethTxJoinBob.wait();
  await waitFiveSeconds();
  console.log('eth-join pool bob',ethTxJoinBob);

  let bscMax = [];
  let bscAmountsInBob = [];
  let bscTokenInfoBob = [];

  for (let i = 0; i < bscTokenInfo[0].length; i++) {
    if (bscTokenInfo[0][i] != bscContract.address) {
      bscTokenInfoBob.push(bscTokenInfo[0][i]);
      bscAmountsInBob.push(ethers.utils.parseUnits('10000', 18));
      bscMax.push(MAX_UINT256);
    } else {
      bscTokenInfoBob.push(bscTokenInfo[0][i]);
      bscMax.push(MAX_UINT256);
    }
  }

  const bscTxJoinBob = await vault.joinPool(
    bscPoolId, // pool id
    deployer.address,
    bob.address,
    {
      assets: bscTokenInfoBob,
      maxAmountsIn: bscMax,
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(bscAmountsInBob, 0),
    }
  );
  await bscTxJoinBob.wait();
  console.log('bsc-join pool bob',bscTxJoinBob);
  await waitFiveSeconds();

  console.log('eth-bpt bob balance after bob joining the pool', bignumberToNumber(await ethContract.balanceOf(bob.address)));
  console.log('bsc-bpt bob balance after bob joining the pool', bignumberToNumber(await bscContract.balanceOf(bob.address)));


  const actionSwap = await actionId(vault, 'swap');
  await authorizer.grantRole(actionSwap, '0xffa375cdd34a73fc01e450ecfb22f64e69b92c09');

  const actionJoin = await actionId(vault, 'joinPool');
  await authorizer.grantRole(actionJoin, '0x5138e047ef8c45061591b6296133436e37e72b19');

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
