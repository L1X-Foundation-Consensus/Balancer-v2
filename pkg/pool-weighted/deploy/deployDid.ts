const { ethers } = require('hardhat');
const fs = require('fs');
async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  const charlie = signers[2];
  console.log('Deploying contracts with the account:', deployer.address);
  const didFactory = await ethers.getContractFactory('Did');
  const privateKey = 'f6b82b53ecbe1978b8651f740739b1d181f0285381e65e5e3491d8e821ab9bd0';
  const wallet = new ethers.Wallet(privateKey);
  const didDocument = {
    '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/ed25519-2020/v1'],
    id: 'did:l1x:84e7f4eacb478bf74a4974e2384a08c85a2c7661ef627691e937cdf47ef86f7a',
    assertionMethod: [
      {
        id: 'did:l1x:84e7f4eacb478bf74a4974e2384a08c85a2c7661ef627691e937cdf47ef86f7a',
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: 'did:l1x:84e7f4eacb478bf74a4974e2384a08c85a2c7661ef627691e937cdf47ef86f7a',
        publicKeyMultibase:
          '7a323751625a426d4366737637447771355a3743787a6d514e4c427766556b34515569783463346332796f567337',
      },
    ],
  };

  const did = await didFactory.deploy();

  fs.writeFileSync('./creationCode/did.txt', didFactory.bytecode.substring(2));
  console.log('public key', wallet.publicKey);
  // remove 0x
  console.log('public key', wallet.publicKey.substring(2));
  const publicKey =
    '0x047f60fb901bdbc58996e0800f0f7d01b5d9a010f80f075ede7e05585a877376744951e64b29facf7eb75cabdc9365f395b13b994f658b22704c902a7b30e26f32';

  // USE WALLET TO GET ADDRESS
  console.log('address', wallet.address);

  // 0xdd518e18f6b380e9fc8f47b85e26dd6496b183395133bbca2349c4614352b236
  console.log('did', did.address);
  const messageHash = ethers.utils.solidityKeccak256(
    ['string', 'string'],
    [didDocument.id, JSON.stringify(didDocument)]
  );

  // Sign the message hash
  const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
  const signature1 = await deployer.signMessage(ethers.utils.arrayify(messageHash));
  console.log('Signature:', signature);
  console.log('Signature1:', signature1);

  await did.createDID(didDocument.id, JSON.stringify(didDocument), signature1);

  console.log(
    'create bytecode',
    await did.connect(wallet).populateTransaction.createDID(didDocument.id, JSON.stringify(didDocument), signature)
  );

  console.log(await did.fetchDID(didDocument.id));

  console.log('fetch bytecode', await did.populateTransaction.fetchDID(didDocument.id));

  didDocument['@context'].push('https://www.w3.org/2018/credentials/v1');
  didDocument['@context'] = didDocument['@context'];
  const messageHash1 = ethers.utils.solidityKeccak256(
    ['string', 'string'],
    [didDocument.id, JSON.stringify(didDocument)]
  );

  const signature2 = await wallet.signMessage(ethers.utils.arrayify(messageHash1));

  console.log(
    'update bytecode',
    await did.populateTransaction.updateDID(didDocument.id, JSON.stringify(didDocument), signature2)
  );

  const signature3 = await deployer.signMessage(ethers.utils.arrayify(messageHash1));

  await did.updateDID(didDocument.id, JSON.stringify(didDocument), signature3);
  console.log(await did.fetchDID(didDocument.id));
  console.log('revokeDID bytecode', await did.populateTransaction.revokeDID(didDocument.id, signature2));
  await did.revokeDID(didDocument.id, signature3);
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
