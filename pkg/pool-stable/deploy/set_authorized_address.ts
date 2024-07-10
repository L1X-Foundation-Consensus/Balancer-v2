import { actionId } from '@balancer-labs/v2-helpers/src/models/misc/actions';
async function main() {
  try {
    const { ethers } = require("ethers");
    const fs = require("fs");

    // Read Authorizer ABI
    const authorizerAbiPath = "/home/user1/l1x/l1x-balancer-v2/pkg/pool-stable/artifacts/contracts/Authorizer.sol/Authorizer.json";
    const authorizerAbiData = fs.readFileSync(authorizerAbiPath);
    const authorizerABI = JSON.parse(authorizerAbiData).abi;

    // Authorizer contract address
    const authorizerAddress = "0x6E474e76ACFAA69a3A9b3F21fF48cFDd888834dD";

    // Create provider for Authorizer
    const authorizerProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:50051");

    // Assuming you have a wallet with a private key
    const privateKey = "6913aeae91daf21a8381b1af75272fe6fae8ec4a21110674815c8f0691e32758"; // Replace with your private key
    const wallet = new ethers.Wallet(privateKey, authorizerProvider);

    // Connect the wallet to a signer
    const connectedWallet = wallet.connect(authorizerProvider);

    // Create instance of Authorizer contract with the connected wallet
    const authorizerContract = new ethers.Contract(authorizerAddress, authorizerABI, connectedWallet);

    // Read Vault ABI
    const vaultAbiPath = "/home/user1/l1x/l1x-balancer-v2/pkg/pool-stable/artifacts/contracts/Vault.sol/Vault.json";
    const vaultAbiData = fs.readFileSync(vaultAbiPath);
    const vaultABI = JSON.parse(vaultAbiData).abi;

    // Vault contract address
    const vaultAddress = "0x8E192Badc595C70Be25cbd1D4865e0c24aA92C29";

    // Create instance of Vault contract with the connected wallet
    const vaultContract = new ethers.Contract(vaultAddress, vaultABI, connectedWallet);

    // Call the actionId function to get the action ID for 'swap'
    const actionSwap = await actionId(vaultContract, 'swap');

    // Call the grantRole function on the Authorizer contract
    const tx = await authorizerContract.grantRole(actionSwap, '0x221410a2f72b853239238f8bb21148c74e93f4cc');

    // Wait for the transaction to be mined
    await tx.wait();

    console.log("Role granted successfully!");

  } catch (error) {
    console.error("Error:", error);
  }
}

// Execute main function
main();
