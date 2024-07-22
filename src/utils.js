"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.hexToBytes = hexToBytes;
exports.bytesToHex = bytesToHex;
exports.keccak256 = keccak256;
exports.fetchJSON = fetchJSON;
exports.addressWithChecksum = addressWithChecksum;
// Convert 32 bytes of hex to Uint8Array, undefined for other sizes
//
// Borrowed from:
// https://chat.openai.com/share/ae1e8813-ac3d-4262-89c7-14c462febb34
function hexToBytes(hex) {
    if (hex.startsWith("0x")) {
        hex = hex.slice(2);
    }
    var length = hex.length;
    if (length % 2 !== 0) {
        throw new Error('hexToBytes: odd input length, must be even: ' + hex);
    }
    var r = new Uint8Array(length / 2);
    for (var i = 0; i < length; i += 2) {
        var highNibble = parseInt(hex[i], 16);
        var lowNibble = parseInt(hex[i + 1], 16);
        r[i / 2] = (highNibble << 4) | lowNibble;
    }
    return r;
}
function bytesToHex(bytes, padToBytes) {
    var hex = typeof bytes === 'number' ? bytes.toString(16) : Array.prototype.map.call(bytes, function (n) {
        return n.toString(16).padStart(2, "0");
    }).join("");
    if (padToBytes) {
        return "0x" + hex.padStart(padToBytes * 2, "0");
    }
    return "0x" + hex;
}
var sha3_1 = require("@noble/hashes/sha3");
function keccak256(data) {
    if (typeof data !== "string") {
        return bytesToHex((0, sha3_1.keccak_256)(data));
    }
    if (data.startsWith("0x")) {
        data = hexToBytes(data.slice(2));
    }
    return bytesToHex((0, sha3_1.keccak_256)(data));
}
var FetchError = /** @class */ (function (_super) {
    __extends(FetchError, _super);
    function FetchError(message, status) {
        var _this = _super.call(this, message) || this;
        _this.status = status;
        return _this;
    }
    return FetchError;
}(Error));
function fetchJSON(url) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(url, {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new FetchError(response.statusText, response.status);
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
// Borrowed from ethers.js with minor modifications
// https://github.com/ethers-io/ethers.js/blob/32915634bef5b81c6d9998f4e9ad812ffe721954/src.ts/address/address.ts#L8
// MIT License, copyright Richard Moore
function addressWithChecksum(address) {
    var chars = address.toLowerCase().substring(2).split("");
    var expanded = new Uint8Array(40);
    for (var i = 0; i < 40; i++) {
        expanded[i] = chars[i].charCodeAt(0);
    }
    var hashed = (0, sha3_1.keccak_256)(expanded);
    for (var i = 0; i < 40; i += 2) {
        if ((hashed[i >> 1] >> 4) >= 8) {
            chars[i] = chars[i].toUpperCase();
        }
        if ((hashed[i >> 1] & 0x0f) >= 8) {
            chars[i + 1] = chars[i + 1].toUpperCase();
        }
    }
    return "0x" + chars.join("");
}
