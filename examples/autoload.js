#!/usr/bin/env -S tsx
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var index_js_1 = require("../src/index.js");
var provider = new ethers_1.ethers.IpcSocketProvider("/srv/black/reth/reth.ipc");
var env = {
    INFURA_API_KEY: process.env.INFURA_API_KEY,
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
    PROVIDER: provider,
    //PROVIDER: process.env.PROVIDER,
    NETWORK: process.env.NETWORK,
};
//const provider = env.INFURA_API_KEY ? (new ethers.InfuraProvider("homestead", env.INFURA_API_KEY)) : ethers.getDefaultProvider(env.NETWORK || "homestead");
//const provider = new ethers.providers.IpcProvider("/srv/black/reth/reth.ipc");
// Helper
// https://stackoverflow.com/questions/11731072/dividing-an-array-by-filter-function 
var partitionBy = function (arr, predicate) {
    return arr.reduce(function (acc, item, index, array) {
        acc[+!predicate(item, index, array)].push(item);
        return acc;
    }, [[], []]);
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var address, code, selectors, abi;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    address = process.env["ADDRESS"] || process.argv[2];
                    if (!address) {
                        console.log("Usage: autoload.ts ADDRESS");
                        process.exit(1);
                    }
                    return [4 /*yield*/, provider.getCode(address)];
                case 1:
                    code = _a.sent();
                    selectors = index_js_1.whatsabi.selectorsFromBytecode(code);
                    console.log(selectors);
                    abi = index_js_1.whatsabi.abiFromBytecode(code);
                    //console.log(abi);
                    console.log(JSON.stringify(abi, null, 2));
                    if (!r.followProxies) return [3 /*break*/, 3];
                    return [4 /*yield*/, r.followProxies()];
                case 2:
                    r = _a.sent();
                    _a.label = 3;
                case 3:
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
main().then().catch(function (err) {
    console.error("Failed:", err);
    process.exit(2);
});
