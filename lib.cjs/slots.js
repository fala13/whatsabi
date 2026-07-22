"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinSlot = joinSlot;
exports.addSlotOffset = addSlotOffset;
exports.readArray = readArray;
const utils_js_1 = require("./utils.js");
const errors_js_1 = require("./errors.js");
function joinSlot(parts) {
    return (0, utils_js_1.keccak256)("0x" + parts.map(s => {
        if (s.startsWith("0x")) {
            s = s.slice(2);
        }
        return s.padStart(64, "0");
    }).join(""));
}
function addSlotOffset(slot, offset) {
    return "0x" + (BigInt(slot) + BigInt(offset)).toString(16);
}
async function readArray(provider, address, pos, width = 32, limit = 0) {
    const length = BigInt(await provider.getStorageAt(address, pos));
    if (limit !== 0 && length > BigInt(limit)) {
        throw new errors_js_1.StorageReadError(`readArray aborted: Array size ${length} exceeds limit of ${limit}`, { context: { address, pos, width, limit } });
    }
    if (length > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new errors_js_1.StorageReadError(`readArray aborted: Array size ${length} exceeds safe integer range`, { context: { address, pos, width, limit } });
    }
    const num = Number(length);
    const start = (0, utils_js_1.keccak256)(pos.toString(16));
    const itemsPerWord = Math.floor(32 / width);
    const promises = [];
    for (let i = 0; i < num; i++) {
        const itemSlot = addSlotOffset(start, Math.floor(i / itemsPerWord));
        promises.push(provider.getStorageAt(address, itemSlot));
    }
    const words = await Promise.all(promises);
    return words.map((wordHex, i) => {
        const itemOffset = 2 + 64 - (i % itemsPerWord + 1) * width * 2;
        return wordHex.slice(itemOffset, itemOffset + width * 2);
    });
}
//# sourceMappingURL=slots.js.map