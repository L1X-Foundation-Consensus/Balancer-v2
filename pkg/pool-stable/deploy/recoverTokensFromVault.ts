import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';
// Import Ethers.js
const { ethers } = require("hardhat");

// The token contract address (VAULT)
const vaultContractAddress = '0xfE03B59de58847D872335dff0a099B81278F8f09';

// The pool id
const poolId = '0xd7647bfd7216a9644e95aaa738e5084d0f382cb800000000000000000000000e';

// The amount of tokens to transfer (adjusted for decimals, e.g., 100 tokens with 18 decimals)
// const amount = ethers.utils.parseUnits('100', 18); // Adjust the decimals according to your token

async function moveTokens() {
    try {
        const signers = await ethers.getSigners();
        const deployer = signers[0];


        // Create a contract instance
        const vaultContractInstance = await ethers.getContractFactory('Vault');
        const vaultContract = vaultContractInstance.attach(vaultContractAddress)

        const getPoolTokens = await vaultContract.getPoolTokens(poolId);
        console.log("getPoolTokens:", getPoolTokens)

        // Transfer the tokens from the contract to the recipient
        const ethTxExitBob = await vaultContract.exitPool(
            poolId, // pool id
            deployer.address,
            deployer.address,
            {
                assets: getPoolTokens[0],
                minAmountsOut: [
                    0,
                    0,
                    0
                ],
                toInternalBalance: false,
                userData: StablePoolEncoder.exitExactBptInForTokensOut("282052982530000000000000"),
            }
        );

        // Wait for the transaction to be mined
        await ethTxExitBob.wait();

        console.log('Transaction confirmed:', ethTxExitBob);
    } catch (error) {
        console.error('Error transferring tokens:', error);
    }
}

// Execute the function
moveTokens();
