import { SwapKind, WeightedPoolEncoder } from '@balancer-labs/balancer-js';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';
import { MAX_UINT256 } from '@balancer-labs/v2-helpers/src/constants';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { BigNumber } from 'ethers';

const { ethers } = require('hardhat');
const fs = require('fs');

// give me random address
const alice = '0x177f88827a0d1fb1f10c4474cccc1dada9fdb318';
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);
  const erc20Factory = await ethers.getContractFactory('MYERC20');
  const erc20Params = {
    _name: 'Test Token',
    _symbol: 'TST',
    _decimals: 18,
    initialSupply: ethers.utils.parseEther('1000000000'),
  };
  console.log(ethers.utils.parseEther('1000000000'));
  const erc20 = await erc20Factory.deploy(
    erc20Params.initialSupply,
    erc20Params._name,
    erc20Params._symbol,
    erc20Params._decimals,
    { gasLimit: 30000000 }
  );
  // write creation code to file
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
    _name: 'Test Token 2',
    _symbol: 'TST2',
    _decimals: 18,
    initialSupply: ethers.utils.parseEther('1000000000'),
  };
  const erc202 = await erc20Factory.deploy(
    erc20Params2.initialSupply,
    erc20Params2._name,
    erc20Params2._symbol,
    erc20Params2._decimals,
    { gasLimit: 30000000 }
  );
  // write creation code to file
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
  // write weth creation code to file

  fs.writeFileSync('./creationCode/creationWeth.txt', wethFactory.bytecode.substring(2));
  const runtimeBytecodeweth = await ethers.provider.getCode(weth.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodeweth.txt', runtimeBytecodeweth.substring(2));

  const AuthorizerFactory = await ethers.getContractFactory('Authorizer');
  // 100 to soldity bytes32

  const authorizer = await AuthorizerFactory.deploy(toBytes32(10), deployer.address, alice, { gasLimit: 30000000 });
  console.log('Contract authorizer deployed to:', authorizer.address);
  // write weth creation code to file

  fs.writeFileSync(
    './creationCode/creationAuthorizer.txt',
    AuthorizerFactory.bytecode.substring(2) +
      AuthorizerFactory.interface
        .encodeDeploy([toBytes32(10), '0x177f88827a0d1fb1f10c44743be61dada9fdb318', alice])
        .slice(2)
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
    '0xa5c30f20d482db78dc050e02cf237ab66699065b',
    '0xbe298ee72122840dfe1cbcf0ba6e6b0d82bd832a',
    vaultParams.pauseWindowDuration,
    vaultParams.bufferPeriodDuration,
  ]);
  fs.writeFileSync('./creationCode/creationVault.txt', VaultFactory.bytecode.substring(2) + encodedParams3.slice(2));
  const runtimeBytecodevault = await ethers.provider.getCode(vault.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodevault.txt', runtimeBytecodevault.substring(2));
  // deploy ProtocolFeePercentagesProvider
  const ProtocolFeePercentagesProviderFactory = await ethers.getContractFactory('ProtocolFeePercentagesProvider');
  const protocolFeePercentagesProvider = await ProtocolFeePercentagesProviderFactory.deploy(vault.address, 100, 200, {
    gasLimit: 30000000,
  });
  console.log('Contract protovol fee deployed to:', protocolFeePercentagesProvider.address);
  const encodedParams4 = ProtocolFeePercentagesProviderFactory.interface.encodeDeploy([
    '0xe8242ad49dea5b1e859670c7543a80393ed3b34a',
    100,
    200,
  ]);
  fs.writeFileSync(
    './creationCode/creationProtocolFee.txt',
    ProtocolFeePercentagesProviderFactory.bytecode.substring(2) + encodedParams4.slice(2)
  );

  const runtimeBytecodeProtocolFee = await ethers.provider.getCode(protocolFeePercentagesProvider.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodeProtocolFee.txt', runtimeBytecodeProtocolFee.substring(2));
  // deploy rate provider
  const RateProviderFactory = await ethers.getContractFactory('RateProvider');
  const rateProvider = await RateProviderFactory.deploy({ gasLimit: 30000000 });
  console.log('Contract rate provider deployed to:', rateProvider.address);
  fs.writeFileSync('./creationCode/creationRateProvider.txt', RateProviderFactory.bytecode.substring(2));
  const runtimeBytecodeRateProvider = await ethers.provider.getCode(rateProvider.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodeRateProvider.txt', runtimeBytecodeRateProvider.substring(2));
  // deploy the other rate provider
  const RateProviderFactory2 = await ethers.getContractFactory('RateProvider');
  const rateProvider2 = await RateProviderFactory2.deploy({ gasLimit: 30000000 });
  console.log('Contract rate provider 2 deployed to:', rateProvider2.address);
  fs.writeFileSync('./creationCode/creationRateProvider2.txt', RateProviderFactory.bytecode.substring(2));
  const runtimeBytecodeRateProvider2 = await ethers.provider.getCode(rateProvider.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodeRateProvider2.txt', runtimeBytecodeRateProvider2.substring(2));

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

  console.log('Contract composableStablePoolFactory deployed to:', composableStablePoolFactoryContract.address);
  const encodedParams6 = composableStablePoolFactory.interface.encodeDeploy([
    '0xe8242ad49dea5b1e859670c7543a80393ed3b34a',
    '0x3aa759d45bd65fd286ecc2f94cd237e92acba6e1',
    '1.0.0',
    '1.0.0',
    86400,
    172800,
  ]);
  fs.writeFileSync(
    './creationCode/creationCodePoolFactory.txt',
    composableStablePoolFactory.bytecode.substring(2) + encodedParams6.slice(2)
  );
  const runtimeBytecodePoolFactory = await ethers.provider.getCode(composableStablePoolFactoryContract.address);

  fs.writeFileSync('./runtimeCode/runtimeBytecodePoolFactory.txt', runtimeBytecodePoolFactory.substring(2));

  const abi = [
    'function create(string name, string symbol, address[] tokens, uint256 amplificationParameter, address[] rateProviders, uint256[] tokenRateCacheDurations, bool[] exemptFromYieldProtocolFeeFlags, uint256 swapFeePercentage, address owner, bytes32 salt)',
  ];

  // Create an instance of the contract interface
  const iface = new ethers.utils.Interface(abi);

  // Define the function arguments
  const args = [
    'My Stable Pool pool',
    'MSPp',
    ['0x1ec49baf2743eb1e007d7ed016295a595426778e', '0x699af7866db63d636469b23586788189a8a491a2'].sort(),
    10,
    ['0x2ac4c203d5e98195d22e515301da1bcbd30bc258', '0xe7bf21f5fecb1ced93e51f02a23d6e271946fdf7'].sort(),
    [3600, 3600],
    [false, false],
    BigInt('10000000000000000'),
    '0x177f88827a0d1fb1f10c44743be61dada9fdb318',
    ethers.utils.formatBytes32String('1'),
  ];

  // Generate the calldata
  const calldata = iface.encodeFunctionData('create', args);

  const createPool = await composableStablePoolFactoryContract.create(
    'My Stable Pool pool',
    'MSPp',
    [erc20.address, erc202.address].sort(),
    8, // amplificationParameter,
    [rateProvider.address, rateProvider2.address].sort(),
    [100, 3600], //uint256[] memory tokenRateCacheDurations,
    [false, false], // bool[] memory exemptFromYieldProtocolFeeFlags,
    BigInt('10000000000000000'), //uint256 swapFeePercentage,
    '0x177f88827a0d1fb1f10c44743be61dada9fdb318', //address owner,
    // make 1 to bytes32
    ethers.utils.formatBytes32String('1')
  ); //bytes32 salt))
  console.log(createPool);
  const res = await createPool.wait();

  const events = res.events?.filter((e) => e.event && e.event === 'PoolCreated');
  const xx = await ethers.getContractAt('ComposableStablePool', events[0].args[0]);
  console.log('', await xx.getPoolId());
  console.log('Contract createPool deployed to:', events[0].args[0]);
  const poolParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    name: 'My Stable Pool',
    symbol: 'MSP',
    tokens: [erc20.address, erc202.address].sort(),
    rateProviders: [rateProvider.address, rateProvider2.address],
    tokenRateCacheDurations: [0, 0],
    exemptFromYieldProtocolFeeFlags: [false, false],
    amplificationParameter: BigInt('1'),
    swapFeePercentage: BigInt('10000000000000000'),
    pauseWindowDuration: 0,
    bufferPeriodDuration: 0,
    owner: deployer.address,
    version: '1.0.0',
  };
  const ContractFactory = await ethers.getContractFactory('ComposableStablePool');
  const encodedParams5 = ContractFactory.interface.encodeDeploy([
    {
      vault: '0xe8242ad49dea5b1e859670c7543a80393ed3b34a',
      protocolFeeProvider: '0x3aa759d45bd65fd286ecc2f94cd237e92acba6e1',
      name: 'My Stable Pool',
      symbol: 'MSP',
      tokens: ['0x1ec49baf2743eb1e007d7ed016295a595426778e', '0x699af7866db63d636469b23586788189a8a491a2'].sort(),
      rateProviders: [
        '0x2ac4c203d5e98195d22e515301da1bcbd30bc258',
        '0xe7bf21f5fecb1ced93e51f02a23d6e271946fdf7',
      ].sort(),
      tokenRateCacheDurations: [3600, 3600],
      exemptFromYieldProtocolFeeFlags: [false, false],
      amplificationParameter: 10,
      swapFeePercentage: BigInt('10000000000000000').toString(),
      pauseWindowDuration: 100,
      bufferPeriodDuration: 200,
      owner: '0x177f88827a0d1fb1f10c44743be61dada9fdb318',
      version: '1.0.0',
    },
  ]);
  fs.writeFileSync(
    './creationCode/creationCodePool.txt',
    ContractFactory.bytecode.substring(2) + encodedParams5.slice(2)
  );
  const contract = await ContractFactory.deploy(poolParams, { gasLimit: 30000000 });
  console.log('Contract deployed to:', contract.address);
  const runtimeBytecode = await ethers.provider.getCode(contract.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecode.txt', runtimeBytecode.substring(2));
  const poolId = await contract.getPoolId();
  const poolId2 = await xx.getPoolId();
  await erc20.approve(vault.address, ethers.utils.parseEther('1000000000'));
  await erc202.approve(vault.address, ethers.utils.parseEther('1000000000'));
  const allow = await erc20.allowance(deployer.address, vault.address);
  const allow1 = await erc202.allowance(deployer.address, vault.address);
  console.log('allow', allow);
  console.log('allow1', allow);

  const poolDetails = await vault.getPool(poolId);
  console.log(poolDetails);

  await vault.setRelayerApproval(deployer.address, deployer.address, true);

  console.log('token info', await vault.getPoolTokenInfo(poolId, erc20.address));
  let tokenInfo = await vault.getPoolTokens(poolId);
  const tokenInfo2 = await vault.getPoolTokens(poolId2);

  const getpool = await vault.getPool(poolId);
  console.log('get pool', getpool);
  console.log(tokenInfo[0]);
  // console.log(tokenInfo2);
  // get pool id from contract
  let amountsIn = [];
  for (let i = 0; i < tokenInfo[0].length; i++) {
    if (tokenInfo[0][i] == contract.address) {
      amountsIn.push(ethers.utils.parseEther('10000000'));
    } else {
      amountsIn.push(ethers.utils.parseEther('10000000'));
    }
  }
  console.log('amount', amountsIn);
  const tokens = [erc20.address, erc202.address];
  // const amountsIn = [BigNumber.from('100000000000',),BigNumber.from('0')];
  console.log(StablePoolEncoder.joinInit(amountsIn));

  // const { tokens: allTokens } = await vault.getPoolTokens(poolId);

  // ComposableStablePool needs BPT in the initialize userData but ManagedPool doesn't.

  const txJoin = await vault.joinPool(poolId, deployer.address, deployer.address, {
    assets: tokenInfo[0],
    maxAmountsIn: [
      ethers.utils.parseEther('10000000000000000'),
      ethers.utils.parseEther('10000000000000000'),
      ethers.utils.parseEther('10000000000000000'),
    ],
    fromInternalBalance: false,
    userData: StablePoolEncoder.joinInit(amountsIn),
  });
  console.log(await txJoin.wait);
  tokenInfo = await vault.getPoolTokens(poolId);
  console.log(tokenInfo);
  console.log('bpt balance', await contract.balanceOf(deployer.address));

  console.log('erc20 balance', await erc20.balanceOf(deployer.address));
  console.log('erc202 balance', await erc202.balanceOf(deployer.address));

  const swap = await vault.swap(
    {
      kind: SwapKind.GivenIn,
      poolId,
      assetIn: erc20.address,
      assetOut: erc202.address,
      amount:       ethers.utils.parseEther('1000'),
    
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
  await swap.wait();
  console.log('after swap bpt balance', await contract.balanceOf(deployer.address));

  console.log('after swap erc20 balance', await erc20.balanceOf(deployer.address));
  console.log('after swap erc202 balance', await erc202.balanceOf(deployer.address));
  // amountsIn = [];
  // for (let i = 0; i < tokenInfo[0].length; i++) {
  //   if (tokenInfo[0][i] == contract.address) {
  //     amountsIn.push(ethers.utils.parseEther('1000'));
  //   } else {
  //     amountsIn.push(ethers.utils.parseEther('1000'));
  //   }
  // }
  // const txJoin1 = await vault.joinPool(poolId, deployer.address, deployer.address, {
  //   assets: [erc20.address, erc202.address],
  //   maxAmountsIn: [ethers.utils.parseEther('10000000000000000'), ethers.utils.parseEther('10000000000000000')],
  //   fromInternalBalance: false,
  //   userData: StablePoolEncoder.joinExactTokensInForBPTOut([ethers.utils.parseEther('10000'), ethers.utils.parseEther('10000')], ethers.utils.parseEther('100')),
  // });
  // console.log(await txJoin.wait);

  const txExit = await vault.exitPool(poolId, deployer.address, deployer.address, {
    assets: tokenInfo[0],
    minAmountsOut: [ethers.utils.parseEther('0'), ethers.utils.parseEther('0'), ethers.utils.parseEther('0')],
    userData: StablePoolEncoder.exitExactBptInForTokensOut(ethers.utils.parseEther('10000000')),
    toInternalBalance: false,
  });
  console.log(await txExit.await);
  tokenInfo = await vault.getPoolTokens(poolId);
  console.log(tokenInfo);
  console.log('bpt balance', await contract.balanceOf(deployer.address));
  console.log('erc20 balance', await erc20.balanceOf(deployer.address));
  console.log('erc202 balance', await erc202.balanceOf(deployer.address));
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
