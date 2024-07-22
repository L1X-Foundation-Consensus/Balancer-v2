import { actionId } from '@balancer-labs/v2-helpers/src/models/misc/actions';
async function main() {
  try {
    const { ethers } = require("ethers");
    const fs = require("fs");

    // Read Authorizer ABI
    const authorizerAbiPath = "/home/user1/l1x/l1x-balancer-v2/pkg/pool-stable/artifacts/contracts/ComposableStablePool.sol/ComposableStablePool.json";
    const authorizerAbiData = fs.readFileSync(authorizerAbiPath);
    const authorizerABI = JSON.parse(authorizerAbiData).abi;

    // Authorizer contract address
    const Contract_eth_USDC = "0x7D3381fce4d28e8D37F43F94F29DC2114c8695A3";

    // Create provider for Authorizer
    const Provider = new ethers.providers.JsonRpcProvider("http://54.251.122.134:50051");

    // Assuming you have a wallet with a private key
    const privateKey = "6913aeae91daf21a8381b1af75272fe6fae8ec4a21110674815c8f0691e32758"; // Replace with your private key
    const wallet = new ethers.Wallet(privateKey, Provider);

    // Connect the wallet to a signer
    const connectedWallet = wallet.connect(Provider);

    // Create instance of Authorizer contract with the connected wallet
    const TokenAccount = new ethers.Contract(Contract_eth_USDC, authorizerABI, connectedWallet);
    console.log('',await TokenAccount.balanceOf("0x78e044394595D4984F66c1B19059Bc14ecc24063"));

  } catch (error) {
    console.error("Error:", error);
  }
}

// Execute main function
main();

//1456164246135908460973806966
//999999947970731950000000000000