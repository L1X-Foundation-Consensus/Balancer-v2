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
  
  const ethUsdtParam = {
    _name: 'ETH-USDT',
    _symbol: 'ETH-USDT',
    _decimals: 18,
  };
  const ethUsdtContract = await erc20Factory.deploy(ethUsdtParam._name, ethUsdtParam._symbol, ethUsdtParam._decimals);

  console.log('Contract ETH-USDT deployed to:', ethUsdtContract.address);

  const ethUsdcParam = {
    _name: 'ETH-USDC',
    _symbol: 'ETH-USDC',
    _decimals: 18,
  };
  const ethUsdcContract = await erc20Factory.deploy(ethUsdcParam._name, ethUsdcParam._symbol, ethUsdcParam._decimals);

  console.log('Contract ETH-USDC deployed to:', ethUsdcContract.address);

  const WL1xParam = {
    _name: 'WL1X',
    _symbol: 'WL1X',
    _decimals: 18,
  };
  const wl1xContract = await erc20Factory.deploy(WL1xParam._name, WL1xParam._symbol, WL1xParam._decimals);

  console.log('Contract WL1X deployed to:', wl1xContract.address);

  
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

  const ethUsdtRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const ethUsdtRateProvider = await ethUsdtRateProviderFactory.deploy();
  console.log('eth-usdc rate provider deployed to:', ethUsdtRateProvider.address);
  await waitFiveSeconds();

  const ethUsdcRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const ethUsdcRateProvider = await ethUsdcRateProviderFactory.deploy();
  console.log('eth-usdt rate provider deployed to:', ethUsdcRateProvider.address);
  await waitFiveSeconds();

  const WL1XRateProviderFactory = await ethers.getContractFactory('RateProvider');
  const WL1XRateProvider = await WL1XRateProviderFactory.deploy();
  console.log('eth-l1x rate provider deployed to:', WL1XRateProvider.address);
  await waitFiveSeconds();

  
 
  const ContractFactory = await ethers.getContractFactory('ComposableStablePool');

  const ethUsdtL1XPoolParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    name: 'ETHUSDT-L1X',
    symbol: 'ETHUSDT-L1X',
    tokens: [ethUsdtContract.address, wl1xContract.address].sort(),
    rateProviders: [ethUsdtRateProvider.address, WL1XRateProvider.address].sort(),
    tokenRateCacheDurations: [0, 0],
    exemptFromYieldProtocolFeeFlags: [false, false],
    amplificationParameter: BigInt('1'),
    swapFeePercentage: fp(0.1),
    pauseWindowDuration: 0,
    bufferPeriodDuration: 0,
    owner: deployer.address,
    version: '1.0.0',
  };

  const ethUsdtL1XPoolContract = await ContractFactory.deploy(ethUsdtL1XPoolParams, );
  console.log('ETHUSDT-L1X Pool deployed to:', ethUsdtL1XPoolContract.address);
  await waitFiveSeconds();
  
  const ethUsdtL1XPoolId = await ethUsdtL1XPoolContract.getPoolId();
  console.log('ETHUSDT-L1X Pool id: ', ethUsdtL1XPoolId);

  const ethUsdcL1XPoolParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    name: 'ETHUSDC-L1X',
    symbol: 'ETHUSDC-L1X',
    tokens: [ethUsdcContract.address, wl1xContract.address].sort(),
    rateProviders: [ethUsdcRateProvider.address, WL1XRateProvider.address].sort(),
    tokenRateCacheDurations: [0, 0],
    exemptFromYieldProtocolFeeFlags: [false, false],
    amplificationParameter: BigInt('1'),
    swapFeePercentage: fp(0.1),
    pauseWindowDuration: 0,
    bufferPeriodDuration: 0,
    owner: deployer.address,
    version: '1.0.0',
  };

  const ethUsdcL1XPoolContract = await ContractFactory.deploy(ethUsdcL1XPoolParams, );
  console.log('ETHUSDC-L1X Pool deployed to:', ethUsdcL1XPoolContract.address);
  await waitFiveSeconds();

  const ethUsdcL1XPoolId = await ethUsdcL1XPoolContract.getPoolId();
  console.log('ETHUSDC-L1X Pool id: ', ethUsdcL1XPoolId);

  await ethUsdtContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vault.address, );
  await waitFiveSeconds();
  console.log('Deposit eth-usdt to vault');

  await ethUsdcContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vault.address, );
  await waitFiveSeconds();
  console.log('Deposit eth-usdc to vault');

  await wl1xContract
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vault.address, );
  await waitFiveSeconds();
  console.log('Deposit wl1x to vault');

 

  let ethUsdtL1XTokenInfo = await vault.getPoolTokens(ethUsdtL1XPoolId);
  await waitFiveSeconds();

  const ethUsdtL1XGetpool = await vault.getPool(ethUsdtL1XPoolId);
  console.log('eth get pool', ethUsdtL1XGetpool);
  console.log('eth pool token address', ethUsdtL1XTokenInfo[0]);

  let ethUsdcL1XTokenInfo = await vault.getPoolTokens(ethUsdcL1XPoolId);
  await waitFiveSeconds();

  const ethUsdcL1XGetpool = await vault.getPool(ethUsdcL1XPoolId);
  console.log('eth get pool', ethUsdcL1XGetpool);
  console.log('eth pool token address', ethUsdcL1XTokenInfo[0]);

 

  let amountsIn = [];
  for (let i = 0; i < ethUsdtL1XTokenInfo[0].length; i++) {
    amountsIn.push(ethers.utils.parseUnits('500000000', 18));
  }

  console.log('ethusdt-bpt balance before init the pool', bignumberToNumber(await ethUsdtContract.balanceOf(deployer.address)));
  console.log('ethusdc-bpt deployer balance before pool initiation', bignumberToNumber(await ethUsdcContract.balanceOf(deployer.address)));

  await waitFiveSeconds();

  const ethUsdtTxJoin = await vault.joinPool(
    ethUsdtL1XPoolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: ethUsdtL1XTokenInfo[0],
      maxAmountsIn: [
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
      ],
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinInit(amountsIn),
    },
    
  );
  await ethUsdtTxJoin.wait();

  await waitFiveSeconds();

  const bscTxJoin = await vault.joinPool(
    ethUsdcL1XPoolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: ethUsdcL1XTokenInfo[0],
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

  console.log('ethusdt-bpt balance after init the pool', bignumberToNumber(await ethUsdtContract.balanceOf(deployer.address)));
  console.log('ethusdc-bpt deployer balance after pool initiation', bignumberToNumber(await ethUsdcContract.balanceOf(deployer.address)));
  await waitFiveSeconds();

  let ethUsdtMax = [];
  let ethUsdtAmountsInBob = [];
  let ethUsdtTokenInfoBob = [];

  for (let i = 0; i < ethUsdtL1XTokenInfo[0].length; i++) {
    if (ethUsdtL1XTokenInfo[0][i] != ethUsdtContract.address) {
      ethUsdtTokenInfoBob.push(ethUsdtL1XTokenInfo[0][i]);
      ethUsdtAmountsInBob.push(ethers.utils.parseUnits('10000', 18));
      ethUsdtMax.push(MAX_UINT256);
    } else {
      ethUsdtTokenInfoBob.push(ethUsdtL1XTokenInfo[0][i]);
      ethUsdtMax.push(MAX_UINT256);
    }
  }

  const ethUsdtTxJoinBob = await vault.joinPool(
    ethUsdtL1XPoolId, // pool id
    deployer.address,
    bob.address,
    {
      assets: ethUsdtL1XTokenInfo,
      maxAmountsIn: ethUsdtMax,
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(ethUsdtTokenInfoBob, 0),
    }
  );
  await ethUsdtTxJoinBob.wait();
  await waitFiveSeconds();
  console.log('ethusdt-bpt pool bob',ethUsdtTxJoinBob);

  let ethUsdcMax = [];
  let ethUsdcAmountsInBob = [];
  let ethUsdcTokenInfoBob = [];

  for (let i = 0; i < ethUsdcL1XTokenInfo[0].length; i++) {
    if (ethUsdcL1XTokenInfo[0][i] != ethUsdcContract.address) {
      ethUsdcTokenInfoBob.push(ethUsdcL1XTokenInfo[0][i]);
      ethUsdcAmountsInBob.push(ethers.utils.parseUnits('10000', 18));
      ethUsdcMax.push(MAX_UINT256);
    } else {
      ethUsdcTokenInfoBob.push(ethUsdcL1XTokenInfo[0][i]);
      ethUsdcMax.push(MAX_UINT256);
    }
  }

  const ethUsdcTxJoinBob = await vault.joinPool(
    ethUsdcL1XPoolId, // pool id
    deployer.address,
    bob.address,
    {
      assets: ethUsdcTokenInfoBob,
      maxAmountsIn: ethUsdcMax,
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(ethUsdcTokenInfoBob, 0),
    }
  );
  await ethUsdcTxJoinBob.wait();
  console.log('ethUsdc-join pool bob',ethUsdcTxJoinBob);
  await waitFiveSeconds();

  console.log('ethusdt-bpt bob balance after bob joining the pool', bignumberToNumber(await ethUsdtContract.balanceOf(bob.address)));
  console.log('ethusdc-bpt bob balance after bob joining the pool', bignumberToNumber(await ethUsdcContract.balanceOf(bob.address)));


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
