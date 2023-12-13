// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

contract Did {
    mapping(string => string) public didDocuments;

    event DIDCreated(string did, string didDocument);
    event DIDUpdated(string did, string didDocument);
    event DIDRevoked(string did);

    function createDID(string memory did, string memory didDocument, bytes memory signature) external {
        require(bytes(didDocuments[did]).length == 0, "DID already exists");

        bytes32 _msgHash = getMessageHash(did, didDocument);
        bytes32 _ethSignedMessageHash = getEthSignedMessageHash(_msgHash);
        require(_verifySignature(_ethSignedMessageHash, signature, msg.sender), "Invalid signature");

        didDocuments[did] = didDocument;

        emit DIDCreated(did, didDocument);
    }

    function updateDID(string memory did, string memory didDocument, bytes memory signature) external {
        require(bytes(didDocuments[did]).length != 0, "DID does not exist");
        bytes32 _msgHash = getMessageHash(did, didDocument);
        bytes32 _ethSignedMessageHash = getEthSignedMessageHash(_msgHash);
        require(_verifySignature(_ethSignedMessageHash, signature, msg.sender), "Invalid signature");
        didDocuments[did] = didDocument;

        emit DIDUpdated(did, didDocument);
    }

    function revokeDID(string memory did, bytes memory signature) external {
        bytes32 _msgHash = getMessageHash(did, didDocuments[did]);
        bytes32 _ethSignedMessageHash = getEthSignedMessageHash(_msgHash);
        require(_verifySignature(_ethSignedMessageHash, signature, msg.sender), "Invalid signature");
        delete didDocuments[did];
        emit DIDRevoked(did);
    }

    function fetchDID(string memory did) external view returns (string memory) {
        return didDocuments[did];
    }

    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function getMessageHash(string memory did, string memory didDocument) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(did, didDocument));
    }

    function _verifySignature(bytes32 _msgHash, bytes memory _signature, address _sender) internal pure returns (bool) {
        return _recoverSigner(_msgHash, _signature) == _sender;
    }

    function _recoverSigner(bytes32 _msgHash, bytes memory _signature) internal pure returns (address) {
        require(_signature.length == 65, "invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(_signature, 0x20))
            s := mload(add(_signature, 0x40))
            v := byte(0, mload(add(_signature, 0x60)))
        }
        return ecrecover(_msgHash, v, r, s);
    }
}
