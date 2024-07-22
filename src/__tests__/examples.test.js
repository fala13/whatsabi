"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var index_1 = require("../index");
var env_1 = require("./env");
var TIMEOUT = 25000;
(0, env_1.cached_test)('README usage', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var address, code, selectors, abi, signatureLookup, sig, sig, event;
    var provider = _b.provider, withCache = _b.withCache;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                address = "0x00000000006c3852cbEf3e08E8dF289169EdE581";
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
                selectors = index_1.whatsabi.selectorsFromBytecode(code);
                // console.log(selectors); // ["0x06fdde03", "0x46423aa7", "0x55944a42", ...]
                (0, vitest_1.expect)(selectors).toEqual(vitest_1.expect.arrayContaining(["0x06fdde03", "0x46423aa7", "0x55944a42"]));
                {
                    abi = index_1.whatsabi.abiFromBytecode(code);
                    // console.log(abi);
                    // [
                    //    {"type": "event", "hash": "0x721c20121297512b72821b97f5326877ea8ecf4bb9948fea5bfcb6453074d37f"},
                    //    {"type": "function", "payable": true, "selector": "0x06fdde03"},
                    //    {"type": "function", "payable": true, "selector": "0x46423aa7"},
                    //    ...
                    // ]
                    (0, vitest_1.expect)(abi).toContainEqual({ "hash": "0x721c20121297512b72821b97f5326877ea8ecf4bb9948fea5bfcb6453074d37f", "type": "event" });
                    (0, vitest_1.expect)(abi).toContainEqual({ "payable": true, "selector": "0xb3a34c4c", "type": "function", "stateMutability": "payable", "inputs": [{ "type": "bytes", "name": "" }], "outputs": [{ "type": "bytes", "name": "" }] });
                }
                signatureLookup = new index_1.whatsabi.loaders.OpenChainSignatureLookup();
                return [4 /*yield*/, signatureLookup.loadFunctions("0x06fdde03")];
            case 2:
                sig = _c.sent();
                (0, vitest_1.expect)(sig).toStrictEqual(["name()"]);
                return [4 /*yield*/, signatureLookup.loadFunctions("0x46423aa7")];
            case 3:
                sig = _c.sent();
                (0, vitest_1.expect)(sig).toStrictEqual(["getOrderStatus(bytes32)"]);
                return [4 /*yield*/, signatureLookup.loadEvents("0x721c20121297512b72821b97f5326877ea8ecf4bb9948fea5bfcb6453074d37f")];
            case 4:
                event = _c.sent();
                (0, vitest_1.expect)(event).toContainEqual("CounterIncremented(uint256,address)");
                return [2 /*return*/];
        }
    });
}); }, TIMEOUT);
(0, env_1.online_test)('README autoload', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var address, result, _c, abi, address_1;
    var provider = _b.provider;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                address = "0x00000000006c3852cbEf3e08E8dF289169EdE581";
                return [4 /*yield*/, index_1.whatsabi.autoload(address, __assign(__assign({ provider: provider }, index_1.whatsabi.loaders.defaultsWithEnv({
                        SOURCIFY_CHAIN_ID: 42161,
                        ETHERSCAN_BASE_URL: "https://api.arbiscan.io/api",
                        //ETHERSCAN_API_KEY: "MYSECRETAPIKEY",
                    })), { 
                        // * Optional hooks:
                        // onProgress: (phase: string) => { ... }
                        // onError: (phase: string, context: any) => { ... }
                        onProgress: function (phase) { return console.log("autoload progress", phase); }, onError: function (phase, context) { return console.log("autoload error", phase, context); } }))];
            case 1:
                result = _d.sent();
                (0, vitest_1.expect)(result.abi).toContainEqual(
                // 'function name() pure returns (string contractName)'
                { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "contractName", "type": "string" }], "stateMutability": "pure", "type": "function" });
                if (!result.followProxies) return [3 /*break*/, 3];
                return [4 /*yield*/, result.followProxies()];
            case 2:
                result = _d.sent();
                _d.label = 3;
            case 3: return [4 /*yield*/, index_1.whatsabi.autoload("0x4f8AD938eBA0CD19155a835f617317a6E788c868", {
                    provider: provider,
                    followProxies: true,
                })];
            case 4:
                _c = _d.sent(), abi = _c.abi, address_1 = _c.address;
                (0, vitest_1.expect)(abi.length).toBeGreaterThan(0);
                (0, vitest_1.expect)(address_1).toBe("0x964f84048f0d9bb24b82413413299c0a1d61ea9f");
                return [2 /*return*/];
        }
    });
}); }, TIMEOUT);
