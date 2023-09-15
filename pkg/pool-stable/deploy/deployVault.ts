import { Input, toBytes32 } from './deploy';
import { ethers } from 'hardhat';
import fs from 'fs';

async function main() {
  const VaultFactory = await ethers.getContractFactory('Vault');
  const filePath = './deploy/input.json';
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const input: Input = JSON.parse(data);
    const vaultParams = {
      authorizer: input.authorizer,
      weth: input.weth,
      pauseWindowDuration: 0,
      bufferPeriodDuration: 0,
    };

    const encodedParams3 = VaultFactory.interface.encodeDeploy([
      input.authorizer, // change it if you deploy new authorizer
      input.weth, // change it if you deploy new weth
      vaultParams.pauseWindowDuration,
      vaultParams.bufferPeriodDuration,
    ]);
    fs.writeFileSync(
      input.dumpPath + '/creationVault.txt',
      VaultFactory.bytecode.substring(2) + encodedParams3.slice(2)
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
