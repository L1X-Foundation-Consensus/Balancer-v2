// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./Revert1.sol";

contract Revert {
    uint256 public myNumber;
    uint256 public myNumber1;
    Revert1 public revert1;

    constructor(uint256 initialNumber, uint256 initialNumber1, Revert1 _revert1) {
        myNumber = initialNumber;
        myNumber1 = initialNumber1;
        revert1 = _revert1;
    }

    function setNumber(uint256 newNumber, uint256 newNumber1, uint256 newNumber2, uint256 newNumber3) public {
        require(newNumber != 0, "Number can not be 0");
        myNumber = newNumber;
        require(newNumber1 < 100, "Number can not be larger than 100");
        myNumber1 = newNumber1;
        revert1.setNumber(newNumber2, newNumber3);
    }
}
