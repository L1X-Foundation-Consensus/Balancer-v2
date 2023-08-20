import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';
import { SwapKind } from '@balancer-labs/balancer-js';
import { Contract } from 'ethers';
import TokenList from '@balancer-labs/v2-helpers/src/models/tokens/TokenList';
import { MAX_UINT256 } from '@balancer-labs/v2-helpers/src/constants';

const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  const [deployer] = await ethers.getSigners();
  let authorizer: Contract, vault: Contract;
  let allTokens: TokenList;

  /* Deploy WETH contract */
  const wethFactory = await ethers.getContractFactory('WETH');
  const WETH = await wethFactory.deploy({ gasLimit: 30000000 });
  console.log('Contract weth deployed to:', WETH.address);

  /* Deploy Authorizer contract */
  const authorizerFactory = await ethers.getContractFactory('Authorizer');
  authorizer = await authorizerFactory.deploy(toBytes32(10), deployer.address, deployer.address, {
    gasLimit: 30000000,
  });
  console.log('Contract authorizer deployed to:', authorizer.address);

  /* Deploy Vault contract */
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

  /* Deploy 2 ERC-20 token contracts */
  allTokens = await TokenList.create(['DAI', 'BAT'], { sorted: true });
  console.log('Tokens: ', allTokens.addresses);
  await allTokens.mint({ to: [deployer, deployer], amount: ethers.utils.parseEther('1000000000') });
  await allTokens.approve({ to: vault, from: [deployer] });

  /* Deploy ProtocolFeePercentagesProvider contract */
  const ProtocolFeePercentagesProviderFactory = await ethers.getContractFactory('ProtocolFeePercentagesProvider');
  const protocolFeePercentagesProvider = await ProtocolFeePercentagesProviderFactory.deploy(vault.address, 100, 200, {
    gasLimit: 30000000,
  });
  console.log('Contract protocol fee deployed to:', protocolFeePercentagesProvider.address);

  /* Deploy Rate provider contracts */
  // 1st Rate provider
  const RateProviderFactory = await ethers.getContractFactory('RateProvider');
  const rateProvider1 = await RateProviderFactory.deploy({ gasLimit: 30000000 });
  console.log('Contract rate provider 1 deployed to:', rateProvider1.address);

  // 2nd Rate provider
  const RateProviderFactory2 = await ethers.getContractFactory('RateProvider');
  const rateProvider2 = await RateProviderFactory2.deploy({ gasLimit: 30000000 });
  console.log('Contract rate provider 2 deployed to:', rateProvider2.address);

  /* Configure Pool parameters */
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
    owner: deployer.address,
    version: '1.0.0',
  };

  /* Deploy Composable Pool factory contract */
  const poolContractFactory = await ethers.getContractFactory('ComposableStablePool');
  const poolContract = await poolContractFactory.deploy(poolParams, { gasLimit: 30000000 });
  console.log('Contract deployed to:', poolContract.address);

  const poolId = await poolContract.getPoolId();
  console.log('Pool ID: ', poolId);

  const poolDetails = await vault.getPool(poolId);
  console.log('Pool Details:', poolDetails);

  await vault.setRelayerApproval(deployer.address, deployer.address, true);

  let tokenInfo = await vault.getPoolTokens(poolId);
  console.log('Token Info:', tokenInfo);

  /* Fill in the amounts array */
  let amountsIn = [];
  for (let i = 0; i < tokenInfo[0].length; i++) {
    if (tokenInfo[0][i] == poolContract.address) {
      amountsIn.push(ethers.utils.parseEther('10000000'));
    } else {
      amountsIn.push(ethers.utils.parseEther('10000000'));
    }
  }
  console.log('Amounts In: ', amountsIn);

  /* Join Pool */
  const txJoin = await vault.connect(deployer).joinPool(poolId, deployer.address, deployer.address, {
    assets: tokenInfo[0],
    maxAmountsIn: [
      ethers.utils.parseEther('10000000000000000'),
      ethers.utils.parseEther('10000000000000000'),
      ethers.utils.parseEther('10000000000000000'),
    ],
    fromInternalBalance: false,
    userData: StablePoolEncoder.joinInit(amountsIn),
  });
  await txJoin.wait();
  tokenInfo = await vault.getPoolTokens(poolId);
  console.log('Tokens Info:', tokenInfo);

  console.log('bpt balance', await poolContract.balanceOf(deployer.address));
  console.log('DAI balance', await allTokens.DAI.balanceOf(deployer.address));
  console.log('BAT balance', await allTokens.BAT.balanceOf(deployer.address));

  /* Swap Pool */
  const txSwap = await vault.swap(
    {
      kind: SwapKind.GivenIn,
      poolId,
      assetIn: allTokens.DAI.address,
      assetOut: allTokens.BAT.address,
      amount: ethers.utils.parseEther('1000'),

      userData: '0x',
    },
    {
      sender: deployer.address,
      recipient: deployer.address,
      fromInternalBalance: false,
      toInternalBalance: false,
    },
    0,
    MAX_UINT256
  );
  await txSwap.wait();
  tokenInfo = await vault.getPoolTokens(poolId);
  console.log('Tokens Info:', tokenInfo);

  console.log('After swap bpt balance', await poolContract.balanceOf(deployer.address));
  console.log('After swap DAI balance', await allTokens.DAI.balanceOf(deployer.address));
  console.log('After swap BAT balance', await allTokens.BAT.balanceOf(deployer.address));

  /* Exit Pool */
  const txExit = await vault.exitPool(poolId, deployer.address, deployer.address, {
    assets: tokenInfo[0],
    minAmountsOut: [ethers.utils.parseEther('0'), ethers.utils.parseEther('0'), ethers.utils.parseEther('0')],
    userData: StablePoolEncoder.exitExactBptInForTokensOut(ethers.utils.parseEther('10000000')),
    toInternalBalance: false,
  });
  await txExit.wait();
  tokenInfo = await vault.getPoolTokens(poolId);
  console.log('Tokens Info:', tokenInfo);

  console.log('bpt balance', await poolContract.balanceOf(deployer.address));
  console.log('DAI balance', await allTokens.DAI.balanceOf(deployer.address));
  console.log('BAT balance', await allTokens.BAT.balanceOf(deployer.address));
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
