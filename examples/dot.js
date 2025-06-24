#!/usr/bin/env -S tsx
"use strict";
// Example usage:
// ./examples/dot.ts 0x7a250d5630b4cf539739df2c5dacb4c659f2488d | dot -Tpng  | feh -
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
exports.programToDotGraph = programToDotGraph;
var ethers_1 = require("ethers");
var fs_1 = require("fs");
var filecache_js_1 = require("../src/internal/filecache.js");
var disasm_js_1 = require("../src/disasm.js");
var opcodes_js_1 = require("../src/opcodes.js");
var loaders_js_1 = require("../src/loaders.js");
var utils_js_1 = require("../src/utils.js");
var _a = process.env, INFURA_API_KEY = _a.INFURA_API_KEY, SKIP_SELECTOR_LOOKUP = _a.SKIP_SELECTOR_LOOKUP, SKIP_TAGS = _a.SKIP_TAGS;
var provider = INFURA_API_KEY ? (new ethers_1.ethers.InfuraProvider("homestead", INFURA_API_KEY)) : ethers_1.ethers.getDefaultProvider("homestead");
function programToDotGraph(p, lookup) {
    function toID(n) {
        return (nameLookup[n] || (0, utils_js_1.bytesToHex)(n));
    }
    var nameLookup, jumps, seen, fn, j, id, parts, tags, lookupExtra;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, "digraph JUMPS {"];
            case 1:
                _a.sent();
                return [4 /*yield*/, "\tgraph [nojustify=true];\n"];
            case 2:
                _a.sent();
                return [4 /*yield*/, "\tnode [shape=record];\n"];
            case 3:
                _a.sent();
                nameLookup = Object.fromEntries(Object.entries(p.selectors).map(function (_a) {
                    var k = _a[0], v = _a[1];
                    return [v, k];
                }));
                return [4 /*yield*/, "\tsubgraph cluster_0 {"];
            case 4:
                _a.sent();
                return [4 /*yield*/, "\t\tlabel = Selectors;"];
            case 5:
                _a.sent();
                return [4 /*yield*/, "\t\tnode [style=filled];"];
            case 6:
                _a.sent();
                return [4 /*yield*/, "\t\trankdir=LR;"];
            case 7:
                _a.sent();
                return [4 /*yield*/, "\t\t".concat(Object.keys(p.selectors).map(function (s) { return '"' + s + '"'; }).join(" "))];
            case 8:
                _a.sent();
                return [4 /*yield*/, "\t}"];
            case 9:
                _a.sent();
                jumps = Object.values(p.selectors).map(function (j) { return p.dests[j]; });
                seen = new Set();
                if (jumps.length == 0)
                    jumps.push.apply(jumps, Object.values(p.dests));
                _a.label = 10;
            case 10:
                if (!(jumps.length > 0)) return [3 /*break*/, 13];
                fn = jumps.pop();
                if (!fn)
                    return [3 /*break*/, 10];
                if (seen.has(fn.start))
                    return [3 /*break*/, 10];
                seen.add(fn.start);
                j = fn.jumps.filter(function (j) { return j in p.dests; }).map(function (j) { return p.dests[j]; });
                id = toID(fn.start);
                parts = [id];
                tags = fn.opTags && Array.from(fn.opTags).map(function (op) { return opcodes_js_1.mnemonics[op]; }).join("\\l");
                lookupExtra = lookup[id];
                if (lookupExtra)
                    parts.push(lookupExtra);
                if (!SKIP_TAGS)
                    parts.push(tags);
                return [4 /*yield*/, "\t\"".concat(id, "\" [label=\"{") + parts.join(" | ") + "} }\"]"];
            case 11:
                _a.sent();
                return [4 /*yield*/, "\t\"".concat(id, "\" -> { ").concat(j.map(function (n) { return '"' + toID(n.start) + '"'; }).join(" "), " }")];
            case 12:
                _a.sent();
                jumps.push.apply(jumps, j);
                return [3 /*break*/, 10];
            case 13: return [4 /*yield*/, "}"];
            case 14:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var address, code, program, selectors, lookup, _loop_1, _i, selectors_1, sel, state_1, iter, _a, value, done;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    address = process.env["ADDRESS"] || process.argv[2];
                    if (!!address) return [3 /*break*/, 1];
                    console.error("Invalid address: " + address);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 1:
                    if (!(address === "-")) return [3 /*break*/, 2];
                    // Read contract code from stdin
                    code = (0, fs_1.readFileSync)(0, 'utf8').trim();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, filecache_js_1.withCache)("".concat(address, "_abi"), function () { return __awaiter(_this, void 0, void 0, function () {
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
                    program = (0, disasm_js_1.disasm)(code);
                    selectors = Object.keys(program.selectors);
                    lookup = {};
                    _loop_1 = function (sel) {
                        var sigs;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (SKIP_SELECTOR_LOOKUP)
                                        return [2 /*return*/, "break"];
                                    return [4 /*yield*/, (0, filecache_js_1.withCache)("".concat(sel, "_selector"), function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, loaders_js_1.defaultSignatureLookup.loadFunctions(sel)];
                                                    case 1: return [2 /*return*/, _a.sent()];
                                                }
                                            });
                                        }); })];
                                case 1:
                                    sigs = _c.sent();
                                    if (sigs.length === 0)
                                        return [2 /*return*/, "continue"];
                                    lookup[sel] = sigs[0].split("(")[0];
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, selectors_1 = selectors;
                    _b.label = 5;
                case 5:
                    if (!(_i < selectors_1.length)) return [3 /*break*/, 8];
                    sel = selectors_1[_i];
                    return [5 /*yield**/, _loop_1(sel)];
                case 6:
                    state_1 = _b.sent();
                    if (state_1 === "break")
                        return [3 /*break*/, 8];
                    _b.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    iter = programToDotGraph(program, lookup);
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
