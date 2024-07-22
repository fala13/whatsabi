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
exports.defaultConfig = void 0;
exports.autoload = autoload;
var ethers_1 = require("ethers");
var proxies_js_1 = require("./proxies.js");
var types_js_1 = require("./types.js");
var loaders_js_1 = require("./loaders.js");
var disasm_js_1 = require("./disasm.js");
function isAddress(address) {
    return address.length === 42 && address.startsWith("0x") && Number(address) >= 0;
}
exports.defaultConfig = {
    onProgress: function (_) { },
    onError: function (phase, err) { console.error(phase + ":", err); return false; },
};
// auto is a convenience helper for doing All The Things to load an ABI of a contract.
function autoload(address, config) {
    return __awaiter(this, void 0, void 0, function () {
        var onProgress, onError, provider, result, abiLoader, bytecode, program, facets, diamondProxy, f, loader_1, addresses_1, promises_1, results, abis, error_1, signatureLookup, promises, _loop_1, _i, _a, a;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    onProgress = config.onProgress || exports.defaultConfig.onProgress;
                    onError = config.onError || exports.defaultConfig.onError;
                    provider = (0, types_js_1.CompatibleProvider)(config.provider);
                    result = {
                        address: address,
                        abi: [],
                        proxies: [],
                    };
                    if (config === undefined) {
                        throw new Error("autoload: config is undefined, must include 'provider'");
                    }
                    abiLoader = config.abiLoader;
                    if (abiLoader === undefined)
                        abiLoader = loaders_js_1.defaultABILoader;
                    if (!!isAddress(address)) return [3 /*break*/, 4];
                    onProgress("resolveName", { address: address });
                    if (!config.addressResolver) return [3 /*break*/, 2];
                    return [4 /*yield*/, config.addressResolver(address)];
                case 1:
                    address = _d.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, provider.getAddress(address)];
                case 3:
                    address = _d.sent();
                    _d.label = 4;
                case 4:
                    // Load code, we need to disasm to find proxies
                    onProgress("getCode", { address: address });
                    return [4 /*yield*/, provider.getCode(address)];
                case 5:
                    bytecode = _d.sent();
                    if (!bytecode)
                        return [2 /*return*/, result]; // Must be an EOA
                    program = (0, disasm_js_1.disasm)(bytecode);
                    // FIXME: Sort them in some reasonable way
                    result.proxies = program.proxies;
                    facets = (_b = {},
                        _b[address] = [],
                        _b);
                    if (!(result.proxies.length === 1 && result.proxies[0] instanceof proxies_js_1.DiamondProxyResolver)) return [3 /*break*/, 7];
                    onProgress("loadDiamondFacets", { address: address });
                    diamondProxy = result.proxies[0];
                    return [4 /*yield*/, diamondProxy.facets(provider, address)];
                case 6:
                    f = _d.sent();
                    Object.assign(facets, f);
                    return [3 /*break*/, 9];
                case 7:
                    if (!(result.proxies.length > 0)) return [3 /*break*/, 9];
                    result.followProxies = function (selector) {
                        return __awaiter(this, void 0, void 0, function () {
                            var _i, _a, resolver, resolved;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _i = 0, _a = result.proxies;
                                        _b.label = 1;
                                    case 1:
                                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                                        resolver = _a[_i];
                                        onProgress("followProxies", { resolver: resolver, address: address });
                                        return [4 /*yield*/, resolver.resolve(provider, address, selector)];
                                    case 2:
                                        resolved = _b.sent();
                                        if (!(resolved !== undefined)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, autoload(resolved, config)];
                                    case 3: return [2 /*return*/, _b.sent()];
                                    case 4:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 5:
                                        onError("followProxies", new Error("failed to resolve proxy"));
                                        return [2 /*return*/, result];
                                }
                            });
                        });
                    };
                    if (!config.followProxies) return [3 /*break*/, 9];
                    return [4 /*yield*/, result.followProxies()];
                case 8: return [2 /*return*/, _d.sent()];
                case 9:
                    if (!abiLoader) return [3 /*break*/, 13];
                    // Attempt to load the ABI from a contract database, if exists
                    onProgress("abiLoader", { address: address, facets: Object.keys(facets) });
                    loader_1 = abiLoader;
                    _d.label = 10;
                case 10:
                    _d.trys.push([10, 12, , 13]);
                    addresses_1 = Object.keys(facets);
                    promises_1 = addresses_1.map(function (addr) { return loader_1.loadABI(addr); });
                    return [4 /*yield*/, Promise.all(promises_1)];
                case 11:
                    results = _d.sent();
                    abis = Object.fromEntries(results.map(function (abi, i) {
                        return [addresses_1[i], abi];
                    }));
                    result.abi = pruneFacets(facets, abis);
                    if (result.abi.length > 0)
                        return [2 /*return*/, result];
                    return [3 /*break*/, 13];
                case 12:
                    error_1 = _d.sent();
                    // TODO: Catch useful errors
                    if (onError("abiLoad", error_1) === true)
                        return [2 /*return*/, result];
                    return [3 /*break*/, 13];
                case 13:
                    // Load from code
                    onProgress("abiFromBytecode", { address: address });
                    result.abi = (0, disasm_js_1.abiFromBytecode)(program);
                    if (!config.enableExperimentalMetadata) {
                        result.abi = stripUnreliableABI(result.abi);
                    }
                    // Add any extra ABIs we found from facets
                    (_c = result.abi).push.apply(_c, Object.values(facets).flat().map(function (selector) {
                        return {
                            type: "function",
                            selector: selector,
                        };
                    }));
                    signatureLookup = config.signatureLookup;
                    if (signatureLookup === undefined)
                        signatureLookup = loaders_js_1.defaultSignatureLookup;
                    if (!signatureLookup)
                        return [2 /*return*/, result]; // Bail
                    // Load signatures from a database
                    onProgress("signatureLookup", { abiItems: result.abi.length });
                    promises = [];
                    _loop_1 = function (a) {
                        if (a.type === "function") {
                            promises.push(signatureLookup.loadFunctions(a.selector).then(function (r) {
                                if (r.length >= 1) {
                                    a.sig = r[0];
                                    // Let ethers.js extract as much metadata as it can from the signature
                                    var extracted = JSON.parse(ethers_1.Fragment.from("function " + a.sig).format("json"));
                                    if (extracted.outputs.length === 0) {
                                        // Outputs not included in signature databases -_- (unless something changed)
                                        // Let whatsabi keep its best guess, if any.
                                        delete (extracted.outputs);
                                    }
                                    Object.assign(a, extracted);
                                }
                                if (r.length > 1)
                                    a.sigAlts = r.slice(1);
                            }));
                        }
                        else if (a.type === "event") {
                            promises.push(signatureLookup.loadEvents(a.hash).then(function (r) {
                                if (r.length >= 1) {
                                    a.sig = r[0];
                                    // Let ethers.js extract as much metadata as it can from the signature
                                    Object.assign(a, JSON.parse(ethers_1.Fragment.from("event " + a.sig).format("json")));
                                }
                                if (r.length > 1)
                                    a.sigAlts = r.slice(1);
                            }));
                        }
                    };
                    for (_i = 0, _a = result.abi; _i < _a.length; _i++) {
                        a = _a[_i];
                        _loop_1(a);
                    }
                    return [4 /*yield*/, Promise.all(promises)];
                case 14:
                    _d.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
function stripUnreliableABI(abi) {
    var r = [];
    for (var _i = 0, abi_1 = abi; _i < abi_1.length; _i++) {
        var a = abi_1[_i];
        if (a.type !== "function")
            continue;
        r.push({
            type: "function",
            selector: a.selector,
        });
    }
    return r;
}
function pruneFacets(facets, abis) {
    var r = [];
    for (var _i = 0, _a = Object.entries(abis); _i < _a.length; _i++) {
        var _b = _a[_i], addr = _b[0], abi = _b[1];
        var allowSelectors = new Set(facets[addr]);
        if (allowSelectors.size === 0) {
            // Skip pruning if the mapping is empty
            r.push.apply(r, abi);
            continue;
        }
        for (var _c = 0, abi_2 = abi; _c < abi_2.length; _c++) {
            var a = abi_2[_c];
            if (a.type !== "function") {
                r.push(a);
                continue;
            }
            a = a;
            var selector = a.selector;
            if (selector === undefined && a.name) {
                selector = ethers_1.FunctionFragment.getSelector(a.name, a.inputs);
            }
            if (allowSelectors.has(selector)) {
                r.push(a);
            }
        }
    }
    return r;
}
