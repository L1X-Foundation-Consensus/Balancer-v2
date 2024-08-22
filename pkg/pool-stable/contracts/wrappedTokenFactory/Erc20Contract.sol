// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract L1X_EVM_TOKEN is ERC20, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    constructor(string memory name, string memory symbol, uint8 decimals, uint256 initialSupply) ERC20(name, symbol) {
        _setupDecimals(decimals);
        _mint(msg.sender, initialSupply.mul(10 ** decimals));
    }

    function mint(address account, uint256 amount) public onlyOwner nonReentrant {
        _mint(account, amount);
    }
}