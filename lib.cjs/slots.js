"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinSlot = joinSlot;
exports.addSlotOffset = addSlotOffset;
exports.readArray = readArray;
const Hash = __importStar(require("ox/Hash"));
const errors_js_1 = require("./errors.js");
function joinSlot(parts) {
    return Hash.keccak256(("0x" + parts.map(s => {
        if (s.startsWith("0x")) {
            s = s.slice(2);
        }
        return s.padStart(64, "0");
    }).join("")));
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
    const position = pos.toString(16);
    const start = Hash.keccak256((position.startsWith("0x") ? position : `0x${position}`));
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