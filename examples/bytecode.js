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
var fs_1 = require("fs");
var filecache_js_1 = require("../src/internal/filecache.js");
var debug_js_1 = require("../src/internal/debug.js");
var _a = process.env, INFURA_API_KEY = _a.INFURA_API_KEY, OPCODES_JSON = _a.OPCODES_JSON;
var provider = INFURA_API_KEY ? (new ethers_1.ethers.InfuraProvider("homestead", INFURA_API_KEY)) : ethers_1.ethers.getDefaultProvider("homestead");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var address, jumpdest, code, config, opcodes, pos, iter, _a, value, done;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    address = process.env["ADDRESS"] || process.argv[2];
                    jumpdest = process.env["JUMPDEST"] || process.argv[3];
                    if (!!address) return [3 /*break*/, 1];
                    console.error("Invalid address: " + address);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 1:
                    if (!(address === "-")) return [3 /*break*/, 2];
                    // Read contract code from stdin
                    code = (0, fs_1.readFileSync)(0, 'utf8').trim();
                    return [3 /*break*/, 4];
                case 2:
                    console.debug("Loading code for address:", address);
                    return [4 /*yield*/, (0, filecache_js_1.withCache)("".concat(address, "_abi"), function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, provider.getCode(address)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })];
                case 3:
                    code = _b.sent();
                    _b.label = 4;
                case 4:
                    config = {};
                    if (OPCODES_JSON) {
                        opcodes = JSON.parse((0, fs_1.readFileSync)(OPCODES_JSON, 'utf8'));
                        config.opcodeLookup = Object.fromEntries(Object.entries(opcodes).map(function (_a) {
                            var k = _a[0], v = _a[1];
                            return [parseInt(k, 16), v];
                        }));
                    }
                    if (jumpdest) {
                        pos = jumpdest.startsWith("0x") ? parseInt(jumpdest, 16) : parseInt(jumpdest);
                        config.startPos = config.highlightPos = pos;
                        config.stopPos = pos + 40;
                    }
                    iter = (0, debug_js_1.bytecodeToString)(code, config);
                    while (true) {
                        _a = iter.next(), value = _a.value, done = _a.done;
                        if (done)
                            break;
                        console.log(value);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
main().then().catch(function (err) {
    console.error("Failed:", err);
    process.exit(2);
});
