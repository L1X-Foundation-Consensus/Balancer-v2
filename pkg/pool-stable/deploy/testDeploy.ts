import { WeightedPoolEncoder } from '@balancer-labs/balancer-js';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { BigNumber, Contract } from 'ethers';
import StablePool from '@balancer-labs/v2-helpers/src/models/pools/stable/StablePool';
import TokenList from '@balancer-labs/v2-helpers/src/models/tokens/TokenList';
import { BigNumberish, bn } from '@balancer-labs/v2-helpers/src/numbers';

const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  const [, creator, admin, lp, relayer] = await ethers.getSigners();
  let authorizer: Contract, vault: Contract;
  let allTokens: TokenList;

  const wethFactory = await ethers.getContractFactory('WETH');
  const WETH = await wethFactory.deploy({ gasLimit: 30000000 });
  console.log('Contract weth deployed to:', WETH.address);

  const authorizerFactory = await ethers.getContractFactory('Authorizer');
  authorizer = await authorizerFactory.deploy(toBytes32(10), creator.address, admin.address, {
    gasLimit: 30000000,
  });
  console.log('Contract authorizer deployed to:', authorizer.address);

  const vaultFactory = await ethers.getContractFactory('Vault');
  const vaultParams = {
    authorizer: authorizer.address,
    weth: WETH.address,
    pauseWindowDuration: 0,
    bufferPeriodDuration: 0,
  };
  vault = await vaultFactory.deploy(
    vaultParams.authorizer,
    vaultParams.weth,
    vaultParams.pauseWindowDuration,
    vaultParams.bufferPeriodDuration,
    { gasLimit: 30000000 }
  );
  console.log('Contract vault deployed to:', vault.address);

  allTokens = await TokenList.create(['DAI', 'MKR'], { sorted: true });
  console.log('Tokens: ', allTokens.addresses);
  await allTokens.mint({ to: [creator, lp], amount: bn(100e18) });
  await allTokens.approve({ to: vault, from: [creator, lp] });

  // deploy ProtocolFeePercentagesProvider
  const ProtocolFeePercentagesProviderFactory = await ethers.getContractFactory('ProtocolFeePercentagesProvider');
  const protocolFeePercentagesProvider = await ProtocolFeePercentagesProviderFactory.deploy(vault.address, 100, 200, {
    gasLimit: 30000000,
  });
  console.log('Contract protocol fee deployed to:', protocolFeePercentagesProvider.address);

  // deploy rate provider
  const RateProviderFactory = await ethers.getContractFactory('RateProvider');
  const rateProvider1 = await RateProviderFactory.deploy({ gasLimit: 30000000 });
  console.log('Contract rate provider 1 deployed to:', rateProvider1.address);

  // deploy the other rate provider
  const RateProviderFactory2 = await ethers.getContractFactory('RateProvider');
  const rateProvider2 = await RateProviderFactory2.deploy({ gasLimit: 30000000 });
  console.log('Contract rate provider 2 deployed to:', rateProvider2.address);

  const composableStablePoolFactory = await ethers.getContractFactory('ComposableStablePoolFactory');
  const composableStablePoolFactoryParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    factoryVersion: '1.0.0',
    poolVersion: '1.0.0',
    initialPauseWindowDuration: 86400,
    bufferPeriodDuration: 172800,
  };

  const composableStablePoolFactoryContract = await composableStablePoolFactory.deploy(
    composableStablePoolFactoryParams.vault,
    composableStablePoolFactoryParams.protocolFeeProvider,
    composableStablePoolFactoryParams.factoryVersion,
    composableStablePoolFactoryParams.poolVersion,
    composableStablePoolFactoryParams.initialPauseWindowDuration,
    composableStablePoolFactoryParams.bufferPeriodDuration,
    { gasLimit: 30000000 }
  );
  console.log('Composable stable pool deployed to:', composableStablePoolFactoryContract.address);

  const createPool = await composableStablePoolFactoryContract.create(
    'My Stable Pool pool',
    'MSPp',
    allTokens.addresses,
    8, // amplificationParameter,
    [rateProvider1.address, rateProvider2.address],
    [3600, 3600], //uint256[] memory tokenRateCacheDurations,
    [false, false], // bool[] memory exemptFromYieldProtocolFeeFlags,
    BigInt('10000000000000'), //uint256 swapFeePercentage,
    creator.address, //address owner,
    // make 1 to bytes32
    ethers.utils.formatBytes32String('1')
  ); //bytes32 salt))
  //console.log(createPool);
  const res = await createPool.wait();

  const events = res.events?.filter((e: any) => e.event && e.event === 'PoolCreated');
  console.log('Pool creation deployed to:', events[0].args[0]);
  const xx = await ethers.getContractAt('ComposableStablePool', events[0].args[0]);
  console.log('Pool ID: ', await xx.getPoolId());
  console.log('Contract createPool deployed to:', events[0].args[0]);

  const poolParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    name: 'My Stable Pool',
    symbol: 'MSP',
    tokens: allTokens.addresses,
    rateProviders: [rateProvider1.address, rateProvider2.address],
    tokenRateCacheDurations: [0, 0],
    exemptFromYieldProtocolFeeFlags: [false, false],
    amplificationParameter: 10,
    swapFeePercentage: BigInt('10000000000000000').toString(),
    pauseWindowDuration: 100,
    bufferPeriodDuration: 200,
    owner: creator.address,
    version: '1.0.0',
  };

  const ContractFactory = await ethers.getContractFactory('ComposableStablePool');
  const contract = await ContractFactory.deploy(poolParams, { gasLimit: 30000000 });
  console.log('Contract deployed to:', contract.address);

  const poolId = await contract.getPoolId();
  console.log('Pool ID: ', poolId);

  const tokenInfo = await vault.getPoolTokens(poolId);
  console.log('Token Info:', tokenInfo);

  //const amountsIn = [BigNumber.from('1000000000'), BigNumber.from('1000000000')];
  const amountsIn = Array(tokenInfo.tokens.length).fill(bn(10e18) /*BigNumber.from('10000000000000000')*/);
  console.log('Amounts-------------: ', amountsIn);

  const tx = await vault.connect(creator).joinPool(poolId, creator.address, creator.address, {
    assets: tokenInfo.tokens,
    maxAmountsIn: amountsIn,
    fromInternalBalance: false,
    userData: StablePoolEncoder.joinInit(amountsIn),
  });
  console.log(tx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
function toBytes32(num: any) {
  let hex = num.toString(16); // Convert number to hexadecimal
  while (hex.length < 64) {
    // Pad with zeros until it's 64 characters (32 bytes)
    hex = '0' + hex;
  }
  return '0x' + hex;
}
