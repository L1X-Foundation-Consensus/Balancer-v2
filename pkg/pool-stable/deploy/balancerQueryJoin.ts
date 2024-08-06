import { FundManagement, SwapKind, WeightedPoolEncoder } from '@balancer-labs/balancer-js/src';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';
import { MAX_UINT256, ZERO_ADDRESS } from '@balancer-labs/v2-helpers/src/constants';
import { actionId } from '@balancer-labs/v2-helpers/src/models/misc/actions';
import { BigNumber, BigNumberish, fp } from '@balancer-labs/v2-helpers/src/numbers';
import { log } from 'console';
import { Contract, Wallet } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
const { ethers } = require('hardhat');
const fs = require('fs');

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

  const ethUsdcRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const ethUsdcRateProvider = await ethUsdcRateProviderFactory.deploy({ gasLimit });
  console.log('eth-usdc rate provider deployed to:', ethUsdcRateProvider.address);
  await ethUsdcRateProvider.updateRate(ethers.utils.parseEther('1'))

  const ethL1xRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const ethL1xRateProvider = await ethL1xRateProviderFactory.deploy({ gasLimit });
  console.log('eth-l1x rate provider deployed to:', ethL1xRateProvider.address);
  await ethL1xRateProvider.updateRate(ethers.utils.parseEther('0.031'))
  
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
  
  const ethPoolId = await ethContract.getPoolId();
  console.log('eth-pool id', ethPoolId);

  await ethUsdcContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vault.address , { gasLimit });
  await waitFiveSeconds();
  console.log('1');

  await ethl1xContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vault.address , { gasLimit });
  await waitFiveSeconds();
  console.log('1');

  // const allowance = await ethUsdcContract
  //   .connect(deployer)
  //   .allowance(deployer.address, vault.address);
  // await waitFiveSeconds();
  // console.log('Allowance', allowance);

  // const approval = await ethUsdcContract
  //   .connect(deployer)
  //   .approve(vault.address, ethers.utils.parseEther('10'), deployer.address, { gasLimit });
  // await waitFiveSeconds();
  // console.log('Approval', approval);

  let ethTokenInfo = await vault.getPoolTokens(ethPoolId);
  const ethGetpool = await vault.getPool(ethPoolId);
  console.log('eth get pool', ethGetpool);
  console.log('eth pool token address', ethTokenInfo);

  let amountsIn = [];
  for (let i = 0; i < ethTokenInfo[0].length; i++) {
    amountsIn.push(ethers.utils.parseUnits('500000000', 18));
  }

  console.log('eth-bpt balance before init the pool', bignumberToNumber(await ethContract.balanceOf(deployer.address)));

  console.log("-------------- ", 
    amountsIn,
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
    }, { gasLimit })

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
    }, { gasLimit }
  );
  await ethTxJoin.wait();
  console.log('eth-bpt balance after init the pool', bignumberToNumber(await ethContract.balanceOf(deployer.address)));

  await waitFiveSeconds();

  let ethMax = [];
  let ethMin = [];
  let ethAmountsInBob = [];
  let ethTokenInfoBob = [];
  let ethPoolAssets = [];

  for (let i = 0; i < ethTokenInfo[0].length; i++) {
    if (ethTokenInfo[0][i] != ethContract.address) {
      ethTokenInfoBob.push(ethTokenInfo[0][i]);
      ethAmountsInBob.push(ethers.utils.parseUnits('10000', 18));
      ethMax.push(MAX_UINT256);
      ethMin.push(BigInt(1));
      ethPoolAssets.push(ethTokenInfo[0][i]);
    } else {
      ethTokenInfoBob.push(ethTokenInfo[0][i]);
      ethMax.push(MAX_UINT256);
      ethMin.push(BigInt(1));
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
    }, { gasLimit }
  );
  await ethTxJoinBob.wait();

  console.log('eth-bpt bob balance after bob joining the pool', bignumberToNumber(await ethContract.balanceOf(bob.address)));

  const actionSwap = await actionId(vault, 'swap');
  await authorizer.grantRole(actionSwap, '0xffa375cdd34a73fc01e450ecfb22f64e69b92c09');

  const actionJoin = await actionId(vault, 'joinPool');
  await authorizer.grantRole(actionJoin, '0x5138e047ef8c45061591b6296133436e37e72b19');

  const actionExit = await actionId(vault, 'exitPool');
  await authorizer.grantRole(actionExit, '0x6ec4adc9a2459639b60787b744b9d46623d2ebd5');

  let afterethTokenInfo = await vault.getPoolTokens(ethPoolId);
  const afterethGetpool = await vault.getPool(ethPoolId);
  console.log('eth get pool afterethTokenInfo', afterethTokenInfo);
  console.log('eth pool token address afterethGetpool', afterethGetpool);

  const _responseQueryJoin = await balancerQueries.queryJoin(
    ethPoolId, // pool id
    deployer.address,
    bob.address,
    {
      assets: ethTokenInfoBob,
      maxAmountsIn: ethMax,
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(["384700000000000000000", "393900000000000000000"], 0),
    }, { gasLimit }
  );
  console.log("🚀 ~ main ~ _responseQueryJoin:", _responseQueryJoin)

  console.log("🚀 ~ main ~ _responseQueryJoin.bptOut:", _responseQueryJoin.bptOut)
  const _exitUserData = StablePoolEncoder.exitExactBptInForTokensOut(_responseQueryJoin.bptOut)
  console.log("🚀 ~ main ~ _exitUserData:", _exitUserData)
  console.log("🚀 ~ main ~ ethMin:", ethMin)
  console.log("🚀 ~ main ~ ethTokenInfoBob:", ethTokenInfoBob)
  

  const _responseQueryExit = await balancerQueries.queryExit(
    ethPoolId, // pool id
    deployer.address,
    bob.address,
    {
      assets: ethTokenInfoBob,
      minAmountsOut: ethMin,
      toInternalBalance: false,
      userData: _exitUserData,
    }, { gasLimit }
  );
  console.log("🚀 ~ main ~ _responseQueryExit:", _responseQueryExit, _responseQueryJoin.bptOut)

  const _exitSingleTokenUserData = StablePoolEncoder.exitExactBPTInForOneTokenOut(parseEther('20'), 1)
  console.log("🚀 ~ main ~ _exitSingleTokenUserData:", _exitSingleTokenUserData)

  const _responseQueryExitSingleToken = await balancerQueries.queryExit(
    ethPoolId, // pool id
    deployer.address,
    bob.address,
    {
      assets: ethTokenInfoBob,
      minAmountsOut: ethMin,
      toInternalBalance: false,
      userData: _exitSingleTokenUserData,
    }, { gasLimit }
  );
  console.log("🚀 ~ main ~ _responseQueryExitSingleToken:", _responseQueryExitSingleToken)

  // const ethTxExitBob = await vault.exitPool(
  //   ethPoolId, // pool id
  //   deployer.address,
  //   bob.address,
  //   {
  //     assets: ethTokenInfoBob,
  //     minAmountsOut: [0, 0, 0],
  //     toInternalBalance: false,
  //     userData: _exitSingleTokenUserData,
  //   }, { gasLimit: 300000 }
  // );
  // await ethTxExitBob.wait();
  // console.log("🚀 ~ main ~ ethTxExitBob:", ethTxExitBob)

  let funds: FundManagement;
  funds = {
    sender: vault.address,
    recipient: ZERO_ADDRESS,
    fromInternalBalance: false,
    toInternalBalance: false,
  };

  const _responseQuerySwap = await balancerQueries.querySwap(
    {
      poolId: ethPoolId,
      kind: SwapKind.GivenIn,
      assetIn: ethPoolAssets[1],
      assetOut: ethPoolAssets[0],
      amount: parseEther('20'),
      userData: '0x',
    },
    funds, 
    { gasLimit }
  );
  await waitFiveSeconds();
  let afterethTokenInfo1 = await vault.getPoolTokens(ethPoolId);
  console.log("🚀 ~ main ~ _responseQuerySwap:", _responseQuerySwap, afterethTokenInfo1)

  const _responseQuerySwap1 = await balancerQueries.querySwap(
    {
      poolId: ethPoolId,
      kind: SwapKind.GivenIn,
      assetIn: ethPoolAssets[1],
      assetOut: ethPoolAssets[0],
      amount: parseEther('20'),
      userData: '0x',
    },
    funds, 
    { gasLimit }
  );
  await waitFiveSeconds();
  let afterethTokenInfo2 = await vault.getPoolTokens(ethPoolId);
  console.log("🚀 ~ main ~ _responseQuerySwap1:", _responseQuerySwap1, afterethTokenInfo2)

  const _responseQuerySwap2 = await balancerQueries.querySwap(
    {
      poolId: ethPoolId,
      kind: SwapKind.GivenIn,
      assetIn: ethPoolAssets[1],
      assetOut: ethPoolAssets[0],
      amount: parseEther('20'),
      userData: '0x',
    },
    funds, 
    { gasLimit }
  );
  await waitFiveSeconds();
  let afterethTokenInfo3 = await vault.getPoolTokens(ethPoolId);
  console.log("🚀 ~ main ~ _responseQuerySwap2:", _responseQuerySwap2, afterethTokenInfo3)

  const _responseQuerySwap3 = await balancerQueries.querySwap(
    {
      poolId: ethPoolId,
      kind: SwapKind.GivenIn,
      assetIn: ethPoolAssets[1],
      assetOut: ethPoolAssets[0],
      amount: parseEther('20'),
      userData: '0x',
    },
    funds, 
    { gasLimit }
  );
  await waitFiveSeconds();
  let afterethTokenInfo4 = await vault.getPoolTokens(ethPoolId);
  console.log("🚀 ~ main ~ _responseQuerySwap3:", _responseQuerySwap3, afterethTokenInfo4)

  const _responseQuerySwap4 = await balancerQueries.querySwap(
    {
      poolId: ethPoolId,
      kind: SwapKind.GivenIn,
      assetIn: ethPoolAssets[1],
      assetOut: ethPoolAssets[0],
      amount: parseEther('20'),
      userData: '0x',
    },
    funds, 
    { gasLimit }
  );
  await waitFiveSeconds();
  let afterethTokenInfo5 = await vault.getPoolTokens(ethPoolId);
  console.log("🚀 ~ main ~ _responseQuerySwap4:", _responseQuerySwap4, afterethTokenInfo5)

  const _responseQuerySwap5 = await balancerQueries.querySwap(
    {
      poolId: ethPoolId,
      kind: SwapKind.GivenIn,
      assetIn: ethPoolAssets[1],
      assetOut: ethPoolAssets[0],
      amount: parseEther('20'),
      userData: '0x',
    },
    funds, 
    { gasLimit }
  );
  await waitFiveSeconds();
  let afterethTokenInfo6 = await vault.getPoolTokens(ethPoolId);
  console.log("🚀 ~ main ~ _responseQuerySwap5:", _responseQuerySwap5, afterethTokenInfo6)

  const _responseQuerySwap6 = await balancerQueries.querySwap(
    {
      poolId: ethPoolId,
      kind: SwapKind.GivenIn,
      assetIn: ethPoolAssets[1],
      assetOut: ethPoolAssets[0],
      amount: parseEther('20'),
      userData: '0x',
    },
    funds, 
    { gasLimit }
  );
  await waitFiveSeconds();
  let afterethTokenInfo7 = await vault.getPoolTokens(ethPoolId);
  console.log("🚀 ~ main ~ _responseQuerySwap6:", _responseQuerySwap6, afterethTokenInfo7)

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