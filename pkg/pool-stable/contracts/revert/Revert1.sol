// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract Revert1 {
    uint256 public myNumber;
    uint256 public myNumber1;

    constructor(uint256 initialNumber, uint256 initialNumber1) {
        myNumber = initialNumber;
        myNumber1 = initialNumber1;
    }

    function setNumber(uint256 newNumber, uint256 newNumber1) public {
        require(newNumber != 0, "Number can not be 0");
        myNumber = newNumber;
        require(newNumber1 < 100, "Number can not be larger than 100");
        myNumber1 = newNumber1;
    }
}
