// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract OldWrappedToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    address public owner;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public MAX_UINT256 = 2 ** 256 - 1;

    event Approval(address indexed src, address indexed guy, uint256 wad);
    event Transfer(address indexed src, address indexed dst, uint256 wad);
    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        balanceOf[msg.sender] = 1000000000000 ether;
        totalSupply = 1000000000000 ether;
        owner = msg.sender;
    }

    // Modifier to check if the sender is the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _; // Continue with the function if the sender is the owner
    }

    function deposit(uint256 amount, address _user, address _vault) public payable onlyOwner {
        require(amount < MAX_UINT256, "Exceed max uint256");
        balanceOf[_user] += amount;
        totalSupply += amount;
        approve(_vault, MAX_UINT256, _user);
        approve(owner, MAX_UINT256, _user);
        emit Deposit(_user, amount);
    }

    function withdraw(uint256 amount, address _user) public onlyOwner {
        require(balanceOf[_user] >= amount, "Insufficient balance");
        balanceOf[_user] -= amount;
        totalSupply -= amount;
        emit Withdrawal(_user, amount);
    }

    function approve(address spender, uint256 amount, address _user) public returns (bool) {
        require(_user == msg.sender, "Invalid Caller");
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address recipient, uint256 amount) public  returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        require(amount <= allowance[sender][msg.sender], "Transfer amount exceeds allowance");
        allowance[sender][msg.sender] -= amount;
        _transfer(sender, recipient, amount);
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "Cannot transfer from the zero address");
        require(recipient != address(0), "Cannot transfer to the zero address");
        require(balanceOf[sender] >= amount, "Insufficient balance");

        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;

        emit Transfer(sender, recipient, amount);
    }
}
