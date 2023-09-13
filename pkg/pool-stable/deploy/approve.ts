// import { Input, bignumberToNumber } from './deploy';
import { ethers } from 'hardhat';
import fs from 'fs';
export const filePath = './deploy/input.json';
async function main() {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
  console.log('JSON Data:', jsonData);
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  const charlie = signers[2];

  const erc20Factory = await ethers.getContractFactory('MYERC20');

  const erc20Params = {
    _name: 'wETHUSDC',
    _symbol: 'wETHUSDC',
    _decimals: 18,
    initialSupply: ethers.utils.parseUnits('1000000000', 0),
  };

  const erc20 = await erc20Factory.deploy(
    erc20Params.initialSupply,
    erc20Params._name,
    erc20Params._symbol,
    erc20Params._decimals,
    { gasLimit: 30000000 }
  );

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

  const erc20ApprovalTx = await erc20.populateTransaction.approve(
    jsonData.vault,
    ethers.utils.parseEther(jsonData.approveCall.amount)
  );

  console.log('approve erc20 bytecode', erc20ApprovalTx);

  const erc202ApprovalTx = await erc202.populateTransaction.approve(
    jsonData.vault,
    ethers.utils.parseEther(jsonData.approveCall.amount)
  );

  console.log('approve erc201 bytecode', erc202ApprovalTx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
