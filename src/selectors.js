"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectorsFromABI = selectorsFromABI;
exports.selectorsFromBytecode = selectorsFromBytecode;
var ethers_1 = require("ethers");
var utils_js_1 = require("./utils.js");
var disasm_js_1 = require("./disasm.js");
// Load function selectors mapping from ABI, parsed using ethers.js
// Mapping is selector hash to signature
function selectorsFromABI(abi) {
    var r = {};
    for (var _i = 0, abi_1 = abi; _i < abi_1.length; _i++) {
        var el = abi_1[_i];
        if (typeof (el) !== "string" && el.type !== "function")
            continue;
        var f = ethers_1.FunctionFragment.from(el).format();
        r[(0, utils_js_1.keccak256)(f).substring(0, 10)] = f;
    }
    return r;
}
// Load function selectors from EVM bytecode by parsing JUMPI instructions
function selectorsFromBytecode(code) {
    var p = (0, disasm_js_1.disasm)(code, { onlyJumpTable: true });
    return Object.keys(p.selectors);
}
