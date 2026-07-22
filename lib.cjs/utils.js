"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchError = void 0;
exports.hexToBytes = hexToBytes;
exports.bytesToHex = bytesToHex;
exports.keccak256 = keccak256;
exports.fetchJSON = fetchJSON;
exports.addressWithChecksum = addressWithChecksum;
function hexToBytes(hex) {
    if (hex.startsWith("0x")) {
        hex = hex.slice(2);
    }
    const length = hex.length;
    if (length % 2 !== 0) {
        throw new Error('hexToBytes: odd input length, must be even: ' + hex);
    }
    const r = new Uint8Array(length / 2);
    for (let i = 0; i < length; i += 2) {
        const highNibble = parseInt(hex[i], 16);
        const lowNibble = parseInt(hex[i + 1], 16);
        r[i / 2] = (highNibble << 4) | lowNibble;
    }
    return r;
}
function bytesToHex(bytes, padToBytes) {
    const hex = (typeof bytes === 'number' || typeof bytes === 'bigint') ? bytes.toString(16) : Array.prototype.map.call(bytes, function (n) {
        return n.toString(16).padStart(2, "0");
    }).join("");
    if (padToBytes) {
        return "0x" + hex.padStart(padToBytes * 2, "0");
    }
    return "0x" + hex;
}
const sha3_js_1 = require("@noble/hashes/sha3.js");
function keccak256(data) {
    if (typeof data !== "string") {
        return bytesToHex((0, sha3_js_1.keccak_256)(data));
    }
    if (data.startsWith("0x")) {
        return bytesToHex((0, sha3_js_1.keccak_256)(hexToBytes(data.slice(2))));
    }
    return bytesToHex((0, sha3_js_1.keccak_256)(hexToBytes(data)));
}
class FetchError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
exports.FetchError = FetchError;
async function fetchJSON(url) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) {
        throw new FetchError(response.statusText, response.status);
    }
    return response.json();
}
function addressWithChecksum(address) {
    const chars = address.toLowerCase().substring(2).split("");
    const expanded = new Uint8Array(40);
    for (let i = 0; i < 40; i++) {
        expanded[i] = chars[i].charCodeAt(0);
    }
    const hashed = (0, sha3_js_1.keccak_256)(expanded);
    for (let i = 0; i < 40; i += 2) {
        if ((hashed[i >> 1] >> 4) >= 8) {
            chars[i] = chars[i].toUpperCase();
        }
        if ((hashed[i >> 1] & 0x0f) >= 8) {
            chars[i + 1] = chars[i + 1].toUpperCase();
        }
    }
    return "0x" + chars.join("");
}
//# sourceMappingURL=utils.js.map