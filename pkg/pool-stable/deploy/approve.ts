import { ethers } from 'hardhat';
import fs from 'fs';
export const filePath = './deploy/input.json';
const myVariable = process.env.MY_VARIABLE;
console.log('myVariable', myVariable);
async function main() {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
  console.log('JSON Data:', jsonData);
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  const charlie = signers[2];

  const erc20Factory = await ethers.getContractFactory('OldWrappedToken');

  const erc20Params = {
    _name: 'USDC',
    _symbol: 'USDC',
    _decimals: 18,
  };

  const erc20 = await erc20Factory.deploy(erc20Params._name, erc20Params._symbol, erc20Params._decimals, {
    gasLimit: 30000000,
  });

  const erc20ApprovalTx = await erc20.populateTransaction.approve(
    jsonData.vault,
    ethers.utils.parseEther(jsonData.approveCall.amount),
    jsonData.owner
  );

  console.log('approve erc20 bytecode', erc20ApprovalTx);
  console.log('balance bytecode', await erc20.populateTransaction.balanceOf(jsonData.vault));

  console.log(
    'alloance bytecode',
    await erc20.populateTransaction.allowance('0x7B7AB20f75B691E90c546e89E41aA23b0A821444', jsonData.vault)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
