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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultKnownInterfaces = void 0;
exports.createInterfaceIndex = createInterfaceIndex;
exports.abiToInterfaces = abiToInterfaces;
const AbiFunction = __importStar(require("ox/AbiFunction"));
const _generated_interfaces_js_1 = __importDefault(require("./_generated-interfaces.js"));
exports.defaultKnownInterfaces = _generated_interfaces_js_1.default;
function createInterfaceIndex(known) {
    const r = {};
    for (const [name, signatures] of Object.entries(known)) {
        const selectors = signatures.map(sig => AbiFunction.getSelector(sig).slice(2));
        if (selectors.length === 0)
            continue;
        r[name] = new Set(selectors);
    }
    return r;
}
function abiToInterfaces(abiOrSelectors, knownInterfaces) {
    const r = [];
    if (abiOrSelectors.length === 0)
        return r;
    if (!knownInterfaces) {
        knownInterfaces = _generated_interfaces_js_1.default;
    }
    const selectorSet = new Set(abiOrSelectors.map(s => {
        if (s.length === 8)
            return s;
        if (s.length === 10)
            return s.slice(2);
        return AbiFunction.getSelector(s).slice(2);
    }));
    for (const [name, interfaceSet] of Object.entries(knownInterfaces)) {
        if (isSupersetOf(selectorSet, interfaceSet)) {
            r.push(name);
        }
    }
    return r;
}
function isSupersetOf(a, b) {
    for (const elem of b) {
        if (!a.has(elem)) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=interfaces.js.map