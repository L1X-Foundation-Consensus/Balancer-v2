import { SwapKind } from '@balancer-labs/balancer-js';
import { WeightedPoolEncoder } from '@balancer-labs/balancer-js/src/pool-weighted/encoder';
import { ANY_ADDRESS, MAX_UINT256 } from '@balancer-labs/v2-helpers/src/constants';
import { actionId } from '@balancer-labs/v2-helpers/src/models/misc/actions';
import { BigNumber, BigNumberish, fp } from '@balancer-labs/v2-helpers/src/numbers';
const { ethers } = require('hardhat');
const fs = require('fs');

const alice = '0x75104938baa47c54a86004ef998cc76c2e616289';
async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  const charlie = signers[2];
  console.log('Deploying contracts with the account:', deployer.address);
  const erc20Factory = await ethers.getContractFactory('MYERC20');
  const erc20Params = {
    _name: 'wETHUSDC',
    _symbol: 'wETHUSDC',
    _decimals: 18,
    initialSupply: ethers.utils.parseUnits('1000000000', 0),
  };
  console.log(bignumberToNumber(ethers.utils.parseEther('1000000000')));
  const erc20 = await erc20Factory.deploy(
    erc20Params.initialSupply,
    erc20Params._name,
    erc20Params._symbol,
    erc20Params._decimals,
    { gasLimit: 30000000 }
  );

  const encodedParams = erc20Factory.interface.encodeDeploy([
    erc20Params.initialSupply,
    erc20Params._name,
    erc20Params._symbol,
    erc20Params._decimals,
  ]);

  fs.writeFileSync('./creationCode/creationCode20.txt', erc20Factory.bytecode.substring(2) + encodedParams.slice(2));
  const runtimeBytecode20 = await ethers.provider.getCode(erc20.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecode20.txt', runtimeBytecode20.substring(2));

  console.log('Contract 201 deployed to:', erc20.address);

  const erc20Params2 = {
    _name: 'wETHUSDT',
    _symbol: 'wETHUSDT',
    _decimals: 18,
    initialSupply: ethers.utils.parseUnits('1000000000', 0),
  };
  const erc202 = await erc20Factory.deploy(
    erc20Params2.initialSupply,
    erc20Params2._name,
    erc20Params2._symbol,
    erc20Params2._decimals,
    { gasLimit: 30000000 }
  );

  const encodedParams2 = erc20Factory.interface.encodeDeploy([
    erc20Params2.initialSupply,
    erc20Params2._name,
    erc20Params2._symbol,
    erc20Params2._decimals,
  ]);

  fs.writeFileSync('./creationCode/creationCode202.txt', erc20Factory.bytecode.substring(2) + encodedParams2.slice(2));
  const runtimeBytecode202 = await ethers.provider.getCode(erc20.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecode202.txt', runtimeBytecode202.substring(2));

  console.log('Contract 202 deployed to:', erc202.address);

  const erc20Params3 = {
    _name: 'Test Token 3',
    _symbol: 'TST3',
    _decimals: 18,
    initialSupply: ethers.utils.parseEther('1000000000'),
  };
  const erc203 = await erc20Factory.deploy(
    erc20Params3.initialSupply,
    erc20Params3._name,
    erc20Params3._symbol,
    erc20Params3._decimals,
    { gasLimit: 30000000 }
  );
  console.log('Contract 203 deployed to:', erc203.address);

  const wethFactory = await ethers.getContractFactory('WETH');
  const weth = await wethFactory.deploy({ gasLimit: 30000000 });
  console.log('Contract weth deployed to:', weth.address);

  fs.writeFileSync('./creationCode/creationWeth.txt', wethFactory.bytecode.substring(2));
  const runtimeBytecodeweth = await ethers.provider.getCode(weth.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodeweth.txt', runtimeBytecodeweth.substring(2));

  const AuthorizerFactory = await ethers.getContractFactory('Authorizer');
  const authorizer = await AuthorizerFactory.deploy(deployer.address, {
    gasLimit: 30000000,
  });
  console.log('Contract authorizer deployed to:', authorizer.address);

  fs.writeFileSync(
    './creationCode/creationAuthorizer.txt',
    AuthorizerFactory.bytecode.substring(2) +
      AuthorizerFactory.interface.encodeDeploy(['0x75104938baa47c54a86004ef998cc76c2e616289']).slice(2)
  );
  const runtimeBytecodeAuthorizer = await ethers.provider.getCode(authorizer.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodeAuthorizer.txt', runtimeBytecodeAuthorizer.substring(2));

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
    { gasLimit: 30000000 }
  );

  console.log('Contract vault deployed to:', vault.address);

  const encodedParams3 = VaultFactory.interface.encodeDeploy([
    '0x98f5708a5e6ef3e03cbf7f3913baf7596cb06f78', // change it if you deploy new authorizer
    '0x75efbcee8c37849b63287a1fcd367368a5f0ab80', // change it if you deploy new weth
    vaultParams.pauseWindowDuration,
    vaultParams.bufferPeriodDuration,
  ]);
  fs.writeFileSync('./creationCode/creationVault.txt', VaultFactory.bytecode.substring(2) + encodedParams3.slice(2));
  const runtimeBytecodevault = await ethers.provider.getCode(vault.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodevault.txt', runtimeBytecodevault.substring(2));

  const AuthorizerAdaptorFactory = await ethers.getContractFactory('AuthorizerAdaptor');
  const authorizerAdaptor = await AuthorizerAdaptorFactory.deploy(vault.address, {
    gasLimit: 30000000,
  });

  console.log('Contract authorizerAdaptor deployed to:', authorizerAdaptor.address);

  const AuthorizerAdaptorEntrypointFactory = await ethers.getContractFactory('AuthorizerAdaptorEntrypoint');
  const AuthorizerAdaptorEntrypoint = await AuthorizerAdaptorEntrypointFactory.deploy(authorizerAdaptor.address);
  console.log('Contract AuthorizerAdaptorEntrypoint deployed to: ', AuthorizerAdaptorEntrypoint.address);

  const AuthorizerWithAdaptorValidationFactory = await ethers.getContractFactory('AuthorizerWithAdaptorValidation');

  const AuthorizerWithAdaptorValidation = await AuthorizerWithAdaptorValidationFactory.deploy(
    authorizer.address,
    authorizerAdaptor.address,
    AuthorizerAdaptorEntrypoint.address,
    {
      gasLimit: 30000000,
    }
  );
  console.log('Contract AuthorizerWithAdaptorValidation deployed to: ', AuthorizerWithAdaptorValidation.address);

  const action = await actionId(vault, 'setAuthorizer');
  await authorizer.grantRole(action, deployer.address);

  await vault.setAuthorizer(AuthorizerWithAdaptorValidation.address);
  const protocolFeesCollector = await ethers.getContractAt(
    'ProtocolFeesCollector',
    await vault.getProtocolFeesCollector()
  );

  const ProtocolFeePercentagesProviderFactory = await ethers.getContractFactory('ProtocolFeePercentagesProvider');
  const protocolFeePercentagesProvider = await ProtocolFeePercentagesProviderFactory.deploy(vault.address, 100, 200, {
    gasLimit: 30000000,
  });
  console.log('Contract protovol fee deployed to:', protocolFeePercentagesProvider.address);

  const encodedParams4 = ProtocolFeePercentagesProviderFactory.interface.encodeDeploy([
    '0x7ba9268c354b2f0156abdec86ca0ac8e8135673f', // Once you deply the new vault, update the protocol fee with vault
    100,
    200,
  ]);
  fs.writeFileSync(
    './creationCode/creationProtocolFee.txt',
    ProtocolFeePercentagesProviderFactory.bytecode.substring(2) + encodedParams4.slice(2)
  );

  const runtimeBytecodeProtocolFee = await ethers.provider.getCode(protocolFeePercentagesProvider.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodeProtocolFee.txt', runtimeBytecodeProtocolFee.substring(2));

  const weightedPoolFactory = await ethers.getContractFactory('WeightedPoolFactory');

  const weightedPool = await weightedPoolFactory.deploy(vault.address, protocolFeePercentagesProvider.address, 0, 0, {
    gasLimit: 30000000,
  });
  console.log('Contract weighted pool factory deployed to:', weightedPool.address);

  const newPoolParams = {
    name: 'weighted pool',
    symbol: 'wp',
    tokens: [erc20.address, erc202.address, erc203.address],
    normalizedWeights: [ethers.utils.parseEther('0.3'), ethers.utils.parseEther('0.2'), ethers.utils.parseEther('0.5')],
    rateProviders: [
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
    ],
    assetManagers: [],
    swapFeePercentage: ethers.utils.parseEther('0.1'),
  };
  const weightedPoolByFactory = await (
    await weightedPool.create(
      newPoolParams.name,
      newPoolParams.symbol,
      newPoolParams.tokens.sort(),
      newPoolParams.normalizedWeights,
      newPoolParams.rateProviders,
      newPoolParams.swapFeePercentage,
      deployer.address,
      ethers.utils.formatBytes32String('1')
    )
  ).wait();

  const events = weightedPoolByFactory.events?.filter((e: any) => e.event && e.event === 'PoolCreated');
  console.log('Contract weighted pool deployed to:', events[0].args[0]);

  await erc20.approve(vault.address, ethers.utils.parseEther('1000000000'));
  await erc202.approve(vault.address, ethers.utils.parseEther('1000000000'));
  await erc203.approve(vault.address, ethers.utils.parseEther('1000000000'));

  const newPoolInstance = await ethers.getContractAt('WeightedPool', events[0].args[0]);
  const poolId = await newPoolInstance.getPoolId();

  let tokenInfo = await vault.getPoolTokens(poolId);

  const getpool = await vault.getPool(poolId);
  console.log('get pool', getpool);
  console.log('pool token address', tokenInfo[0]);
  console.log('pool swap fee percentage', await newPoolInstance.getSwapFeePercentage());
  const protocolFeePercentage = fp(0.1);

  const id = await actionId(newPoolInstance, 'setSwapFeePercentage');
  await authorizer.grantRole(id, deployer.address);
  await newPoolInstance.setSwapFeePercentage(protocolFeePercentage);

  console.log('pool swap fee percentage', await newPoolInstance.getSwapFeePercentage());

  const id1 = await actionId(protocolFeesCollector, 'setSwapFeePercentage');
  await authorizer.grantRole(id1, deployer.address);
  await protocolFeesCollector.setSwapFeePercentage(fp(0.2));
  console.log('protocolFeesCollector swap fee percentage: ', await protocolFeesCollector.getSwapFeePercentage());

  let amountsIn = [];
  for (let i = 0; i < tokenInfo[0].length; i++) {
    if (tokenInfo[0][i] == newPoolInstance.address) {
      amountsIn.push(ethers.utils.parseUnits('500000000', 18));
    } else {
      amountsIn.push(ethers.utils.parseUnits('500000000', 18));
    }
  }

  const txJoin = await vault.joinPool(poolId, deployer.address, deployer.address, {
    assets: tokenInfo[0],
    maxAmountsIn: [
      ethers.utils.parseEther('520000000'),
      ethers.utils.parseEther('520000000'),
      ethers.utils.parseEther('520000000'),
    ],
    fromInternalBalance: false,
    userData: WeightedPoolEncoder.joinInit(amountsIn),
  });
  await txJoin.wait();
  console.log('vault ProtocolFeesCollector: ', await vault.getProtocolFeesCollector());

  console.log(
    'protocolFees collected: ',
    await protocolFeesCollector.getCollectedFeeAmounts([erc20.address, erc202.address, erc203.address])
  );

  tokenInfo = await vault.getPoolTokens(poolId);
  console.log('pool balance after init: ', tokenInfo[1]);
  await erc20.transfer(bob.address, ethers.utils.parseEther('10000'));
  await erc202.transfer(bob.address, ethers.utils.parseEther('10000'));
  await erc203.transfer(bob.address, ethers.utils.parseEther('10000'));
  await erc20.connect(bob).approve(vault.address, ethers.utils.parseEther('10000'));
  await erc202.connect(bob).approve(vault.address, ethers.utils.parseEther('10000'));
  await erc203.connect(bob).approve(vault.address, ethers.utils.parseEther('10000'));

  let amountsInBob = [];
  let tokenInfoBob = [];
  let max = [];

  for (let i = 0; i < tokenInfo[0].length; i++) {
    if (tokenInfo[0][i] != newPoolInstance.address) {
      tokenInfoBob.push(tokenInfo[0][i]);
      amountsInBob.push(ethers.utils.parseUnits('1000', 18));
      max.push(MAX_UINT256);
    } else {
      tokenInfoBob.push(tokenInfo[0][i]);
      max.push(0);
    }
  }
  console.log('bob bpt before join: ', await newPoolInstance.balanceOf(bob.address));
  const txJoinBob = await vault.connect(bob).joinPool(
    poolId,
    bob.address,
    bob.address,
    {
      assets: tokenInfoBob,
      maxAmountsIn: max,
      fromInternalBalance: false,
      userData: WeightedPoolEncoder.joinExactTokensInForBPTOut(amountsInBob, 0),
    },
    {
      gasLimit: 30000000,
    }
  );
  await txJoinBob.wait();
  console.log('bob bpt after join: ', await newPoolInstance.balanceOf(bob.address));
  tokenInfo = await vault.getPoolTokens(poolId);
  console.log('pool balance after join: ', tokenInfo[1]);

  const swap = await vault.connect(bob).swap(
    {
      kind: SwapKind.GivenIn,
      poolId,
      assetIn: erc20.address,
      assetOut: erc202.address,
      amount: ethers.utils.parseUnits('1000', 18),

      userData: '0x',
    },
    {
      sender: bob.address,
      recipient: bob.address,
      fromInternalBalance: false,
      toInternalBalance: false,
    },
    0,
    MAX_UINT256
  );
  await swap.wait();

  tokenInfo = await vault.getPoolTokens(poolId);
  console.log('pool balance after swap', tokenInfo[1]);
  console.log('bob bpt after swap: ', await newPoolInstance.balanceOf(bob.address));
  console.log(
    'protocolFees collected: ',
    await protocolFeesCollector.getCollectedFeeAmounts([
      erc20.address,
      erc202.address,
      erc203.address,
      newPoolInstance.address,
    ])
  );
  console.log(await protocolFeesCollector.vault());
  console.log(await protocolFeesCollector.getSwapFeePercentage());
  console.log(await protocolFeesCollector.getAuthorizer());

  tokenInfo = await vault.getPoolTokens(poolId);

  const txExit = await vault.connect(bob).exitPool(poolId, bob.address, bob.address, {
    assets: tokenInfo[0],
    minAmountsOut: [ethers.utils.parseEther('900'), ethers.utils.parseEther('900'), ethers.utils.parseEther('900')],
    userData: WeightedPoolEncoder.exitExactBPTInForTokensOut(ethers.utils.parseEther('2999')),
    toInternalBalance: false,
  });

  await txExit.wait();

  console.log('pool balance after exit: ', tokenInfo[1]);
  console.log('bob bpt after exit: ', await newPoolInstance.balanceOf(bob.address));
  console.log('getSwapFeePercentage: ', await newPoolInstance.getSwapFeePercentage());
  console.log(
    'protocolFees collected: ',
    await protocolFeesCollector.getCollectedFeeAmounts([
      erc20.address,
      erc202.address,
      erc203.address,
      newPoolInstance.address,
    ])
  );
  console.log('originalInvariant: ', await newPoolInstance.getInvariant());
  console.log( await newPoolInstance.balanceOf(protocolFeesCollector.address));
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
