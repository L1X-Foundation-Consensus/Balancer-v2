const { ethers } = require('hardhat');
const fs = require('fs');
async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  const charlie = signers[2];
  console.log('Deploying contracts with the account:', deployer.address);
  const didFactory = await ethers.getContractFactory('Did');
  const privateKey = '6d657bbe6f7604fb53bc22e0b5285d3e2ad17f64441b2dc19b648933850f9b46';
  const wallet = new ethers.Wallet(privateKey);
  let didDocument = {
    context: ['https://www.w3.org/ns/did/v1'],
    id: 'did:ethr:0x123456789abcdefghi',
    controller: '0x123456789abcdefghi',
  };

  const did = await didFactory.deploy();

  fs.writeFileSync('./creationCode/did.txt', didFactory.bytecode.substring(2));

  console.log('did', did.address);
  const messageHash = ethers.utils.solidityKeccak256(['string', 'string'], [didDocument.id, didDocument.controller]);

  // Sign the message hash
  const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

  console.log('Signature:', signature);

  await did.createDID(didDocument.id, JSON.stringify(didDocument));

  console.log('create bytecode', await did.populateTransaction.createDID(didDocument.id,  JSON.stringify(didDocument)));

  console.log('update bytecode', await did.populateTransaction.updateDID(didDocument.id,  JSON.stringify(didDocument)));

  console.log(await did.fetchDID(didDocument.id));

  console.log('fetch bytecode', await did.populateTransaction.fetchDID(didDocument.id));

  didDocument.context.push('https://www.w3.org/2018/credentials/v1');

  await did.updateDID(didDocument.id,  JSON.stringify(didDocument));
  console.log(await did.fetchDID(didDocument.id));
  await did.revokeDID(didDocument.id);
  console.log(await did.fetchDID(didDocument.id));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

interface DIDDocument {
  context: string[];
  id: string;
  controller: string;
}
