"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var disasm_1 = require("../disasm");
var opcodes_1 = require("../opcodes");
(0, vitest_1.describe)('BytecodeIter', function () {
    (0, vitest_1.test)('opcodes', function () {
        var bytecode = "604260005260206000F3";
        // [00]	PUSH1	42
        // [02]	PUSH1	00
        // [04]	MSTORE
        // [05]	PUSH1	20
        // [07]	PUSH1	00
        // [09]	RETURN
        var code = new disasm_1.BytecodeIter(bytecode, { bufferSize: 4 });
        (0, vitest_1.expect)(code.next()).toBe(0x60);
        (0, vitest_1.expect)(code.posBuffer.length).toBe(1);
        (0, vitest_1.expect)(code.posBuffer[0]).toBe(0);
        (0, vitest_1.expect)((0, opcodes_1.pushWidth)(code.bytecode[0])).toBe(1);
        (0, vitest_1.expect)(code.pos()).toBe(0);
        (0, vitest_1.expect)(code.step()).toBe(0);
        (0, vitest_1.expect)(code.value()).toEqual(new Uint8Array([0x42]));
        (0, vitest_1.expect)(code.next()).toBe(0x60);
        (0, vitest_1.expect)(code.pos()).toBe(2); // Pos goes up byte 2 because PUSH1
        (0, vitest_1.expect)(code.step()).toBe(1);
        (0, vitest_1.expect)(code.value()).toEqual(new Uint8Array([0x00]));
        (0, vitest_1.expect)(code.next()).toBe(0x52);
        (0, vitest_1.expect)(code.next()).toBe(0x60);
        (0, vitest_1.expect)(code.value()).toEqual(new Uint8Array([0x20]));
        (0, vitest_1.expect)(code.next()).toBe(0x60);
        (0, vitest_1.expect)(code.value()).toEqual(new Uint8Array([0x00]));
        // Relative peek back
        (0, vitest_1.expect)(code.at(-1)).toBe(0x60);
        (0, vitest_1.expect)(code.valueAt(-1)).toEqual(new Uint8Array([0x00]));
        (0, vitest_1.expect)(code.at(-2)).toBe(0x60);
        (0, vitest_1.expect)(code.valueAt(-2)).toEqual(new Uint8Array([0x20]));
        (0, vitest_1.expect)(code.at(-3)).toBe(0x52);
        (0, vitest_1.expect)(code.valueAt(-3)).toEqual(new Uint8Array());
        (0, vitest_1.expect)(code.at(-4)).toBe(0x60);
        (0, vitest_1.expect)(code.hasMore()).toBe(true);
        (0, vitest_1.expect)(code.next()).toBe(0xF3);
        (0, vitest_1.expect)(code.hasMore()).toBe(false);
        (0, vitest_1.expect)(code.next()).toBe(0x00); // STOP, default value after hasMore is done
    });
    (0, vitest_1.test)('buffer', function () {
        var code = new disasm_1.BytecodeIter("604260005260206000F3", { bufferSize: 1 });
        // Exceed buffer
        (0, vitest_1.expect)(code.at(-1)).toBe(undefined);
        (0, vitest_1.expect)(code.at(-2)).toBe(undefined);
        (0, vitest_1.expect)(code.valueAt(-1)).toEqual(new Uint8Array());
        (0, vitest_1.expect)(code.at(-999)).toBe(undefined);
        (0, vitest_1.expect)(code.valueAt(-999)).toEqual(new Uint8Array());
        (0, vitest_1.expect)(code.pos()).toBe(-1);
        (0, vitest_1.expect)(code.step()).toBe(-1);
        (0, vitest_1.expect)(code.next()).toBe(0x60);
        (0, vitest_1.expect)(code.at(-1)).toBe(0x60);
        (0, vitest_1.expect)(code.valueAt(-1)).toEqual(new Uint8Array([0x42]));
        (0, vitest_1.expect)(code.at(-2)).toBe(undefined);
        (0, vitest_1.expect)(code.pos()).toBe(0);
        (0, vitest_1.expect)(code.step()).toBe(0);
        // Exceed bytecode
        (0, vitest_1.expect)(code.at(999)).toBe(undefined);
        (0, vitest_1.expect)(code.valueAt(999)).toEqual(new Uint8Array());
    });
});
