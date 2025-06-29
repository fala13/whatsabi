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
var proxies_js_1 = require("../src/proxies.js");
var disasm_js_1 = require("../src/disasm.js");
var opcodes_js_1 = require("../src/opcodes.js");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, address, selector, code, program, hasDelegateCall, _i, _a, fn, _b, _c, resolver, facets, addr;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    provider = new ethers_1.ethers.IpcSocketProvider(process.argv[3]);
                    address = process.env["ADDRESS"] || process.argv[2];
                    selector = "";
                    code = process.argv[4];
                    program = (0, disasm_js_1.disasm)(code);
                    hasDelegateCall = false;
                    for (_i = 0, _a = Object.values(program.dests); _i < _a.length; _i++) {
                        fn = _a[_i];
                        if (fn.opTags.has(opcodes_js_1.opcodes.DELEGATECALL)) {
                            hasDelegateCall = true;
                            break;
                        }
                    }
                    _b = 0, _c = program.proxies;
                    _d.label = 1;
                case 1:
                    if (!(_b < _c.length)) return [3 /*break*/, 7];
                    resolver = _c[_b];
                    console.log("Proxy found:", resolver.toString());
                    if (!(!selector && resolver instanceof proxies_js_1.DiamondProxyResolver)) return [3 /*break*/, 3];
                    return [4 /*yield*/, resolver.facets(provider, address)];
                case 2:
                    facets = _d.sent();
                    console.log("Resolved to facets: ", facets);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, resolver.resolve(provider, address, selector)];
                case 4:
                    addr = _d.sent();
                    if (addr === "0x0000000000000000000000000000000000000000")
                        return [3 /*break*/, 6];
                    console.log("Resolved to address:", addr);
                    _d.label = 5;
                case 5:
                    process.exit(0);
                    return [2 /*return*/];
                case 6:
                    _b++;
                    return [3 /*break*/, 1];
                case 7:
                    if (hasDelegateCall && program.proxies.length === 0) {
                        console.log("DELEGATECALL detected but no proxies found");
                    }
                    else {
                        console.log("No DELEGATECALL detected");
                        return [2 /*return*/];
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
