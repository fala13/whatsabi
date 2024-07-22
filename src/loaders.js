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
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSignatureLookup = exports.defaultABILoader = exports.SamczunSignatureLookup = exports.OpenChainSignatureLookup = exports.FourByteSignatureLookup = exports.MultiSignatureLookup = exports.SourcifyABILoader = exports.EtherscanABILoader = exports.MultiABILoader = void 0;
exports.defaultsWithAPIKeys = defaultsWithAPIKeys;
exports.defaultsWithEnv = defaultsWithEnv;
var utils_js_1 = require("./utils.js");
var emptyContractResult = {
    ok: false,
    abi: [],
    name: null,
    evmVersion: "",
    compilerVersion: "",
    runs: 0,
};
// Load ABIs from multiple providers until a result is found.
var MultiABILoader = /** @class */ (function () {
    function MultiABILoader(loaders) {
        this.loaders = loaders;
    }
    MultiABILoader.prototype.getContract = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, loader, r, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.loaders;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        loader = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, loader.getContract(address)];
                    case 3:
                        r = _b.sent();
                        if (r && r.abi.length > 0)
                            return [2 /*return*/, Promise.resolve(r)];
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        if (error_1.status === 404)
                            return [3 /*break*/, 5];
                        throw error_1;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, emptyContractResult];
                }
            });
        });
    };
    MultiABILoader.prototype.loadABI = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, loader, r;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.loaders;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        loader = _a[_i];
                        return [4 /*yield*/, loader.loadABI(address)];
                    case 2:
                        r = _b.sent();
                        // Return the first non-empty result
                        if (r.length > 0)
                            return [2 /*return*/, Promise.resolve(r)];
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, Promise.resolve([])];
                }
            });
        });
    };
    return MultiABILoader;
}());
exports.MultiABILoader = MultiABILoader;
var EtherscanABILoader = /** @class */ (function () {
    function EtherscanABILoader(config) {
        if (config === undefined)
            config = {};
        this.apiKey = config.apiKey;
        this.baseURL = config.baseURL || "https://api.etherscan.io/api";
    }
    EtherscanABILoader.prototype.getContract = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var url, r, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.baseURL + '?module=contract&action=getsourcecode&address=' + address;
                        if (this.apiKey)
                            url += "&apikey=" + this.apiKey;
                        return [4 /*yield*/, (0, utils_js_1.fetchJSON)(url)];
                    case 1:
                        r = _a.sent();
                        if (r.status === "0") {
                            if (r.result === "Contract source code not verified")
                                return [2 /*return*/, emptyContractResult];
                            throw new Error("Etherscan error: " + r.result);
                        }
                        result = r.result[0];
                        return [2 /*return*/, {
                                abi: JSON.parse(result.ABI),
                                name: result.ContractName,
                                evmVersion: result.EVMVersion,
                                compilerVersion: result.CompilerVersion,
                                runs: result.Runs,
                                ok: true,
                            }];
                }
            });
        });
    };
    EtherscanABILoader.prototype.loadABI = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var url, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.baseURL + '?module=contract&action=getabi&address=' + address;
                        if (this.apiKey)
                            url += "&apikey=" + this.apiKey;
                        return [4 /*yield*/, (0, utils_js_1.fetchJSON)(url)];
                    case 1:
                        r = _a.sent();
                        if (r.status === "0") {
                            if (r.result === "Contract source code not verified")
                                return [2 /*return*/, []];
                            throw new Error("Etherscan error: " + r.result);
                        }
                        return [2 /*return*/, JSON.parse(r.result)];
                }
            });
        });
    };
    return EtherscanABILoader;
}());
exports.EtherscanABILoader = EtherscanABILoader;
function isSourcifyNotFound(error) {
    return (
    // Sourcify returns strict CORS only if there is no result -_-
    error.message === "Failed to fetch" ||
        error.status === 404);
}
// https://sourcify.dev/
var SourcifyABILoader = /** @class */ (function () {
    function SourcifyABILoader(config) {
        var _a;
        this.chainId = (_a = config === null || config === void 0 ? void 0 : config.chainId) !== null && _a !== void 0 ? _a : 1;
    }
    SourcifyABILoader.prototype.getContract = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var r, error_2, r, error_3;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        // Sourcify doesn't like it when the address is not checksummed
                        address = (0, utils_js_1.addressWithChecksum)(address);
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, utils_js_1.fetchJSON)("https://repo.sourcify.dev/contracts/full_match/" + this.chainId + "/" + address + "/metadata.json")];
                    case 2:
                        r = _e.sent();
                        return [2 /*return*/, {
                                abi: r.output.abi,
                                name: (_b = (_a = r.output.devdoc) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : null, // Sourcify includes a title from the Natspec comments
                                evmVersion: r.settings.evmVersion,
                                compilerVersion: r.compiler.version,
                                runs: r.settings.optimizer.runs,
                                ok: true,
                            }];
                    case 3:
                        error_2 = _e.sent();
                        if (!isSourcifyNotFound(error_2))
                            throw error_2;
                        return [3 /*break*/, 4];
                    case 4:
                        _e.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, (0, utils_js_1.fetchJSON)("https://repo.sourcify.dev/contracts/partial_match/" + this.chainId + "/" + address + "/metadata.json")];
                    case 5:
                        r = _e.sent();
                        return [2 /*return*/, {
                                abi: r.output.abi,
                                name: (_d = (_c = r.output.devdoc) === null || _c === void 0 ? void 0 : _c.title) !== null && _d !== void 0 ? _d : null, // Sourcify includes a title from the Natspec comments
                                evmVersion: r.settings.evmVersion,
                                compilerVersion: r.compiler.version,
                                runs: r.settings.optimizer.runs,
                                ok: true,
                            }];
                    case 6:
                        error_3 = _e.sent();
                        if (!isSourcifyNotFound(error_3))
                            throw error_3;
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, emptyContractResult];
                }
            });
        });
    };
    SourcifyABILoader.prototype.loadABI = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Sourcify doesn't like it when the address is not checksummed
                        address = (0, utils_js_1.addressWithChecksum)(address);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, utils_js_1.fetchJSON)("https://repo.sourcify.dev/contracts/full_match/" + this.chainId + "/" + address + "/metadata.json")];
                    case 2: 
                    // Full match index includes verification settings that matches exactly
                    return [2 /*return*/, (_a.sent()).output.abi];
                    case 3:
                        error_4 = _a.sent();
                        if (!isSourcifyNotFound(error_4))
                            throw error_4;
                        return [3 /*break*/, 4];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, (0, utils_js_1.fetchJSON)("https://repo.sourcify.dev/contracts/partial_match/" + this.chainId + "/" + address + "/metadata.json")];
                    case 5: 
                    // Partial match index is for verified contracts whose settings didn't match exactly
                    return [2 /*return*/, (_a.sent()).output.abi];
                    case 6:
                        error_5 = _a.sent();
                        if (!isSourcifyNotFound(error_5))
                            throw error_5;
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, []];
                }
            });
        });
    };
    return SourcifyABILoader;
}());
exports.SourcifyABILoader = SourcifyABILoader;
// Load signatures from multiple providers until a result is found.
var MultiSignatureLookup = /** @class */ (function () {
    function MultiSignatureLookup(lookups) {
        this.lookups = lookups;
    }
    MultiSignatureLookup.prototype.loadFunctions = function (selector) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, lookup, r;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.lookups;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        lookup = _a[_i];
                        return [4 /*yield*/, lookup.loadFunctions(selector)];
                    case 2:
                        r = _b.sent();
                        // Return the first non-empty result
                        if (r.length > 0)
                            return [2 /*return*/, Promise.resolve(r)];
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, Promise.resolve([])];
                }
            });
        });
    };
    MultiSignatureLookup.prototype.loadEvents = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, lookup, r;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.lookups;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        lookup = _a[_i];
                        return [4 /*yield*/, lookup.loadEvents(hash)];
                    case 2:
                        r = _b.sent();
                        // Return the first non-empty result
                        if (r.length > 0)
                            return [2 /*return*/, Promise.resolve(r)];
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, Promise.resolve([])];
                }
            });
        });
    };
    return MultiSignatureLookup;
}());
exports.MultiSignatureLookup = MultiSignatureLookup;
// https://www.4byte.directory/
var FourByteSignatureLookup = /** @class */ (function () {
    function FourByteSignatureLookup() {
    }
    FourByteSignatureLookup.prototype.load = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var r, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, utils_js_1.fetchJSON)(url)];
                    case 1:
                        r = _a.sent();
                        if (r.results === undefined)
                            return [2 /*return*/, []];
                        return [2 /*return*/, r.results.map(function (r) { return r.text_signature; })];
                    case 2:
                        error_6 = _a.sent();
                        if (error_6.status === 404)
                            return [2 /*return*/, []];
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FourByteSignatureLookup.prototype.loadFunctions = function (selector) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Use github lookup?
                return [2 /*return*/, this.load("https://www.4byte.directory/api/v1/signatures/?hex_signature=" + selector)];
            });
        });
    };
    FourByteSignatureLookup.prototype.loadEvents = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.load("https://www.4byte.directory/api/v1/event-signatures/?hex_signature=" + hash)];
            });
        });
    };
    return FourByteSignatureLookup;
}());
exports.FourByteSignatureLookup = FourByteSignatureLookup;
// openchain.xyz
// Formerly: https://sig.eth.samczsun.com/
var OpenChainSignatureLookup = /** @class */ (function () {
    function OpenChainSignatureLookup() {
    }
    OpenChainSignatureLookup.prototype.load = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var r, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, utils_js_1.fetchJSON)(url)];
                    case 1:
                        r = _a.sent();
                        if (!r.ok)
                            throw new Error("OpenChain API bad response: " + JSON.stringify(r));
                        return [2 /*return*/, r];
                    case 2:
                        error_7 = _a.sent();
                        if (error_7.status === 404)
                            return [2 /*return*/, []];
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OpenChainSignatureLookup.prototype.loadFunctions = function (selector) {
        return __awaiter(this, void 0, void 0, function () {
            var r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load("https://api.openchain.xyz/signature-database/v1/lookup?function=" + selector)];
                    case 1:
                        r = _a.sent();
                        return [2 /*return*/, (r.result.function[selector] || []).map(function (item) { return item.name; })];
                }
            });
        });
    };
    OpenChainSignatureLookup.prototype.loadEvents = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load("https://api.openchain.xyz/signature-database/v1/lookup?event=" + hash)];
                    case 1:
                        r = _a.sent();
                        return [2 /*return*/, (r.result.event[hash] || []).map(function (item) { return item.name; })];
                }
            });
        });
    };
    return OpenChainSignatureLookup;
}());
exports.OpenChainSignatureLookup = OpenChainSignatureLookup;
var SamczunSignatureLookup = /** @class */ (function (_super) {
    __extends(SamczunSignatureLookup, _super);
    function SamczunSignatureLookup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SamczunSignatureLookup;
}(OpenChainSignatureLookup));
exports.SamczunSignatureLookup = SamczunSignatureLookup;
exports.defaultABILoader = new MultiABILoader([new SourcifyABILoader(), new EtherscanABILoader()]);
exports.defaultSignatureLookup = new MultiSignatureLookup([new OpenChainSignatureLookup(), new FourByteSignatureLookup()]);
/** @deprecated Use defaultsWithEnv instead, this function is outdated and will be removed soon. */
function defaultsWithAPIKeys(apiKeys) {
    return defaultsWithEnv(apiKeys);
}
/**
 * Return params to use with whatsabi.autoload(...)
 *
 * @example
 * ```ts
 * whatsabi.autoload(address, {provider, ...defaultsWithEnv(process.env)})
 * ```
 *
 * @example
 * ```ts
 * whatsabi.autoload(address, {
 *   provider,
 *   ...defaultsWithEnv({
 *     SOURCIFY_CHAIN_ID: 42161,
 *     ETHERSCAN_BASE_URL: "https://api.arbiscan.io/api",
 *     ETHERSCAN_API_KEY: "MYSECRETAPIKEY",
 *   }),
 * })
 * ```
 */
function defaultsWithEnv(env) {
    return {
        abiLoader: new MultiABILoader([
            new SourcifyABILoader({ chainId: env.SOURCIFY_CHAIN_ID && Number(env.SOURCIFY_CHAIN_ID) || undefined }),
            new EtherscanABILoader({ apiKey: env.ETHERSCAN_API_KEY, baseURL: env.ETHERSCAN_BASE_URL }),
        ]),
        signatureLookup: new MultiSignatureLookup([
            new OpenChainSignatureLookup(),
            new FourByteSignatureLookup(),
        ]),
    };
}
