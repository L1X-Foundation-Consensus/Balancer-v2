const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);
  const poolParams = {
    vault: '0x1234567890123456789012345678901234567890',
    protocolFeeProvider: '0x9876543210987654321098765432109876543210',
    name: 'My Stable Pool',
    symbol: 'MSP',
    tokens: ['0xaabbccddeeff0011223344556677889900aabbcc', '0xffeeddccbbaa0099887766554433221100ffeedd', ''],
    rateProviders: ['0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222'],
    tokenRateCacheDurations: [3600, 3600],
    exemptFromYieldProtocolFeeFlags: [false, false],
    amplificationParameter: 1000000,
    swapFeePercentage: 2000000000000,
    pauseWindowDuration: 86400,
    bufferPeriodDuration: 172800,
    owner: '0x3333333333333333333333333333333333333333',
    version: '1.0.0',
   };
  const fs = require('fs');
  const ContractFactory = await ethers.getContractFactory('ComposableStablePool');
  console.log('Creation code:', ContractFactory.bytecode);
  fs.writeFileSync('creationCode.txt', ContractFactory.bytecode);
  const contract = await ContractFactory.deploy(poolParams, { gasLimit: 12000000 });
  console.log('Contract deployed to:', contract.address);
  const runtimeBytecode = await ethers.provider.getCode(contract.address);
  fs.writeFileSync('runtimeBytecode.txt', runtimeBytecode);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
