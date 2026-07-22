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
exports.Web3ProviderError = exports.MissingENSProviderError = void 0;
exports.CompatibleProvider = CompatibleProvider;
exports.WithCachedCode = WithCachedCode;
exports.WithBlockNumber = WithBlockNumber;
const utils_js_1 = require("./utils.js");
const errors = __importStar(require("./errors.js"));
;
;
function fromBlockTagOrNumber(block) {
    if (typeof block === 'number' || typeof block === 'bigint') {
        return (0, utils_js_1.bytesToHex)(block);
    }
    return block;
}
function isCompatibleProvider(provider) {
    return (typeof provider.getStorageAt === "function" &&
        typeof provider.call === "function" &&
        typeof provider.getCode === "function" &&
        typeof provider.getAddress === "function");
}
function CompatibleProvider(provider) {
    if (isCompatibleProvider(provider)) {
        return provider;
    }
    if (typeof provider.getAddress === "function") {
        return new HighLevelProvider(provider);
    }
    if (typeof provider.resolveName === "function") {
        if (typeof provider.send === "function") {
            return new EthersProvider(provider);
        }
        return new HighLevelProvider(provider);
    }
    if (typeof provider.getEnsAddress === "function") {
        return new ViemProvider(provider);
    }
    if (typeof provider?.eth?.ens?.getAddress === "function") {
        return new Web3Provider(provider.eth);
    }
    if (typeof provider.request === "function") {
        return new RPCProvider(provider);
    }
    throw new errors.ProviderError("Unsupported provider, please open an issue: https://github.com/shazow/whatsabi/issues", {
        context: { provider },
    });
}
function WithCachedCode(provider, codeCache) {
    const compatibleProvider = CompatibleProvider(provider);
    const p = Object.create(compatibleProvider);
    p.getCode = async function getCode(address) {
        if (codeCache[address]) {
            return codeCache[address];
        }
        return await compatibleProvider.getCode(address);
    };
    return p;
}
function WithBlockNumber(provider, blockNumber) {
    const p = Object.create(provider);
    p.getCode = async function getCode(address) {
        return await provider.getCode(address, blockNumber);
    };
    p.getStorageAt = async function getStorageAt(address, slot) {
        return await provider.getStorageAt(address, slot, blockNumber);
    };
    p.call = async function call(transaction) {
        return await provider.call(transaction, blockNumber);
    };
    return p;
}
class RPCProvider {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    request(req) {
        return this.provider.request(req);
    }
    getStorageAt(address, slot, block = "latest") {
        return this.request({
            method: "eth_getStorageAt",
            params: [
                address,
                typeof slot === 'number' ? (0, utils_js_1.bytesToHex)(slot) : slot,
                fromBlockTagOrNumber(block),
            ],
        });
    }
    call(transaction, block = "latest") {
        return this.request({
            method: "eth_call",
            params: [
                {
                    from: "0x0000000000000000000000000000000000000001",
                    to: transaction.to,
                    data: transaction.data,
                },
                fromBlockTagOrNumber(block),
            ],
        });
    }
    getCode(address, block = "latest") {
        return this.request({
            method: "eth_getCode",
            params: [
                address,
                fromBlockTagOrNumber(block),
            ]
        });
    }
    getAddress(name) {
        throw new MissingENSProviderError("Provider does not implement getAddress, required to resolve ENS", {
            context: { name, provider: this.provider },
        });
    }
}
class MissingENSProviderError extends errors.ProviderError {
}
exports.MissingENSProviderError = MissingENSProviderError;
;
class HighLevelProvider {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    getStorageAt(address, slot) {
        if ("getStorageAt" in this.provider) {
            return this.provider.getStorageAt(address, slot);
        }
        return this.provider.getStorage(address, slot);
    }
    call(transaction) {
        return this.provider.call(transaction);
    }
    getCode(address) {
        return this.provider.getCode(address);
    }
    getAddress(name) {
        return this.provider.getAddress(name);
    }
}
class Web3Provider extends RPCProvider {
    request({ method, params }) {
        const r = this.provider.currentProvider.request({ method, params, "jsonrpc": "2.0", id: "1" });
        return r.then((resp) => {
            if (resp.result)
                return resp.result;
            else if (resp.error)
                throw new Web3ProviderError(resp.error.message, {
                    context: { method, params, resp },
                });
            return resp;
        });
    }
    getAddress(name) {
        return this.provider.ens.getAddress(name);
    }
}
class Web3ProviderError extends errors.ProviderError {
}
exports.Web3ProviderError = Web3ProviderError;
;
class EthersProvider extends RPCProvider {
    request(args) {
        return this.provider.send(args.method, args.params);
    }
    getAddress(name) {
        return this.provider.resolveName(name);
    }
}
class ViemProvider extends RPCProvider {
    request(args) {
        return this.provider.transport.request(args);
    }
    getAddress(name) {
        return this.provider.getEnsAddress({ name });
    }
}
//# sourceMappingURL=providers.js.map