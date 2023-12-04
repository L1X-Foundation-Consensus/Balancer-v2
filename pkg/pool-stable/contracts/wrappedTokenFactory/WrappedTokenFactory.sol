// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.7.0;

import "./WrappedToken.sol";

contract WrappedTokenFactory {
    mapping(string => address) public getWrappedToken;
    address[] public allWrappedToken;
    event WrappedTokenCreated(string indexed name, string indexed symbol, uint8 decimal);

    function createWrappedToken2(
        string calldata _name,
        string calldata _symbol,
        uint8 _decimal
    ) external returns (address tokenAddr) {
        require(getWrappedToken[_name] == address(0), "Error: Address already exist");
        bytes32 salt = keccak256(abi.encodePacked(msg.sender, _name, _symbol, _decimal));

        WrappedToken token = new WrappedToken{ salt: salt }();

        token.initialize(_name, _symbol, _decimal);

        tokenAddr = address(token);
        allWrappedToken.push(tokenAddr);
        getWrappedToken[_name] = tokenAddr;
        return tokenAddr;
    }

    function calculateAddr(
        string calldata _name,
        string calldata _symbol,
        uint8 _decimal
    ) public view returns (address predictedAddress) {
        bytes32 salt = keccak256(abi.encodePacked(msg.sender, _name, _symbol, _decimal));

        predictedAddress = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(type(WrappedToken).creationCode))
                    )
                )
            )
        );
    }
}
