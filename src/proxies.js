"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotResolvers = exports.slots = exports.FixedProxyResolver = exports.SequenceWalletProxyResolver = exports.PROXIABLEProxyResolver = exports.ZeppelinOSProxyResolver = exports.DiamondProxyResolver = exports.EIP1967ProxyResolver = exports.LegacyUpgradeableProxyResolver = exports.GnosisSafeProxyResolver = exports.BaseProxyResolver = void 0;
var slots_js_1 = require("./slots.js");
var utils_js_1 = require("./utils.js");
// Some helpers:
var _zeroAddress = "0x0000000000000000000000000000000000000000";
// Convert 32 byte hex to a 20 byte hex address
function addressFromPadded(data) {
    return "0x" + data.slice(data.length - 40);
}
// Resolvers:
var BaseProxyResolver = /** @class */ (function () {
    function BaseProxyResolver(name) {
        this.name = name || this.constructor.name;
    }
    BaseProxyResolver.prototype.toString = function () {
        return this.name;
    };
    return BaseProxyResolver;
}());
exports.BaseProxyResolver = BaseProxyResolver;
var GnosisSafeProxyResolver = /** @class */ (function (_super) {
    __extends(GnosisSafeProxyResolver, _super);
    function GnosisSafeProxyResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GnosisSafeProxyResolver.prototype.resolve = function (provider, address) {
        return __awaiter(this, void 0, void 0, function () {
            var slotPosition, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        slotPosition = 0;
                        _a = addressFromPadded;
                        return [4 /*yield*/, provider.getStorageAt(address, slotPosition)];
                    case 1: // masterCopy() is always first slot
                    return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    return GnosisSafeProxyResolver;
}(BaseProxyResolver));
exports.GnosisSafeProxyResolver = GnosisSafeProxyResolver;
// 2016-era upgradeable proxy by Nick Johnson
// https://gist.github.com/Arachnid/4ca9da48d51e23e5cfe0f0e14dd6318f
var LegacyUpgradeableProxyResolver = /** @class */ (function (_super) {
    __extends(LegacyUpgradeableProxyResolver, _super);
    function LegacyUpgradeableProxyResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LegacyUpgradeableProxyResolver.prototype.resolve = function (provider, address) {
        return __awaiter(this, void 0, void 0, function () {
            var slotPosition, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        slotPosition = 1;
                        _a = addressFromPadded;
                        return [4 /*yield*/, provider.getStorageAt(address, slotPosition)];
                    case 1: // // _dist is in the second slot
                    return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    return LegacyUpgradeableProxyResolver;
}(BaseProxyResolver));
exports.LegacyUpgradeableProxyResolver = LegacyUpgradeableProxyResolver;
var EIP1967FallbackSelectors = [
    "0x5c60da1b", // implementation()
    "0xda525716", // childImplementation()
    "0xa619486e", // masterCopy()
    "0xbb82aa5e", // comptrollerImplementation()
];
var EIP1967ProxyResolver = /** @class */ (function (_super) {
    __extends(EIP1967ProxyResolver, _super);
    function EIP1967ProxyResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EIP1967ProxyResolver.prototype.resolve = function (provider, address) {
        return __awaiter(this, void 0, void 0, function () {
            var implAddr, _a, fallbackAddr, _b, _i, EIP1967FallbackSelectors_1, selector, addr, _c, e_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = addressFromPadded;
                        return [4 /*yield*/, provider.getStorageAt(address, exports.slots.EIP1967_IMPL)];
                    case 1:
                        implAddr = _a.apply(void 0, [_d.sent()]);
                        if (implAddr !== _zeroAddress) {
                            return [2 /*return*/, implAddr];
                        }
                        _b = addressFromPadded;
                        return [4 /*yield*/, provider.getStorageAt(address, exports.slots.EIP1967_BEACON)];
                    case 2:
                        fallbackAddr = _b.apply(void 0, [_d.sent()]);
                        if (fallbackAddr === _zeroAddress) {
                            return [2 /*return*/, _zeroAddress];
                        }
                        _i = 0, EIP1967FallbackSelectors_1 = EIP1967FallbackSelectors;
                        _d.label = 3;
                    case 3:
                        if (!(_i < EIP1967FallbackSelectors_1.length)) return [3 /*break*/, 8];
                        selector = EIP1967FallbackSelectors_1[_i];
                        _d.label = 4;
                    case 4:
                        _d.trys.push([4, 6, , 7]);
                        _c = addressFromPadded;
                        return [4 /*yield*/, provider.call({
                                to: fallbackAddr,
                                data: selector,
                            })];
                    case 5:
                        addr = _c.apply(void 0, [_d.sent()]);
                        if (addr !== _zeroAddress)
                            return [2 /*return*/, addr];
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _d.sent();
                        if (e_1.toString().includes("revert"))
                            return [3 /*break*/, 7];
                        throw e_1;
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8: return [2 /*return*/, _zeroAddress];
                }
            });
        });
    };
    return EIP1967ProxyResolver;
}(BaseProxyResolver));
exports.EIP1967ProxyResolver = EIP1967ProxyResolver;
var diamondSelectors = [
    "0xcdffacc6", // Diamond Loupe uses selector "0xcdffacc6": facetAddress(bytes4 _functionSelector)
    "0x0d741577", // Some implementations (OpenZeppelin) use selector "0x0d741577": implementation(bytes4 func)
];
// ERC2535 - Diamond/Facet Proxy
var DiamondProxyResolver = /** @class */ (function (_super) {
    __extends(DiamondProxyResolver, _super);
    function DiamondProxyResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DiamondProxyResolver.prototype.resolve = function (provider, address, selector) {
        return __awaiter(this, void 0, void 0, function () {
            var facetMappingSlot, facet, storageAddr, _i, diamondSelectors_1, facetSelector, addr, _a, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!selector) {
                            throw "DiamondProxy requires a selector to resolve to a specific facet";
                        }
                        else if (selector.startsWith("0x")) {
                            selector = selector.slice(2);
                        }
                        facetMappingSlot = (0, slots_js_1.joinSlot)([selector.padEnd(64, "0"), exports.slots.DIAMOND_STORAGE]);
                        return [4 /*yield*/, provider.getStorageAt(address, facetMappingSlot)];
                    case 1:
                        facet = _b.sent();
                        storageAddr = "0x" + facet.slice(facet.length - 40);
                        if (storageAddr !== _zeroAddress) {
                            return [2 /*return*/, storageAddr];
                        }
                        _i = 0, diamondSelectors_1 = diamondSelectors;
                        _b.label = 2;
                    case 2:
                        if (!(_i < diamondSelectors_1.length)) return [3 /*break*/, 7];
                        facetSelector = diamondSelectors_1[_i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        _a = addressFromPadded;
                        return [4 /*yield*/, provider.call({
                                to: address,
                                data: facetSelector + selector,
                            })];
                    case 4:
                        addr = _a.apply(void 0, [_b.sent()]);
                        if (addr !== _zeroAddress)
                            return [2 /*return*/, addr];
                        return [3 /*break*/, 6];
                    case 5:
                        e_2 = _b.sent();
                        if (e_2.toString().includes("revert"))
                            return [3 /*break*/, 6];
                        throw e_2;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, _zeroAddress];
                }
            });
        });
    };
    // Return the facet-to-selectors mapping
    // Note that this does not respect frozen facet state.
    DiamondProxyResolver.prototype.facets = function (provider, address) {
        return __awaiter(this, void 0, void 0, function () {
            var storageStart, facetsOffset, addressWidth, facets, selectorWidth, facetSelectors, slot, _i, facets_1, f, facet, facetSelectorsSlot, selectors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        storageStart = exports.slots.DIAMOND_STORAGE;
                        facetsOffset = (0, slots_js_1.addSlotOffset)(storageStart, 2);
                        addressWidth = 20;
                        return [4 /*yield*/, (0, slots_js_1.readArray)(provider, address, facetsOffset, addressWidth)];
                    case 1:
                        facets = _a.sent();
                        selectorWidth = 4;
                        facetSelectors = {};
                        slot = (0, slots_js_1.addSlotOffset)(storageStart, 1);
                        _i = 0, facets_1 = facets;
                        _a.label = 2;
                    case 2:
                        if (!(_i < facets_1.length)) return [3 /*break*/, 5];
                        f = facets_1[_i];
                        facet = addressFromPadded(f);
                        facetSelectorsSlot = (0, slots_js_1.joinSlot)([facet, slot]);
                        return [4 /*yield*/, (0, slots_js_1.readArray)(provider, address, facetSelectorsSlot, selectorWidth)];
                    case 3:
                        selectors = _a.sent();
                        facetSelectors[(0, utils_js_1.addressWithChecksum)(facet)] = selectors.map(function (s) { return "0x" + s; });
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, facetSelectors];
                }
            });
        });
    };
    // Return all of the valid selectors that work on this DiamondProxy.
    // Note that this does not respect frozen facet state.
    DiamondProxyResolver.prototype.selectors = function (provider, address) {
        return __awaiter(this, void 0, void 0, function () {
            var f;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.facets(provider, address)];
                    case 1:
                        f = _a.sent();
                        return [2 /*return*/, Object.values(f).flat()];
                }
            });
        });
    };
    return DiamondProxyResolver;
}(BaseProxyResolver));
exports.DiamondProxyResolver = DiamondProxyResolver;
var ZeppelinOSProxyResolver = /** @class */ (function (_super) {
    __extends(ZeppelinOSProxyResolver, _super);
    function ZeppelinOSProxyResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZeppelinOSProxyResolver.prototype.resolve = function (provider, address) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = addressFromPadded;
                        return [4 /*yield*/, provider.getStorageAt(address, exports.slots.ZEPPELINOS_IMPL)];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    return ZeppelinOSProxyResolver;
}(BaseProxyResolver));
exports.ZeppelinOSProxyResolver = ZeppelinOSProxyResolver;
var PROXIABLEProxyResolver = /** @class */ (function (_super) {
    __extends(PROXIABLEProxyResolver, _super);
    function PROXIABLEProxyResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PROXIABLEProxyResolver.prototype.resolve = function (provider, address) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = addressFromPadded;
                        return [4 /*yield*/, provider.getStorageAt(address, exports.slots.PROXIABLE)];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    return PROXIABLEProxyResolver;
}(BaseProxyResolver));
exports.PROXIABLEProxyResolver = PROXIABLEProxyResolver;
// https://github.com/0xsequence/wallet-contracts/blob/master/contracts/Wallet.sol
// Implementation pointer is stored in slot keyed on the deployed address.
var SequenceWalletProxyResolver = /** @class */ (function (_super) {
    __extends(SequenceWalletProxyResolver, _super);
    function SequenceWalletProxyResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SequenceWalletProxyResolver.prototype.resolve = function (provider, address) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = addressFromPadded;
                        return [4 /*yield*/, provider.getStorageAt(address, address.toLowerCase().slice(2))];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    SequenceWalletProxyResolver.prototype.toString = function () {
        return "SequenceWalletProxy";
    };
    return SequenceWalletProxyResolver;
}(BaseProxyResolver));
exports.SequenceWalletProxyResolver = SequenceWalletProxyResolver;
// FixedProxyResolver is used when we already know the resolved address
// No additional resolving required
// Example: EIP-1167
var FixedProxyResolver = /** @class */ (function (_super) {
    __extends(FixedProxyResolver, _super);
    function FixedProxyResolver(name, resolvedAddress) {
        var _this = _super.call(this, name) || this;
        _this.resolvedAddress = resolvedAddress;
        return _this;
    }
    FixedProxyResolver.prototype.resolve = function (provider, address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resolvedAddress];
            });
        });
    };
    return FixedProxyResolver;
}(BaseProxyResolver));
exports.FixedProxyResolver = FixedProxyResolver;
;
// Lookups:
// BYTE32's representing references to known proxy storage slots.
exports.slots = {
    // EIP-1967: Proxy Storage Slots
    // bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
    EIP1967_IMPL: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    // EIP-1967
    // Beacon slot is a fallback if implementation is not set.
    // bytes32(uint256(keccak256('eip1967.proxy.beacon')) - 1)).
    // Beacon fallback has selectors:
    // - implementation()
    // - childImplementation()
    // - masterCopy() in Gnosis Safe
    // - comptrollerImplementation() in Compound
    EIP1967_BEACON: "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50",
    // https://github.com/OpenZeppelin/openzeppelin-labs/blob/54ad91472fdd0ac4c34aa97d3a3da45c28245510/initializer_with_sol_editing/contracts/UpgradeabilityProxy.sol
    // bytes32(uint256(keccak256("org.zeppelinos.proxy.implementation")))
    ZEPPELINOS_IMPL: "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3",
    // ERC-1822: Universal Upgradeable Proxy Standard (UUPS)
    // bytes32(uint256(keccak256("PROXIABLE")))
    PROXIABLE: "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7",
    // Gnosis Safe Proxy Factor 1.1.1
    // Not actually a slot, but there's a PUSH32 to the masterCopy() selector
    // masterCopy value lives in the 0th slot on the contract
    GNOSIS_SAFE_SELECTOR: "0xa619486e00000000000000000000000000000000000000000000000000000000",
    // Diamond Proxy, as used by ZkSync Era contract
    // https://etherscan.io/address/0x32400084c286cf3e17e7b677ea9583e60a000324#code
    // keccak256("diamond.standard.diamond.storage") - 1;
    DIAMOND_STORAGE: "0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131b",
    // EIP-1167 minimal proxy standard
    // Parsed in disasm
};
exports.slotResolvers = (_a = {},
    _a[exports.slots.EIP1967_IMPL] = new EIP1967ProxyResolver("EIP1967Proxy"),
    _a[exports.slots.EIP1967_BEACON] = new EIP1967ProxyResolver("EIP1967Proxy"),
    _a[exports.slots.ZEPPELINOS_IMPL] = new ZeppelinOSProxyResolver("ZeppelinOSProxy"),
    _a[exports.slots.PROXIABLE] = new PROXIABLEProxyResolver("PROXIABLE"),
    _a[exports.slots.GNOSIS_SAFE_SELECTOR] = new GnosisSafeProxyResolver("GnosisSafeProxy"),
    _a[exports.slots.DIAMOND_STORAGE] = new DiamondProxyResolver("DiamondProxy"),
    // Not sure why, there's a compiler optimization that adds 2 to the normal slot?
    // Would love to understand this, if people have ideas
    _a["0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131d"] = new DiamondProxyResolver("DiamondProxy"),
    _a);
