### 1. Setup network

```typescript
    remote: {
      url: 'http://54.214.8.200:50051',
    },
```

### 2. Deployment of ERC20 Tokens and Contracts

```typescript
// Deploy ERC20 tokens (USDC, USDT, BUSD) and WETH
const erc20Factory = await ethers.getContractFactory('OldWrappedToken');
const erc20Params = { _name: 'USDC', _symbol: 'USDC', _decimals: 18 };
const erc20 = await erc20Factory.deploy(
  erc20Params._name,
  erc20Params._symbol,
  erc20Params._decimals,
  { gasLimit: 30000000 }
);
// Repeat for USDT and BUSD tokens
// Deploy WETH contract
const wethFactory = await ethers.getContractFactory('WETH');
const weth = await wethFactory.deploy({ gasLimit: 30000000 });
```

This section deploys ERC20 tokens (USDC, USDT, BUSD) and the Wrapped Ether (WETH) contract.

### 2. Deployment of Authorizer, Vault, and BalancerQueries

```typescript
// Deploy Authorizer
const AuthorizerFactory = await ethers.getContractFactory('Authorizer');
const authorizer = await AuthorizerFactory.deploy(deployer.address, {
  gasLimit: 30000000,
});

// Deploy Vault
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

// Deploy BalancerQueries
const balancerQueriesFactory = await ethers.getContractFactory(
  'BalancerQueries'
);
const balancerQueries = await balancerQueriesFactory.deploy(vault.address);
```

This section deploys the Authorizer, Vault, and BalancerQueries contracts.

### 3. Deployment of ProtocolFeePercentagesProvider and RateProvider Contracts

```typescript
// Deploy ProtocolFeePercentagesProvider
const ProtocolFeePercentagesProviderFactory = await ethers.getContractFactory(
  'ProtocolFeePercentagesProvider'
);
const protocolFeePercentagesProvider =
  await ProtocolFeePercentagesProviderFactory.deploy(vault.address, 100, 200, {
    gasLimit: 30000000,
  });

// Deploy RateProviders
const RateProviderFactory = await ethers.getContractFactory('RateProvider');
const rateProvider = await RateProviderFactory.deploy({ gasLimit: 30000000 });
// Repeat for rateProvider2 and rateProvider3
```

This section deploys the ProtocolFeePercentagesProvider and multiple RateProvider contracts.

### 4. Deployment of ComposableStablePool (Balancer Pool)

```typescript
// Configure pool parameters
const poolParams = {
  vault: vault.address,
  protocolFeeProvider: protocolFeePercentagesProvider.address,
  name: 'My Stable Pool',
  symbol: 'MSP',
  tokens: [erc20.address, erc202.address, erc203.address].sort(),
  rateProviders: [
    rateProvider.address,
    rateProvider2.address,
    rateProvider3.address,
  ].sort(),
  tokenRateCacheDurations: [0, 0, 0],
  exemptFromYieldProtocolFeeFlags: [false, false, false],
  amplificationParameter: BigInt('1'),
  swapFeePercentage: fp(0.1),
  pauseWindowDuration: 0,
  bufferPeriodDuration: 0,
  owner: deployer.address,
  version: '1.0.0',
};

// Deploy ComposableStablePool as blaancer pool token
const ContractFactory = await ethers.getContractFactory('ComposableStablePool');
const contract = await ContractFactory.deploy(poolParams, {
  gasLimit: 30000000,
});
```

This section configures and deploys a ComposableStablePool (Balancer Pool) with specified parameters.

### 5. Pool Creation

```typescript
// Get pool ID
const poolId = await contract.getPoolId();
// Get tokens info in this pool
let tokenInfo = await vault.getPoolTokens(poolId);

const amountsIn = [
  ethers.utils.parseUnits('500000000', 18),
  ethers.utils.parseUnits('500000000', 18),
  ethers.utils.parseUnits('500000000', 18),
];

const txJoin = await vault.joinPool(
  poolId,
  sender,
  recipient,
  {
    assets: tokenInfo[0],
    maxAmountsIn: [
      ethers.utils.parseEther('10000000000000000'),
      ethers.utils.parseEther('10000000000000000'),
      ethers.utils.parseEther('10000000000000000'),
      ethers.utils.parseEther('10000000000000000'),
    ],
    fromInternalBalance: false,
    userData: StablePoolEncoder.joinInit(amountsIn),
  },
  { gasLimit: 30000000 }
);
```

