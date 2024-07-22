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
var index_1 = require("../index");
var env_1 = require("./env");
(0, env_1.cached_test)('cached online: selectorsFromBytecode for Uniswap v2 Router', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var address, code, r;
    var provider = _b.provider, withCache = _b.withCache;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                address = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d";
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
                r = (0, index_1.selectorsFromBytecode)(code);
                r.sort();
                (0, vitest_1.expect)(r).toStrictEqual(['0x02751cec', '0x054d50d4', '0x18cbafe5', '0x1f00ca74', '0x2195995c', '0x38ed1739', '0x4a25d94a', '0x5b0d5984', '0x5c11d795', '0x791ac947', '0x7ff36ab5', '0x85f8c259', '0x8803dbee', '0xad5c4648', '0xad615dec', '0xaf2979eb', '0xb6f9de95', '0xbaa2abde', '0xc45a0155', '0xd06ca61f', '0xded9382a', '0xe8e33700', '0xf305d719', '0xfb3bdb41']);
                return [2 /*return*/];
        }
    });
}); });
(0, env_1.cached_test)('cached online: selectorsFromBytecode for 0x00000000 method', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var address, code, r;
    var provider = _b.provider, withCache = _b.withCache;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                address = "0x000000000000Df8c944e775BDe7Af50300999283";
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
                r = (0, index_1.selectorsFromBytecode)(code);
                (0, vitest_1.expect)(r).toEqual(vitest_1.expect.arrayContaining(['0x00000000', '0xf04f2707']));
                return [2 /*return*/];
        }
    });
}); });
(0, env_1.describe_cached)("detecting zero selector", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var provider = _b.provider, withCache = _b.withCache;
    return __generator(this, function (_c) {
        // Check positive cases
        vitest_1.test.each([
            { address: "0x000000000000Df8c944e775BDe7Af50300999283" },
        ])("check presence: $address", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var code, r;
            var address = _b.address;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, withCache("".concat(address, "_code"), provider.getCode.bind(provider, address))];
                    case 1:
                        code = _c.sent();
                        r = (0, index_1.selectorsFromBytecode)(code);
                        (0, vitest_1.expect)(r).toEqual(vitest_1.expect.arrayContaining(['0x00000000']));
                        return [2 /*return*/];
                }
            });
        }); });
        // Check negative cases
        vitest_1.test.each([
            { address: "0x99aa182ed0e2b6c47132e95686d2c73cdeff307f" },
            { address: "0xb1116d0a09f06d3e22a264c0c233d80e93abec10" },
            { address: "0xb60e36e2d67a34b4eae678cad779e281e4c6d58c" },
        ])("check absence: $address", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var code, r;
            var address = _b.address;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, withCache("".concat(address, "_code"), provider.getCode.bind(provider, address))];
                    case 1:
                        code = _c.sent();
                        r = (0, index_1.selectorsFromBytecode)(code);
                        (0, vitest_1.expect)(r).to.not.equal(vitest_1.expect.arrayContaining(['0x00000000']));
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
(0, env_1.cached_test)('cached online: selectorsFromBytecode that had 0x000000000 false positives', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var provider = _b.provider, withCache = _b.withCache;
    return __generator(this, function (_c) {
        return [2 /*return*/];
    });
}); });
