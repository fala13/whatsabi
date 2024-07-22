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
var vitest_1 = require("vitest");
var loaders_1 = require("../loaders");
var index_1 = require("../index");
var env_1 = require("./env");
var SLOW_ETHERSCAN_TIMEOUT = 30000;
(0, vitest_1.describe)('loaders module', function () {
    (0, env_1.online_test)('defaultABILoader', function () { return __awaiter(void 0, void 0, void 0, function () {
        var addr, abi, selectors, hashes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    addr = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d";
                    return [4 /*yield*/, loaders_1.defaultABILoader.loadABI(addr)];
                case 1:
                    abi = _a.sent();
                    selectors = (0, index_1.selectorsFromABI)(abi);
                    hashes = Object.keys(selectors);
                    hashes.sort();
                    (0, vitest_1.expect)(hashes).toStrictEqual(['0x02751cec', '0x054d50d4', '0x18cbafe5', '0x1f00ca74', '0x2195995c', '0x38ed1739', '0x4a25d94a', '0x5b0d5984', '0x5c11d795', '0x791ac947', '0x7ff36ab5', '0x85f8c259', '0x8803dbee', '0xad5c4648', '0xad615dec', '0xaf2979eb', '0xb6f9de95', '0xbaa2abde', '0xc45a0155', '0xd06ca61f', '0xded9382a', '0xe8e33700', '0xf305d719', '0xfb3bdb41']);
                    (0, vitest_1.expect)(selectors["0x7ff36ab5"]).toStrictEqual("swapExactETHForTokens(uint256,address[],address,uint256)");
                    return [2 /*return*/];
            }
        });
    }); });
    (0, env_1.online_test)('defaultSignatureLookup', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sig, selector, selectors, r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sig = "swapExactETHForTokens(uint256,address[],address,uint256)";
                    selector = "0x7ff36ab5";
                    selectors = (0, index_1.selectorsFromABI)([sig]);
                    (0, vitest_1.expect)(Object.keys(selectors)).toContain(selector);
                    return [4 /*yield*/, loaders_1.defaultSignatureLookup.loadFunctions(selector)];
                case 1:
                    r = _a.sent();
                    (0, vitest_1.expect)(r).toContain(sig);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, env_1.online_test)('SourcifyABILoader', function () { return __awaiter(void 0, void 0, void 0, function () {
        var loader, abi, selectors, sig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loader = new loaders_1.SourcifyABILoader();
                    return [4 /*yield*/, loader.loadABI("0x7a250d5630b4cf539739df2c5dacb4c659f2488d")];
                case 1:
                    abi = _a.sent();
                    selectors = Object.values((0, index_1.selectorsFromABI)(abi));
                    sig = "swapExactETHForTokens(uint256,address[],address,uint256)";
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, env_1.online_test)('EtherscanABILoader', function () { return __awaiter(void 0, void 0, void 0, function () {
        var loader, abi, selectors, sig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loader = new loaders_1.EtherscanABILoader({ apiKey: process.env["ETHERSCAN_API_KEY"] });
                    return [4 /*yield*/, loader.loadABI("0x7a250d5630b4cf539739df2c5dacb4c659f2488d")];
                case 1:
                    abi = _a.sent();
                    selectors = Object.values((0, index_1.selectorsFromABI)(abi));
                    sig = "swapExactETHForTokens(uint256,address[],address,uint256)";
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    return [2 /*return*/];
            }
        });
    }); }, SLOW_ETHERSCAN_TIMEOUT);
    (0, env_1.online_test)('MultiABILoader', function () { return __awaiter(void 0, void 0, void 0, function () {
        var address, loader, abi, sig, selectors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    address = "0xa9a57f7d2A54C1E172a7dC546fEE6e03afdD28E2";
                    loader = new loaders_1.MultiABILoader([
                        new loaders_1.SourcifyABILoader(),
                        new loaders_1.EtherscanABILoader({ apiKey: process.env["ETHERSCAN_API_KEY"] }),
                    ]);
                    return [4 /*yield*/, loader.loadABI(address)];
                case 1:
                    abi = _a.sent();
                    sig = "getMagistrate()";
                    selectors = Object.values((0, index_1.selectorsFromABI)(abi));
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    return [2 /*return*/];
            }
        });
    }); }, SLOW_ETHERSCAN_TIMEOUT);
    (0, env_1.online_test)('SourcifyABILoader_getContract', function () { return __awaiter(void 0, void 0, void 0, function () {
        var loader, _a, abi, name, selectors, sig;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    loader = new loaders_1.SourcifyABILoader();
                    return [4 /*yield*/, loader.getContract("0x7a250d5630b4cf539739df2c5dacb4c659f2488d")];
                case 1:
                    _a = _b.sent(), abi = _a.abi, name = _a.name;
                    selectors = Object.values((0, index_1.selectorsFromABI)(abi));
                    sig = "swapExactETHForTokens(uint256,address[],address,uint256)";
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    (0, vitest_1.expect)(name).toBeFalsy();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, env_1.online_test)('SourcifyABILoader_getContract_UniswapV3Factory', function () { return __awaiter(void 0, void 0, void 0, function () {
        var loader, _a, abi, name, selectors, sig;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    loader = new loaders_1.SourcifyABILoader();
                    return [4 /*yield*/, loader.getContract("0x1F98431c8aD98523631AE4a59f267346ea31F984")];
                case 1:
                    _a = _b.sent(), abi = _a.abi, name = _a.name;
                    selectors = Object.values((0, index_1.selectorsFromABI)(abi));
                    sig = "owner()";
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    (0, vitest_1.expect)(name).toEqual("Canonical Uniswap V3 factory");
                    return [2 /*return*/];
            }
        });
    }); });
    (0, env_1.online_test)('EtherscanABILoader_getContract', function () { return __awaiter(void 0, void 0, void 0, function () {
        var loader, abi, selectors, sig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loader = new loaders_1.EtherscanABILoader({ apiKey: process.env["ETHERSCAN_API_KEY"] });
                    return [4 /*yield*/, loader.getContract("0x7a250d5630b4cf539739df2c5dacb4c659f2488d")];
                case 1:
                    abi = (_a.sent()).abi;
                    selectors = Object.values((0, index_1.selectorsFromABI)(abi));
                    sig = "swapExactETHForTokens(uint256,address[],address,uint256)";
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    return [2 /*return*/];
            }
        });
    }); }, SLOW_ETHERSCAN_TIMEOUT);
    (0, env_1.online_test)('EtherscanABILoader_getContract_UniswapV3Factory', function () { return __awaiter(void 0, void 0, void 0, function () {
        var loader, _a, abi, name, selectors, sig;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    loader = new loaders_1.EtherscanABILoader({ apiKey: process.env["ETHERSCAN_API_KEY"] });
                    return [4 /*yield*/, loader.getContract("0x1F98431c8aD98523631AE4a59f267346ea31F984")];
                case 1:
                    _a = _b.sent(), abi = _a.abi, name = _a.name;
                    selectors = Object.values((0, index_1.selectorsFromABI)(abi));
                    sig = "owner()";
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    (0, vitest_1.expect)(name).toEqual("UniswapV3Factory");
                    return [2 /*return*/];
            }
        });
    }); }, SLOW_ETHERSCAN_TIMEOUT);
    (0, env_1.online_test)('MultiABILoader_getContract', function () { return __awaiter(void 0, void 0, void 0, function () {
        var address, loader, _a, abi, name, sig, selectors;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    address = "0xa9a57f7d2A54C1E172a7dC546fEE6e03afdD28E2";
                    loader = new loaders_1.MultiABILoader([
                        new loaders_1.SourcifyABILoader(),
                        new loaders_1.EtherscanABILoader({ apiKey: process.env["ETHERSCAN_API_KEY"] }),
                    ]);
                    return [4 /*yield*/, loader.getContract(address)];
                case 1:
                    _a = _b.sent(), abi = _a.abi, name = _a.name;
                    sig = "getMagistrate()";
                    selectors = Object.values((0, index_1.selectorsFromABI)(abi));
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    (0, vitest_1.expect)(name).toEqual("KetherSortition");
                    return [2 /*return*/];
            }
        });
    }); }, SLOW_ETHERSCAN_TIMEOUT);
    (0, env_1.online_test)('MultiABILoader_getContract_UniswapV3Factory', function () { return __awaiter(void 0, void 0, void 0, function () {
        var address, loader, _a, abi, name, sig, selectors;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    address = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
                    loader = new loaders_1.MultiABILoader([
                        new loaders_1.SourcifyABILoader(),
                        new loaders_1.EtherscanABILoader({ apiKey: process.env["ETHERSCAN_API_KEY"] }),
                    ]);
                    return [4 /*yield*/, loader.getContract(address)];
                case 1:
                    _a = _b.sent(), abi = _a.abi, name = _a.name;
                    sig = "owner()";
                    selectors = Object.values((0, index_1.selectorsFromABI)(abi));
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    (0, vitest_1.expect)(name).toEqual("Canonical Uniswap V3 factory");
                    return [2 /*return*/];
            }
        });
    }); }, SLOW_ETHERSCAN_TIMEOUT);
    (0, env_1.online_test)('MultiABILoader_SourcifyOnly_getContract_UniswapV3Factory', function () { return __awaiter(void 0, void 0, void 0, function () {
        var address, loader, _a, abi, name, sig, selectors;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    address = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
                    loader = new loaders_1.MultiABILoader([
                        new loaders_1.SourcifyABILoader(),
                    ]);
                    return [4 /*yield*/, loader.getContract(address)];
                case 1:
                    _a = _b.sent(), abi = _a.abi, name = _a.name;
                    sig = "owner()";
                    selectors = Object.values((0, index_1.selectorsFromABI)(abi));
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    (0, vitest_1.expect)(name).toEqual("Canonical Uniswap V3 factory");
                    return [2 /*return*/];
            }
        });
    }); }, SLOW_ETHERSCAN_TIMEOUT);
    (0, env_1.online_test)('MultiABILoader_EtherscanOnly_getContract_UniswapV3Factory', function () { return __awaiter(void 0, void 0, void 0, function () {
        var address, loader, _a, abi, name, sig, selectors;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    address = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
                    loader = new loaders_1.MultiABILoader([
                        new loaders_1.EtherscanABILoader({ apiKey: process.env["ETHERSCAN_API_KEY"] }),
                    ]);
                    return [4 /*yield*/, loader.getContract(address)];
                case 1:
                    _a = _b.sent(), abi = _a.abi, name = _a.name;
                    sig = "owner()";
                    selectors = Object.values((0, index_1.selectorsFromABI)(abi));
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    (0, vitest_1.expect)(name).toEqual("UniswapV3Factory");
                    return [2 /*return*/];
            }
        });
    }); }, SLOW_ETHERSCAN_TIMEOUT);
    (0, env_1.online_test)('SamczunSignatureLookup', function () { return __awaiter(void 0, void 0, void 0, function () {
        var lookup, selectors, sig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lookup = new loaders_1.SamczunSignatureLookup();
                    return [4 /*yield*/, lookup.loadFunctions("0x7ff36ab5")];
                case 1:
                    selectors = _a.sent();
                    sig = "swapExactETHForTokens(uint256,address[],address,uint256)";
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, env_1.online_test)('OpenChainSignatureLookup', function () { return __awaiter(void 0, void 0, void 0, function () {
        var lookup, selectors, sig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lookup = new loaders_1.OpenChainSignatureLookup();
                    return [4 /*yield*/, lookup.loadFunctions("0x7ff36ab5")];
                case 1:
                    selectors = _a.sent();
                    sig = "swapExactETHForTokens(uint256,address[],address,uint256)";
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, env_1.online_test)('FourByteSignatureLookup', function () { return __awaiter(void 0, void 0, void 0, function () {
        var lookup, selectors, sig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lookup = new loaders_1.FourByteSignatureLookup();
                    return [4 /*yield*/, lookup.loadFunctions("0x7ff36ab5")];
                case 1:
                    selectors = _a.sent();
                    sig = "swapExactETHForTokens(uint256,address[],address,uint256)";
                    (0, vitest_1.expect)(selectors).toContain(sig);
                    return [2 /*return*/];
            }
        });
    }); });
});
