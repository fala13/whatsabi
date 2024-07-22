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
var env_1 = require("./env");
var disasm_1 = require("../disasm");
var slots_js_1 = require("../slots.js");
var proxies = require("../proxies");
var proxies_1 = require("./__fixtures__/proxies");
// TODO: Test for proxy factories to not match
(0, vitest_1.describe)('proxy detection', function () {
    (0, vitest_1.test)('Minimal Proxy Pattern', function () { return __awaiter(void 0, void 0, void 0, function () {
        var bytecode, program, proxy;
        return __generator(this, function (_a) {
            bytecode = "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3";
            program = (0, disasm_1.disasm)(bytecode);
            (0, vitest_1.expect)(program.proxies[0]).toBeInstanceOf(proxies.FixedProxyResolver);
            proxy = program.proxies[0];
            (0, vitest_1.expect)(proxy.resolvedAddress).toBe("0xbebebebebebebebebebebebebebebebebebebebe");
            return [2 /*return*/];
        });
    }); });
    (0, vitest_1.test)('EIP-1167 Proxy: Uniswap v1', function () { return __awaiter(void 0, void 0, void 0, function () {
        var bytecode, want, program, proxy;
        return __generator(this, function (_a) {
            bytecode = "0x3660006000376110006000366000732157a7894439191e520825fe9399ab8655e0f7085af41558576110006000f3";
            want = "0x2157a7894439191e520825fe9399ab8655e0f708";
            program = (0, disasm_1.disasm)(bytecode);
            (0, vitest_1.expect)(program.proxies[0]).toBeInstanceOf(proxies.FixedProxyResolver);
            proxy = program.proxies[0];
            (0, vitest_1.expect)(proxy.resolvedAddress).toBe(want);
            return [2 /*return*/];
        });
    }); });
    (0, vitest_1.test)('Solady Minimal Proxy: CWIA', function () { return __awaiter(void 0, void 0, void 0, function () {
        var bytecode, program, proxy, want;
        return __generator(this, function (_a) {
            bytecode = "0x36602c57343d527f9e4ac34f21c619cefc926c8bd93b54bf5a39c7ab2127a895af1cc0691d7e3dff593da1005b363d3d373d3d3d3d610016806062363936013d73bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb5af43d3d93803e606057fd5bf3e127ce638293fa123be79c25782a5652581db2340016";
            program = (0, disasm_1.disasm)(bytecode);
            (0, vitest_1.expect)(program.proxies[0]).toBeInstanceOf(proxies.FixedProxyResolver);
            proxy = program.proxies[0];
            want = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
            (0, vitest_1.expect)(proxy.resolvedAddress).toBe(want);
            return [2 /*return*/];
        });
    }); });
    (0, vitest_1.test)('SequenceWallet Proxy', function () { return __awaiter(void 0, void 0, void 0, function () {
        var bytecode, program;
        return __generator(this, function (_a) {
            bytecode = "0x363d3d373d3d3d363d30545af43d82803e903d91601857fd5bf3";
            program = (0, disasm_1.disasm)(bytecode);
            (0, vitest_1.expect)(program.proxies[0]).toBeInstanceOf(proxies.SequenceWalletProxyResolver);
            return [2 /*return*/];
        });
    }); });
    (0, vitest_1.test)('Gnosis Safe Proxy Factory', function () { return __awaiter(void 0, void 0, void 0, function () {
        var bytecode, program;
        return __generator(this, function (_a) {
            bytecode = "0x608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea265627a7a72315820d8a00dc4fe6bf675a9d7416fc2d00bb3433362aa8186b750f76c4027269667ff64736f6c634300050e0032";
            program = (0, disasm_1.disasm)(bytecode);
            (0, vitest_1.expect)(program.proxies[0]).toBeInstanceOf(proxies.GnosisSafeProxyResolver);
            return [2 /*return*/];
        });
    }); });
    (0, vitest_1.test)('ZeppelinOS Proxy', function () { return __awaiter(void 0, void 0, void 0, function () {
        var bytecode, program;
        return __generator(this, function (_a) {
            bytecode = proxies_1.ZEPPELINOS_USDC;
            program = (0, disasm_1.disasm)(bytecode);
            (0, vitest_1.expect)(program.proxies[0]).toBeInstanceOf(proxies.ZeppelinOSProxyResolver);
            return [2 /*return*/];
        });
    }); });
    // TODO: Make this work
    vitest_1.test.skip('EIP-1967 Proxy: Wanderwing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var bytecode, program;
        return __generator(this, function (_a) {
            bytecode = proxies_1.WANDERWING;
            program = (0, disasm_1.disasm)(bytecode);
            (0, vitest_1.expect)(program.proxies[0]).toBeInstanceOf(proxies.EIP1967ProxyResolver);
            return [2 /*return*/];
        });
    }); });
});
(0, vitest_1.describe)('known proxy resolving', function () {
    (0, env_1.online_test)('Safe: Proxy Factory 1.1.1', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var address, resolver, got, want;
        var provider = _b.provider;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    address = "0x655a9e6b044d6b62f393f9990ec3ea877e966e18";
                    resolver = new proxies.GnosisSafeProxyResolver();
                    return [4 /*yield*/, resolver.resolve(provider, address)];
                case 1:
                    got = _c.sent();
                    want = "0x34cfac646f301356faa8b21e94227e3583fe3f5f";
                    (0, vitest_1.expect)(got).toEqual(want);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, env_1.online_test)('EIP-1967 Proxy: Aztec TransparentUpgradeableProxy', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var address, resolver, got, wantImplementation;
        var provider = _b.provider;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    address = "0xff1f2b4adb9df6fc8eafecdcbf96a2b351680455";
                    resolver = new proxies.EIP1967ProxyResolver();
                    return [4 /*yield*/, resolver.resolve(provider, address)];
                case 1:
                    got = _c.sent();
                    wantImplementation = "0x7d657ddcf7e2a5fd118dc8a6ddc3dc308adc2728";
                    (0, vitest_1.expect)(got).toEqual(wantImplementation);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, env_1.online_test)('EIP-1967 Proxy: NFTX', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var address, resolver, got, wantImplementation;
        var provider = _b.provider;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    address = "0x3E135c3E981fAe3383A5aE0d323860a34CfAB893";
                    resolver = new proxies.EIP1967ProxyResolver();
                    return [4 /*yield*/, resolver.resolve(provider, address)];
                case 1:
                    got = _c.sent();
                    wantImplementation = "0xccb1cfc9caa2b73a82ad23a9b3219da900485880";
                    (0, vitest_1.expect)(got).toEqual(wantImplementation);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, env_1.online_test)('EIP-2535 Diamond Proxy: ZkSync Era', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var address, resolver, selector, got;
        var provider = _b.provider;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    address = "0x32400084C286CF3E17e7B677ea9583e60a000324";
                    resolver = new proxies.DiamondProxyResolver();
                    selector = "0x6e9960c3";
                    return [4 /*yield*/, resolver.resolve(provider, address, selector)];
                case 1:
                    got = _c.sent();
                    // ZkSync updates their proxies so it's annoying to maintain the desired mapping
                    (0, vitest_1.expect)(got).not.toEqual("0x0000000000000000000000000000000000000000");
                    return [2 /*return*/];
            }
        });
    }); });
    (0, env_1.online_test)('EIP-2535 Diamond Proxy: Read facets from internal storage', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var address, resolver, got;
        var provider = _b.provider;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    address = "0x32400084C286CF3E17e7B677ea9583e60a000324";
                    resolver = new proxies.DiamondProxyResolver();
                    return [4 /*yield*/, resolver.selectors(provider, address)];
                case 1:
                    got = _c.sent();
                    (0, vitest_1.expect)(got).to.not.equal([]);
                    return [2 /*return*/];
            }
        });
    }); });
    // FIXME: Is there one on mainnet? Seems they're all on polygon
    //online_test('SequenceWallet Proxy', async() => {
    //});
});
(0, vitest_1.describe)('contract proxy resolving', function () {
    (0, env_1.cached_test)('Create2Beacon Proxy', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var address, code, program, resolver, got, wantImplementation;
        var provider = _b.provider, withCache = _b.withCache;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    address = "0x581acd618ba7ef6d3585242423867adc09e8ed60";
                    return [4 /*yield*/, withCache("".concat(address, "_code"), function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, provider.getCode(address)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })];
                case 1:
                    code = _c.sent();
                    program = (0, disasm_1.disasm)(code);
                    (0, vitest_1.expect)(program.proxies.length).toEqual(1);
                    resolver = program.proxies[0];
                    return [4 /*yield*/, resolver.resolve(provider, address)];
                case 2:
                    got = _c.sent();
                    wantImplementation = "0xaddc3e67a500f7037cd622b11df291a6351bfb64";
                    (0, vitest_1.expect)(got).toEqual(wantImplementation);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, env_1.cached_test)('Vyper Minimal Proxy', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var address, code, program, resolver, got, wantImplementation;
        var provider = _b.provider, withCache = _b.withCache;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    address = "0x2d5d4869381c4fce34789bc1d38acce747e295ae";
                    return [4 /*yield*/, withCache("".concat(address, "_code"), function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, provider.getCode(address)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })];
                case 1:
                    code = _c.sent();
                    program = (0, disasm_1.disasm)(code);
                    (0, vitest_1.expect)(program.proxies.length).toEqual(1);
                    resolver = program.proxies[0];
                    return [4 /*yield*/, resolver.resolve(provider, address)];
                case 2:
                    got = _c.sent();
                    wantImplementation = "0x9c13e225ae007731caa49fd17a41379ab1a489f4";
                    (0, vitest_1.expect)(got).toEqual(wantImplementation);
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('proxy internal slot reading', function () {
    (0, vitest_1.test)('addSlotOffset', function () { return __awaiter(void 0, void 0, void 0, function () {
        var slot, got;
        return __generator(this, function (_a) {
            slot = "0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131b";
            got = (0, slots_js_1.addSlotOffset)(slot, 2);
            (0, vitest_1.expect)(got).to.equal("0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131d");
            return [2 /*return*/];
        });
    }); });
    (0, vitest_1.test)('joinSlot', function () { return __awaiter(void 0, void 0, void 0, function () {
        var got, want;
        return __generator(this, function (_a) {
            got = (0, slots_js_1.joinSlot)(["0xf3acf6a03ea4a914b78ec788624b25cec37c14a4", "0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c"]);
            want = "0x42983d3cf213719a972df53d14775d9ca74cc01b862f850a60cf959f26ffe0a2";
            (0, vitest_1.expect)(got).toEqual(want);
            return [2 /*return*/];
        });
    }); });
    (0, env_1.online_test)('ReadArray: Addresses and Selectors', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var address, facetsOffset, addressWidth, facets, storageStart, facetAddress, facetToSelectorSlot, selectorWidth, got;
        var provider = _b.provider;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    address = "0x32400084C286CF3E17e7B677ea9583e60a000324";
                    facetsOffset = (0, slots_js_1.addSlotOffset)(proxies.slots.DIAMOND_STORAGE, 2);
                    addressWidth = 20;
                    return [4 /*yield*/, (0, slots_js_1.readArray)(provider, address, facetsOffset, addressWidth)];
                case 1:
                    facets = _c.sent();
                    (0, vitest_1.expect)(facets.length).to.not.equal(0);
                    storageStart = (0, slots_js_1.addSlotOffset)(proxies.slots.DIAMOND_STORAGE, 1);
                    facetAddress = "0x" + facets[0];
                    facetToSelectorSlot = (0, slots_js_1.joinSlot)([facetAddress, storageStart]);
                    selectorWidth = 4;
                    return [4 /*yield*/, (0, slots_js_1.readArray)(provider, address, facetToSelectorSlot, selectorWidth)];
                case 2:
                    got = _c.sent();
                    (0, vitest_1.expect)(got.length).to.not.equal(0);
                    return [2 /*return*/];
            }
        });
    }); });
});
