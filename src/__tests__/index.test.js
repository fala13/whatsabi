"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var ethers_1 = require("ethers");
var sample_1 = require("./__fixtures__/sample");
var index_1 = require("../index");
(0, vitest_1.test)('selectorsFromBytecode', function () {
    var abi = (0, index_1.selectorsFromABI)(sample_1.SAMPLE_ABI);
    var expected = Object.keys(abi);
    var r = (0, index_1.selectorsFromBytecode)(sample_1.SAMPLE_CODE);
    (0, vitest_1.expect)(new Set(r)).toStrictEqual(new Set(expected));
});
vitest_1.test.skip('WIP: abiFromBytecode functions', function () {
    var r = (0, index_1.abiFromBytecode)(sample_1.SAMPLE_CODE).filter(function (a) { return a.type === "function"; });
    var got = Object.fromEntries(r.map(function (a) { return [a.selector, a]; }));
    var sample = toKnown(sample_1.SAMPLE_ABI.filter(function (a) { return a.type === "function"; }));
    var expected = Object.fromEntries(sample.map(function (a) {
        if (got[a.selector] !== undefined) {
            got[a.selector].name = a.name;
        }
        return [a.selector, a];
    }));
    (0, vitest_1.expect)(got).toStrictEqual(expected);
});
// toKnown converts a traditional ABI object to a subset that we know how to
// extract, so that we can make comparisons within our limitations.
function toKnown(abi) {
    var iface = new ethers_1.ethers.Interface(abi);
    return abi.map(function (a) {
        var _a;
        if (a.type === "event") {
            return a;
        }
        if (a.type === "function") {
            a.selector = (_a = iface.getFunction(a.name)) === null || _a === void 0 ? void 0 : _a.selector;
        }
        // We can only tell iff there are inputs/outputs, not what they are
        if (a.inputs.length > 0)
            a.inputs = [{ type: "bytes" }];
        else
            delete (a["inputs"]);
        if (a.outputs.length > 0)
            a.outputs = [{ type: "bytes" }];
        else
            delete (a["outputs"]);
        delete (a["anonymous"]);
        a.payable = a.stateMutability === "payable";
        return a;
    });
}
