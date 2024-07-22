import { StablePoolEncoder } from '@balancer-labs/balancer-js';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';

const { ethers } = require('hardhat');

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  console.log('Deploying contracts with the account:', deployer.address);
  const erc20Factory = await ethers.getContractFactory('ERC20');
  let currentNonce = 60466;
  console.log('current nonce',currentNonce);
//   console.log('deploying ETHEREUM WRAPPED TOKENS')
//   const L1XETHParam = {
//     _name: 'L1XETH',
//     _symbol: 'L1XETH',
//   };
//   const L1XETHContract = await erc20Factory.deploy(L1XETHParam._name, L1XETHParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XETH deployed to:', L1XETHContract.address);
//   currentNonce ++

//   const L1XETHUSDTParam = {
//     _name: 'L1XETHUSDT',
//     _symbol: 'L1XETHUSDT',
//   };
//   const L1XETHUSDTContract = await erc20Factory.deploy(L1XETHUSDTParam._name, L1XETHUSDTParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XETHUSDT deployed to:', L1XETHUSDTContract.address);
//   currentNonce ++

//   const L1XETHUSDCParam = {
//     _name: 'L1XETHUSDC',
//     _symbol: 'L1XETHUSDC',
//   };
//   const L1XETHUSDCContract = await erc20Factory.deploy(L1XETHUSDCParam._name, L1XETHUSDCParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XETHUSDC deployed to:', L1XETHUSDCContract.address);
//   currentNonce ++
//   /*--------------------------------------------------------------------------------------------------------------------*/
//   console.log('deploying BINANCE WRAPPED TOKENS')
//   const L1XBSCParam = {
//     _name: 'L1XBSC',
//     _symbol: 'L1XBSC',
//   };
//   const L1XBSCContract = await erc20Factory.deploy(L1XBSCParam._name, L1XBSCParam._symbol, {
//     nonce: currentNonce
// });

//   console.log('Contract L1XBSC deployed to:', L1XBSCContract.address);
//   currentNonce ++

//   const L1XBSCUSDCCParam = {
//     _name: 'L1XBSCUSDC',
//     _symbol: 'L1XBSCUSDC',
//   };
//   const L1XBSCUSDCContract = await erc20Factory.deploy(L1XBSCUSDCCParam._name, L1XBSCUSDCCParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XBSCUSDC deployed to:', L1XBSCUSDCContract.address);
//   currentNonce ++

//   const L1XBSCUSDTParam = {
//     _name: 'L1XBSCUSDT',
//     _symbol: 'L1XBSCUSDT',
//   };
//   const L1XBSCUSDTContract = await erc20Factory.deploy(L1XBSCUSDTParam._name, L1XBSCUSDTParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XBSCUSDT deployed to:', L1XBSCUSDTContract.address);
//   currentNonce ++
// /*--------------------------------------------------------------------------------------------------------------------*/
// console.log('deploying POLYGON WRAPPED TOKENS')
//   const L1XMATICParam = {
//     _name: 'L1XMATIC',
//     _symbol: 'L1XMATIC',
//   };
//   const L1XMATICContract = await erc20Factory.deploy(L1XMATICParam._name, L1XMATICParam._symbol, {
//     nonce: currentNonce
// });

//   console.log('Contract L1XMATIC deployed to:', L1XMATICContract.address);
//   currentNonce ++

//   const L1XMATICUSDCCParam = {
//     _name: 'L1XMATICUSDC',
//     _symbol: 'L1XMATICUSDC',
//   };
//   const L1XMATICUSDCContract = await erc20Factory.deploy(L1XMATICUSDCCParam._name, L1XMATICUSDCCParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XMATICUSDC deployed to:', L1XMATICUSDCContract.address);
//   currentNonce ++

//   const L1XMATICUSDTParam = {
//     _name: 'L1XMATICUSDT',
//     _symbol: 'L1XMATICUSDT',
//   };
//   const L1XMATICUSDTContract = await erc20Factory.deploy(L1XMATICUSDTParam._name, L1XMATICUSDTParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XMATICUSDT deployed to:', L1XMATICUSDTContract.address);
//   currentNonce ++
// /*--------------------------------------------------------------------------------------------------------------------*/
// console.log('deploying AVALANCHE WRAPPED TOKENS')
//   const L1XAVAXParam = {
//     _name: 'L1XAVAX',
//     _symbol: 'L1XAVAX',
//   };
//   const L1XAVAXContract = await erc20Factory.deploy(L1XAVAXParam._name, L1XAVAXParam._symbol, {
//     nonce: currentNonce
// });

//   console.log('Contract L1XAVAX deployed to:', L1XAVAXContract.address);
//   currentNonce ++

//   const L1XAVAXUSDCCParam = {
//     _name: 'L1XAVAXUSDC',
//     _symbol: 'L1XAVAXUSDC',
//   };
//   const L1XAVAXUSDCContract = await erc20Factory.deploy(L1XAVAXUSDCCParam._name, L1XAVAXUSDCCParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XAVAXUSDC deployed to:', L1XAVAXUSDCContract.address);
//   currentNonce ++

