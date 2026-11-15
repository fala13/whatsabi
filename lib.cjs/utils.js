"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchError = void 0;
exports.hexToBytes = hexToBytes;
exports.bytesToHex = bytesToHex;
exports.fetchJSON = fetchJSON;
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
//# sourceMappingURL=utils.js.map