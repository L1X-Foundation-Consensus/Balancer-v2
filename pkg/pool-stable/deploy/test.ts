import { FundManagement, SwapKind, WeightedPoolEncoder } from '@balancer-labs/balancer-js';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';
import { MAX_UINT256, ZERO_ADDRESS } from '@balancer-labs/v2-helpers/src/constants';
import { BigNumber, BigNumberish, fp } from '@balancer-labs/v2-helpers/src/numbers';
const { ethers } = require('hardhat');
const fs = require('fs');
export const filePath = './deploy/input.json';
// give me random address
const alice = '0x7B7AB20f75B691E90c546e89E41aA23b0A821444';
async function main() {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  const charlie = signers[2];
  console.log('Deploying contracts with the account:', deployer.address);

  // Contract USDC deployed to: 0x2Fe1f7d719fdfa37e52b8D24e3d2F6eF9eE2E65d
  // Contract USDT deployed to: 0x92aae8806648C2c2239815AB86A78583cBC6041F
  // Contract BUSD deployed to: 0x30bC74e8E617BC9122179928385E131819678901
  // Contract weth deployed to: 0x2ACdB6E456E46216065c52917c4C7b665345D2AD
  // Contract authorizer deployed to: 0xf0B2Af5eEC048CE396bC48EeE40A2b051439d59c
  // Contract vault deployed to: 0xB27D09D2DFE39346a3ff9a4E03c9cbC18453b2d9
  // Contract balancerQueries deployed to: 0xBe220Ae37F54971259e8A5973dfd3F216fC46EAA
  // Contract protovol fee deployed to: 0x2247B8a03304D011181C37D363C5E453A6E747A9
  // Contract rate provider deployed to: 0x696A39fD203Dd04965257a687322e6F5eA772ae6
  // Contract rate provider 2 deployed to: 0xB6A374E430b6AE1Ce651760431137D8199f0B4B4
  // Contract rate provider 3 deployed to: 0xCCE32C1548b32A234021Ce0ddbdC8d414db47aF9

  // pool deployed to: 0xfDB4F76B5395cA8414Bdc902Bec188E980cD6b67
  // pool id 0xfdb4f76b5395ca8414bdc902bec188e980cd6b67000000000000000000000000
  const vault = await ethers.getContractAt('Vault', '0xB27D09D2DFE39346a3ff9a4E03c9cbC18453b2d9');

  await vault.joinPool(
    jsonData.TokenListByPoolIdCall.poolId, // pool id
    jsonData.joinPoolCall.address,
    jsonData.joinPoolCall.address,
    {
      assets: jsonData.joinPoolCall.tokenInfo,
      maxAmountsIn: [MAX_UINT256, MAX_UINT256, MAX_UINT256, MAX_UINT256],
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut([0, ethers.utils.parseEther('1'), 0], 0),
    }
  );
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


// WAIT ON DAY
// Contract USDC deployed to: 0xe4506C7C1C110c2AaC7fcf53415703fD08aF99A6
// Contract USDT deployed to: 0xfF7190e35d69d8Fb00695707E42E66c46277Ba44
// Contract BUSD deployed to: 0x29Bac7F65020D6DC6b22263ac1609F194454EeF2
// Contract weth deployed to: 0xD8e494c237721F8b7c712aC2994D1ED25e842Dd1
// Contract authorizer deployed to: 0xd257b50ac909bd16d68fb4507Aa5330aE9955B70
// Contract vault deployed to: 0x2A3Fb732Fa2Fed9B580B7c001054199e52399494
// Contract balancerQueries deployed to: 0x57791d8b198E2eDD5dB19b8b2188bF402c98847f
// Contract protovol fee deployed to: 0xbD75DbDA896A540535B376D78A5232aB7D528c0c
// Contract rate provider deployed to: 0x919CE28Bc32a01616aa2C53B9D5A4878E93e424c
// Contract rate provider 2 deployed to: 0x6AaE306Bd3A77E666e59FFF6fc16BD7c1294F5D4
// Contract rate provider 3 deployed to: 0x6D653fDA58Ab4d354FbCb7BC16A999F71B85a255
// [
//   '0x29Bac7F65020D6DC6b22263ac1609F194454EeF2',
//   '0xe4506C7C1C110c2AaC7fcf53415703fD08aF99A6',
//   '0xfF7190e35d69d8Fb00695707E42E66c46277Ba44'
// ]
// [
//   '0x6AaE306Bd3A77E666e59FFF6fc16BD7c1294F5D4',
//   '0x6D653fDA58Ab4d354FbCb7BC16A999F71B85a255',
//   '0x919CE28Bc32a01616aa2C53B9D5A4878E93e424c'
// ]
// pool deployed to: 0xB01316E4c6a1A1674B6d64e7bd3bE316001Fdb58
// pool id 0xb01316e4c6a1a1674b6d64e7bd3be316001fdb58000000000000000000000000