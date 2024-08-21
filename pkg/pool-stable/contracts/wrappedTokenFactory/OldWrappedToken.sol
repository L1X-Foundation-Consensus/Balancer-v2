// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract OldWrappedToken is ReentrancyGuard {
    using SafeMath for uint256;

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
    event Mint(address indexed dst, uint256 wad);
    event OwnerChanged(address indexed previousOwner, address indexed newOwner);

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
        owner = msg.sender;
    }

    // Modifier to check if the sender is the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _; // Continue with the function if the sender is the owner
    } 
    
    // Modifier to check if the address is valid
    modifier validAddress(address addr) {
        require(addr != address(0), "Address cannot be zero address");
        _;
    }
    
    // Mint function that allows the owner to create new tokens
    function mint(uint256 amount, address _user) 
        public 
        onlyOwner 
        validAddress(_user) 
        nonReentrant 
    {
        require(amount < MAX_UINT256, "Exceed max uint256");
        balanceOf[_user] = balanceOf[_user].add(amount);
        totalSupply = totalSupply.add(amount);
        emit Mint(_user, amount);
    }

    function approve(address spender, uint256 amount, address _user) 
        public 
        validAddress(spender) 
        nonReentrant 
        returns (bool) 
    {
        require(_user == msg.sender, "Invalid Caller");
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address recipient, uint256 amount) public nonReentrant returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public nonReentrant returns (bool) {
        require(amount <= allowance[sender][msg.sender], "Transfer amount exceeds allowance");
        allowance[sender][msg.sender] = allowance[sender][msg.sender].sub(amount);
        _transfer(sender, recipient, amount);
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "Cannot transfer from the zero address");
        require(recipient != address(0), "Cannot transfer to the zero address");
        require(balanceOf[sender] >= amount, "Insufficient balance");

        balanceOf[sender] = balanceOf[sender].sub(amount);
        balanceOf[recipient] = balanceOf[recipient].add(amount);

        emit Transfer(sender, recipient, amount);
    }
    
    // Function to change the owner
    function setOwner(address newOwner) 
        public 
        onlyOwner 
        validAddress(newOwner) 
        nonReentrant 
    {
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }
}