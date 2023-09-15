"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.filePath = void 0;
var hardhat_1 = require("hardhat");
var ethers = hardhat_1["default"].ethers;
var fs_1 = require("fs");
exports.filePath = './deploy/input.json';
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var data, jsonData, signers, deployer, bob, charlie, erc20Factory, erc20Params, erc20, erc20Params2, erc202, erc20ApprovalTx, erc202ApprovalTx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = fs_1["default"].readFileSync(exports.filePath, 'utf8');
                    jsonData = JSON.parse(data);
                    console.log('JSON Data:', jsonData);
                    return [4 /*yield*/, ethers.getSigners()];
                case 1:
                    signers = _a.sent();
                    deployer = signers[0];
                    bob = signers[1];
                    charlie = signers[2];
                    return [4 /*yield*/, ethers.getContractFactory('MYERC20')];
                case 2:
                    erc20Factory = _a.sent();
                    erc20Params = {
                        _name: 'wETHUSDC',
                        _symbol: 'wETHUSDC',
                        _decimals: 18,
                        initialSupply: ethers.utils.parseUnits('1000000000', 0)
                    };
                    return [4 /*yield*/, erc20Factory.deploy(erc20Params.initialSupply, erc20Params._name, erc20Params._symbol, erc20Params._decimals, { gasLimit: 30000000 })];
                case 3:
                    erc20 = _a.sent();
                    erc20Params2 = {
                        _name: 'wETHUSDT',
                        _symbol: 'wETHUSDT',
                        _decimals: 18,
                        initialSupply: ethers.utils.parseUnits('1000000000', 0)
                    };
                    return [4 /*yield*/, erc20Factory.deploy(erc20Params2.initialSupply, erc20Params2._name, erc20Params2._symbol, erc20Params2._decimals, { gasLimit: 30000000 })];
                case 4:
                    erc202 = _a.sent();
                    return [4 /*yield*/, erc20.populateTransaction.approve(jsonData.vault, ethers.utils.parseEther(jsonData.approveCall.amount))];
                case 5:
                    erc20ApprovalTx = _a.sent();
                    console.log('approve erc20 bytecode', erc20ApprovalTx);
                    return [4 /*yield*/, erc202.populateTransaction.approve(jsonData.vault, ethers.utils.parseEther(jsonData.approveCall.amount))];
                case 6:
                    erc202ApprovalTx = _a.sent();
                    console.log('approve erc201 bytecode', erc202ApprovalTx);
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () { return process.exit(0); })["catch"](function (error) {
    console.error(error);
    process.exit(1);
});