//   const L1XAVAXUSDTParam = {
//     _name: 'L1XAVAXUSDT',
//     _symbol: 'L1XAVAXUSDT',
//   };
//   const L1XAVAXUSDTContract = await erc20Factory.deploy(L1XAVAXUSDTParam._name, L1XAVAXUSDTParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XAVAXUSDT deployed to:', L1XAVAXUSDTContract.address);
//   currentNonce ++
// /*--------------------------------------------------------------------------------------------------------------------*/
// console.log('deploying ARBITRUM_ONE WRAPPED TOKENS')
//   const L1XARBParam = {
//     _name: 'L1XARB',
//     _symbol: 'L1XARB',
//   };
//   const L1XARBContract = await erc20Factory.deploy(L1XARBParam._name, L1XARBParam._symbol, {
//     nonce: currentNonce
// });

//   console.log('Contract L1XARB deployed to:', L1XARBContract.address);
//   currentNonce ++

//   const L1XARBUSDCCParam = {
//     _name: 'L1XARBUSDC',
//     _symbol: 'L1XARBUSDC',
//   };
//   const L1XARBUSDCContract = await erc20Factory.deploy(L1XARBUSDCCParam._name, L1XARBUSDCCParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XARBUSDC deployed to:', L1XARBUSDCContract.address);
//   currentNonce ++

//   const L1XARBUSDTParam = {
//     _name: 'L1XARBUSDT',
//     _symbol: 'L1XARBUSDT',
//   };
//   const L1XARBUSDTContract = await erc20Factory.deploy(L1XARBUSDTParam._name, L1XARBUSDTParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XARBUSDT deployed to:', L1XARBUSDTContract.address);
//   currentNonce ++
// /*--------------------------------------------------------------------------------------------------------------------*/
// console.log('deploying OPTIMISM WRAPPED TOKENS')
//   const L1XOPTParam = {
//     _name: 'L1XOPT',
//     _symbol: 'L1XOPT',
//   };
//   const L1XOPTContract = await erc20Factory.deploy(L1XOPTParam._name, L1XOPTParam._symbol, {
//     nonce: currentNonce
// });

//   console.log('Contract L1XOPT deployed to:', L1XOPTContract.address);
//   currentNonce ++

//   const L1XOPTUSDCCParam = {
//     _name: 'L1XOPTUSDC',
//     _symbol: 'L1XOPTUSDC',
//   };
//   const L1XOPTUSDCContract = await erc20Factory.deploy(L1XOPTUSDCCParam._name, L1XOPTUSDCCParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XOPTUSDC deployed to:', L1XOPTUSDCContract.address);
//   currentNonce ++

//   const L1XOPTUSDTParam = {
//     _name: 'L1XOPTUSDT',
//     _symbol: 'L1XOPTUSDT',
//   };
//   const L1XOPTUSDTContract = await erc20Factory.deploy(L1XOPTUSDTParam._name, L1XOPTUSDTParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XOPTUSDT deployed to:', L1XOPTUSDTContract.address);
//   currentNonce ++
// /*--------------------------------------------------------------------------------------------------------------------*/
// console.log('deploying SOLANA WRAPPED TOKENS')
//   const L1XSOLParam = {
//     _name: 'L1XSOL',
//     _symbol: 'L1XSOL',
//   };
//   const L1XSOLContract = await erc20Factory.deploy(L1XSOLParam._name, L1XSOLParam._symbol, {
//     nonce: currentNonce
// });

//   console.log('Contract L1XSOL deployed to:', L1XSOLContract.address);
//   currentNonce ++

//   const L1XSOLUSDCCParam = {
//     _name: 'L1XSOLUSDC',
//     _symbol: 'L1XSOLUSDC',
//   };
//   const L1XSOLUSDCContract = await erc20Factory.deploy(L1XSOLUSDCCParam._name, L1XSOLUSDCCParam._symbol, {
//     nonce: currentNonce
//   });

//   console.log('Contract L1XSOLUSDC deployed to:', L1XSOLUSDCContract.address);
//   currentNonce ++

  const L1XSOLUSDTParam = {
    _name: 'L1XSOLUSDT',
    _symbol: 'L1XSOLUSDT',
  };
  const L1XSOLUSDTContract = await erc20Factory.deploy(L1XSOLUSDTParam._name, L1XSOLUSDTParam._symbol, {
    nonce: currentNonce
  });
  currentNonce ++

/*--------------------------------------------------------------------------------------------------------------------*/
  await L1XSOLUSDTContract
    .connect(deployer)
    ._mint(deployer.address,ethers.utils.parseEther('1000000000'), {
      nonce: currentNonce
    } );

  console.log('Contract L1XSOLUSDT deployed to:', L1XSOLUSDTContract.address);
  currentNonce ++
/*--------------------------------------------------------------------------------------------------------------------*/
console.log('My balance before transferring:', await L1XSOLUSDTContract.connect(deployer).balanceOf(deployer.address));

await L1XSOLUSDTContract
  .connect(deployer)
  .transfer("0x4C52CBE3aB1270949b15333a58Ef9B6C4AB030b7", ethers.utils.parseEther('100000000'), {
    nonce: currentNonce
  } );

  console.log('Contract L1XSOLUSDT deployed to:', L1XSOLUSDTContract.address);
  currentNonce ++
  /*--------------------------------------------------------------------------------------------------------------------*/
  console.log('My balance after transferring:', await L1XSOLUSDTContract.connect(deployer).balanceOf(deployer.address));
  /*--------------------------------------------------------------------------------------------------------------------*/
}

// Execute main function
main();

function waitFiveSeconds() {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 10000);
  });
}

export function bignumberToNumber(num: any) {
  return num.div(ethers.BigNumber.from(10).pow(18)).toNumber();
}

