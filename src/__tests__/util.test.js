"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var ethers_1 = require("ethers");
var utils_1 = require("../utils");
(0, vitest_1.describe)('Utils', function () {
    vitest_1.test.each([
        new Uint8Array([0, 1, 2, 3]),
        new Uint8Array([42, 69, 255]),
        new Uint8Array([255]),
        new Uint8Array([255, 255]),
        new Uint8Array([0, 255, 0, 255]),
    ])("bytesToHex %s", function (bytes) {
        (0, vitest_1.expect)((0, utils_1.bytesToHex)(bytes)).toStrictEqual(ethers_1.ethers.hexlify(bytes));
    });
    (0, vitest_1.test)("bytesToHex padding", function () {
        (0, vitest_1.expect)((0, utils_1.bytesToHex)(new Uint8Array([0]), 20)).toStrictEqual("0x0000000000000000000000000000000000000000");
        (0, vitest_1.expect)((0, utils_1.bytesToHex)(new Uint8Array([255, 255, 255]), 20)).toStrictEqual("0x0000000000000000000000000000000000ffffff");
    });
    vitest_1.test.each([
        "0x00010203",
        "0x0000102030",
        "0x2a45ff",
        "0xff",
        "0xffff",
        "0x00ff00ff",
    ])("hexToBytes %s", function (hex) {
        (0, vitest_1.expect)((0, utils_1.hexToBytes)(hex)).toStrictEqual(ethers_1.ethers.getBytes(hex));
    });
    vitest_1.test.each([
        "0x00010203",
        "0xffff",
        "0xffff0000111122223333444455556666777788889999aaaabbbbccccddddeeee",
        new Uint8Array([0, 1, 2, 3]),
        new Uint8Array([255, 0, 255, 0, 255, 0]),
    ])("keccak256 %s", function (hex) {
        (0, vitest_1.expect)((0, utils_1.keccak256)(hex)).toStrictEqual(ethers_1.ethers.keccak256(hex));
    });
});