### 6. Pool Joining

```typescript
// Mint tokens to sender and approve valut to spend
// Repeat for USDT and BUSD deposits
await erc20
  .connect(deployer)
  .deposit(ethers.utils.parseEther('10000000000'), sender, vault.address, {
    gasLimit: 30000000,
  });

let max = [MAX_UINT256, MAX_UINT256, MAX_UINT256, MAX_UINT256];

const amountsIn = [
  ethers.utils.parseUnits('1000', 18),
  ethers.utils.parseUnits('1000', 18),
  ethers.utils.parseUnits('1000', 18),
];

// QueryJoin will simulate adding liquidity to the pool and estimate the amount of Balancer Pool Tokens (BPT) in return.
// This step helps to determine the expected outcome before actually adding liquidity to the pool.

// Define the pool parameters
const queryJoin = await balancerQueries.queryJoin(poolId, sender, recipient, {
  assets: tokenInfo[0],
  maxAmountsIn: max,
  fromInternalBalance: false,
  userData: StablePoolEncoder.joinExactTokensInForBPTOut(amountsIn, 0),
});

// Join the pool
const txJoin = await vault.joinPool(poolId, sender, recipient, {
  assets: tokenInfo[0],
  maxAmountsIn: max,
  fromInternalBalance: false,
  userData: StablePoolEncoder.joinExactTokensInForBPTOut(amountsIn, 0),
});
```

This section performs token joining, with an estimation using `queryJoin`.

### 7. Token Swapping

```typescript
// QuerySwap estimates the outcome of token swapping within the pool.
// It helps to determine the expected result before executing the actual swap transaction.

// Define the swap parameters
const amount = fp(10);
const querySwap = await balancerQueries.querySwap(
  {
    poolId: poolId,
    kind: SwapKind.GivenIn,
    assetIn: erc20.address,
    assetOut: erc202.address,
    amount,
    userData: '0x',
  },
  funds
);

const swap = await vault.swap(
  {
    kind: SwapKind.GivenIn,
    poolId,
    assetIn: erc20.address,
    assetOut: erc202.address,
    amount: fp(10),
    userData: '0x',
  },
  funds,
  0,
  MAX_UINT256,
  { gasLimit: 30000000 }
);
await swap.wait();
```

This section performs token swapping within the pool, with an estimation using `querySwap`.

### 8. Exiting the Pool

```typescript
// QueryExit estimates the outcome of exiting the pool and retrieving tokens.
// It helps to determine the expected result before executing the actual exit transaction.

// Define the exit parameters
const queryExit = await balancerQueries.queryExit(poolId, sender, recipient, {
  assets: [erc20.address, erc202.address, erc203.address].sort(),
  minAmountsOut: [
    ethers.utils.parseEther('0'),
    ethers.utils.parseEther('0'),
    ethers.utils.parseEther('0'),
  ],
  userData: StablePoolEncoder.exitExactBptInForTokensOut(
    ethers.utils.parseEther('100000000')
  ),
  toInternalBalance: false,
});

const txExit = await vault.exitPool(
  poolId,
  sender,
  recipient,
  {
    assets: [erc20.address, erc202.address, erc203.address].sort(),
    minAmountsOut: [
      ethers.utils.parseEther('0'),
      ethers.utils.parseEther('0'),
      ethers.utils.parseEther('0'),
    ],
    userData: StablePoolEncoder.exitExactBptInForTokensOut(
      ethers.utils.parseEther('2999')
    ),
    toInternalBalance: false,
  },
  { gasLimit: 30000000 }
);
await txExit.await();
```

This section exits the pool to retrieve tokens, with an estimation using `queryExit`.

### Additional Notes:
