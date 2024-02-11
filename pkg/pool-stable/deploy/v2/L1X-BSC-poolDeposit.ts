const { ethers } = require('hardhat');
import { BigNumber, BigNumberish, fp } from '@balancer-labs/v2-helpers/src/numbers';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';

(async () => {
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  const vaultAddress = '0xfc212EF009e458abA426977A8783b2A6b6E1eCD0';
  const bscUSDCAddress = '0x8A19130BF73EA4F5C8591491C0a1e623eECeBA11';
  const WL1XAddress = '0x0936eF494971FE035300d4af6e6b38EC1FC4c934';

  const poolId = '0xfee38a1c4324c4b6684de11bacdfb4d3bbf97c31000000000000000000000000';
  // const poolAddress = '0x44F2573bF3B10eae401618c5277A2593C0403AB6';

  const VaultFactory = await ethers.getContractFactory('Vault');
  const Vault = VaultFactory.attach(vaultAddress);

  const OldWrappedTokenFactory = await ethers.getContractFactory('OldWrappedToken');
  const bscUSDC = OldWrappedTokenFactory.attach(bscUSDCAddress);
  const WL1X = OldWrappedTokenFactory.attach(WL1XAddress);

  // L1X-BSCUSDC
  const responseBSCUSDC = await bscUSDC
    .connect(deployer)
    .deposit(ethers.utils.parseEther('1000000000'), deployer.address, vaultAddress);

  console.log('Deposit BSCUSDC: ', responseBSCUSDC);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const responseWL1X = await WL1X.connect(deployer).deposit(
    ethers.utils.parseEther('1000000000'),
    deployer.address,
    vaultAddress
  );

  console.log('Deposit WL1X: ', responseWL1X);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  let tokenInfo = await Vault.getPoolTokens(poolId);

  let amountsIn = [];
  for (let i = 0; i < tokenInfo[0].length; i++) {
    amountsIn.push(ethers.utils.parseUnits('500000000', 18));
  }

  const txJoin = await Vault.joinPool(
    poolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: tokenInfo[0],
      maxAmountsIn: [
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
      ],
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinInit(amountsIn),
    }
  );

  await txJoin.wait();

  console.log('Join Pool: ', txJoin.transactionHash);
})();
