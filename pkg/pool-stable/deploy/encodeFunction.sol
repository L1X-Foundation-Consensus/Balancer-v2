pragma solidity ^0.7.0;

contract contractToEncodeFuctionCall {
    function getPoolId() public view returns (bool) {
        return true;
    }

    function getPoolTokens(bytes32 poolId) external view returns (bool) {
        return true;
    }

    function approve(address delegate, uint256 numTokens) public returns (bool) {
        return true;
    }

    function setRelayerApproval(
        address sender,
        address relayer,
        bool approved
    ) external {
        return;
    }

    function allowance(address owner, address delegate) public view returns (bool) {
        return true;
    }
}
