// Import ethers from Hardhat package
const { ethers } = require("hardhat");

async function main() {
  // Fetch the current network
  const network = await ethers.provider.getNetwork();

  // Print the Chain ID
  console.log("The Chain ID is:", network.chainId);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
