import { Input, toBytes32 } from './deploy';
import { ethers } from 'hardhat';
import fs from 'fs';
export const filePath = './deploy/input.json';
async function main() {
  const AuthorizerFactory = await ethers.getContractFactory('Authorizer');
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData: Input = JSON.parse(data);
    fs.writeFileSync(
      jsonData.dumpPath + '/creationAuthorizer.txt',
      AuthorizerFactory.bytecode.substring(2) +
        AuthorizerFactory.interface.encodeDeploy([toBytes32(10), jsonData.owner, jsonData.owner]).slice(2)
    );
  } catch (err) {
    console.error('Error reading or writing file:', err);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
