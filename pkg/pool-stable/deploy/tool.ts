import { BigNumber, BigNumberish, fp } from '@balancer-labs/v2-helpers/src/numbers';
const { ethers } = require('hardhat');
const fs = require('fs');
export const filePath = './deploy/input.json';
// give me random address
const alice = '0x75104938baa47c54a86004ef998cc76c2e616289';
export async function getPoolInstance() {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
  console.log('JSON Data:', jsonData);
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  const charlie = signers[2];
  console.log('Deploying contracts with the account:', deployer.address);
  const erc20Factory = await ethers.getContractFactory('OldWrappedToken');
  const erc20Params = {
    _name: 'USDC',
    _symbol: 'USDC',
    _decimals: 18,
  };
  const erc20 = await erc20Factory.deploy(erc20Params._name, erc20Params._symbol, erc20Params._decimals, {
    gasLimit: 30000000,
  });

  const erc20Params2 = {
    _name: 'USDT',
    _symbol: 'USDT',
    _decimals: 18,
  };
  const erc202 = await erc20Factory.deploy(erc20Params2._name, erc20Params2._symbol, erc20Params2._decimals, {
    gasLimit: 30000000,
  });

  const wethFactory = await ethers.getContractFactory('WETH');
  const weth = await wethFactory.deploy({ gasLimit: 30000000 });

  const AuthorizerFactory = await ethers.getContractFactory('Authorizer');

  const authorizer = await AuthorizerFactory.deploy(deployer.address, {
    gasLimit: 30000000,
  });

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

  const ProtocolFeePercentagesProviderFactory = await ethers.getContractFactory('ProtocolFeePercentagesProvider');
  const protocolFeePercentagesProvider = await ProtocolFeePercentagesProviderFactory.deploy(vault.address, 100, 200, {
    gasLimit: 30000000,
  });

  const RateProviderFactory = await ethers.getContractFactory('RateProvider');
  const rateProvider = await RateProviderFactory.deploy({ gasLimit: 30000000 });

  const RateProviderFactory2 = await ethers.getContractFactory('RateProvider');
  const rateProvider2 = await RateProviderFactory2.deploy({ gasLimit: 30000000 });

  const composableStablePoolFactory = await ethers.getContractFactory('ComposableStablePoolFactory');
  const composableStablePoolFactoryParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    factoryVersion: '1.0.0',
    poolVersion: '1.0.0',
    initialPauseWindowDuration: 0,
    bufferPeriodDuration: 0,
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
    swapFeePercentage: fp(0.1),
    pauseWindowDuration: 0,
    bufferPeriodDuration: 0,
    owner: deployer.address,
    version: '1.0.0',
  };
  const ContractFactory = await ethers.getContractFactory('ComposableStablePool');

  const contract = await ContractFactory.deploy(poolParams, { gasLimit: 30000000 });
  return { pool: contract, vault: vault };
}

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
  owner: string;
  vault: string;
  protocol: string;
  erc20: string;
  erc201: string;
  rateProvider: string;
  rateProvider1: string;
  authorizer: string;
  weth: string;
  approveCall: { amount: string };
}
