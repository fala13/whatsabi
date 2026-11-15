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
exports.slotPreimages = exports.slotResolvers = exports.slots = exports.FixedProxyResolver = exports.aragonAppProxyImplementationSelector = exports.AragonAppProxyResolver = exports.livepeerManagerProxySelectors = exports.LivepeerManagerProxyResolver = exports.SequenceWalletProxyResolver = exports.MaticProxyResolver = exports.PROXIABLEProxyResolver = exports.ZeppelinOSProxyResolver = exports.DiamondProxyResolver = exports.EIP1967ProxyResolver = exports.LegacyUpgradeableProxyResolver = exports.GnosisSafeProxyResolver = exports.BaseProxyResolver = void 0;
const Address = __importStar(require("ox/Address"));
const errors_js_1 = require("./errors.js");
const slots_js_1 = require("./slots.js");
const _zeroAddress = "0x0000000000000000000000000000000000000000";
function addressFromPadded(data) {
    return "0x" + wordFrom(data).slice(-40);
}
class BaseProxyResolver {
    name;
    constructor(name) {
        this.name = name || this.constructor.name;
    }
    toString() {
        return this.name;
    }
}
exports.BaseProxyResolver = BaseProxyResolver;
class GnosisSafeProxyResolver extends BaseProxyResolver {
    async resolve(provider, address) {
        const slotPosition = 0;
        return addressFromPadded(await provider.getStorageAt(address, slotPosition));
    }
}
exports.GnosisSafeProxyResolver = GnosisSafeProxyResolver;
class LegacyUpgradeableProxyResolver extends BaseProxyResolver {
    async resolve(provider, address) {
        const slotPosition = 1;
        return addressFromPadded(await provider.getStorageAt(address, slotPosition));
    }
}
exports.LegacyUpgradeableProxyResolver = LegacyUpgradeableProxyResolver;
const EIP1967FallbackSelectors = [
    "0x5c60da1b",
    "0xda525716",
    "0xa619486e",
    "0xbb82aa5e",
];
class EIP1967ProxyResolver extends BaseProxyResolver {
    name = "EIP1967Proxy";
    async resolve(provider, address) {
        const implAddr = addressFromPadded(await provider.getStorageAt(address, exports.slots.EIP1967_IMPL));
        if (implAddr !== _zeroAddress) {
            return implAddr;
        }
        const fallbackAddr = addressFromPadded(await provider.getStorageAt(address, exports.slots.EIP1967_BEACON));
        if (fallbackAddr === _zeroAddress) {
            return _zeroAddress;
        }
        for (const selector of EIP1967FallbackSelectors) {
            try {
                const addr = addressFromPadded(await provider.call({
                    to: fallbackAddr,
                    data: selector,
                }));
                if (addr !== _zeroAddress)
                    return addr;
            }
            catch (e) {
                if (e.toString().includes("revert"))
                    continue;
                throw e;
            }
        }
        return _zeroAddress;
    }
}
exports.EIP1967ProxyResolver = EIP1967ProxyResolver;
const diamondSelectors = [
    "0xcdffacc6",
    "0x0d741577",
];
class DiamondProxyResolver extends BaseProxyResolver {
    name = "DiamondProxy";
    storageSlot;
    readArrayLimit = 256;
    constructor(name, overrideStorageSlot) {
        super(name);
        this.storageSlot = overrideStorageSlot ?? exports.slots.DIAMOND_STORAGE;
    }
    async resolve(provider, address, selector) {
        if (!selector) {
            throw "DiamondProxy requires a selector to resolve to a specific facet";
        }
        else if (selector.startsWith("0x")) {
            selector = selector.slice(2);
        }
        const facetMappingSlot = (0, slots_js_1.joinSlot)([selector.padEnd(64, "0"), this.storageSlot]);
        const facet = await provider.getStorageAt(address, facetMappingSlot);
        const storageAddr = "0x" + facet.slice(facet.length - 40);
        if (storageAddr !== _zeroAddress) {
            return storageAddr;
        }
        for (const facetSelector of diamondSelectors) {
            try {
                const addr = addressFromPadded(await provider.call({
                    to: address,
                    data: facetSelector + selector.padEnd(64, "0"),
                }));
                if (addr !== _zeroAddress)
                    return addr;
            }
            catch (e) {
                if (e.toString().includes("revert"))
                    continue;
                throw e;
            }
        }
        return _zeroAddress;
    }
    async facets(provider, address, config) {
        let limit = config?.limit || 0;
        const storageStart = this.storageSlot;
        const facetsOffset = (0, slots_js_1.addSlotOffset)(storageStart, 2);
        const addressWidth = 20;
        let facets;
        try {
            facets = await (0, slots_js_1.readArray)(provider, address, facetsOffset, addressWidth, this.readArrayLimit);
        }
        catch (e) {
            if (e instanceof errors_js_1.StorageReadError)
                return {};
            throw e;
        }
        const selectorWidth = 4;
        const facetSelectors = {};
        const slot = (0, slots_js_1.addSlotOffset)(storageStart, 1);
        for (const f of facets) {
            const facet = addressFromPadded(f);
            const facetSelectorsSlot = (0, slots_js_1.joinSlot)([facet, slot]);
            try {
                const selectors = await (0, slots_js_1.readArray)(provider, address, facetSelectorsSlot, selectorWidth, this.readArrayLimit);
                facetSelectors[Address.checksum(facet)] = selectors.map(s => "0x" + s);
            }
            catch (e) {
                if (e instanceof errors_js_1.StorageReadError)
                    continue;
                throw e;
            }
            if (--limit === 0)
                break;
        }
        return facetSelectors;
    }
    async selectors(provider, address) {
        const f = await this.facets(provider, address);
        return Object.values(f).flat();
    }
}
exports.DiamondProxyResolver = DiamondProxyResolver;
class ZeppelinOSProxyResolver extends BaseProxyResolver {
    name = "ZeppelinOSProxy";
    async resolve(provider, address) {
        return addressFromPadded(await provider.getStorageAt(address, exports.slots.ZEPPELINOS_IMPL));
    }
}
exports.ZeppelinOSProxyResolver = ZeppelinOSProxyResolver;
class PROXIABLEProxyResolver extends BaseProxyResolver {
    name = "PROXIABLEProxy";
    async resolve(provider, address) {
        return addressFromPadded(await provider.getStorageAt(address, exports.slots.PROXIABLE));
    }
}
exports.PROXIABLEProxyResolver = PROXIABLEProxyResolver;
class MaticProxyResolver extends BaseProxyResolver {
    name = "MaticProxy";
    async resolve(provider, address) {
        return addressFromPadded(await provider.getStorageAt(address, exports.slots.MATIC_IMPL));
    }
}
exports.MaticProxyResolver = MaticProxyResolver;
class SequenceWalletProxyResolver extends BaseProxyResolver {
    name = "SequenceWalletProxy";
    async resolve(provider, address) {
        const slot = "0x" + BigInt(address).toString(16);
        return addressFromPadded(await provider.getStorageAt(address, slot));
    }
}
exports.SequenceWalletProxyResolver = SequenceWalletProxyResolver;
class LivepeerManagerProxyResolver extends BaseProxyResolver {
    name = "LivepeerManagerProxy";
    async resolve(provider, address) {
        const controller = addressFromWord(await provider.getStorageAt(address, 0));
        if (controller === _zeroAddress)
            return _zeroAddress;
        const targetContractId = wordFrom(await provider.getStorageAt(address, 1));
        const data = "0xe16c7d98" + targetContractId;
        return addressFromWord(await provider.call({ to: controller, data }));
    }
}
exports.LivepeerManagerProxyResolver = LivepeerManagerProxyResolver;
function wordFrom(data) {
    return (data.startsWith("0x") ? data.slice(2) : data).padStart(64, "0");
}
function addressFromWord(data) {
    return addressFromPadded(wordFrom(data));
}
exports.livepeerManagerProxySelectors = [
    "0xf77c4791",
    "0x92eefe9b",
    "0x51720b41",
];
class AragonAppProxyResolver extends BaseProxyResolver {
    name = "AragonAppProxy";
    async resolve(provider, address) {
        return addressFromWord(await provider.call({ to: address, data: exports.aragonAppProxyImplementationSelector }));
    }
}
exports.AragonAppProxyResolver = AragonAppProxyResolver;
exports.aragonAppProxyImplementationSelector = "0x5c60da1b";
class FixedProxyResolver extends BaseProxyResolver {
    name = "FixedProxy";
    resolvedAddress;
    constructor(name, resolvedAddress) {
        super(name);
        this.resolvedAddress = resolvedAddress;
    }
    async resolve(provider, address) {
        return this.resolvedAddress;
    }
}
exports.FixedProxyResolver = FixedProxyResolver;
;
exports.slots = {
    EIP1967_IMPL: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    EIP1967_BEACON: "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50",
    ZEPPELINOS_IMPL: "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3",
    PROXIABLE: "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7",
    GNOSIS_SAFE_SELECTOR: "0xa619486e00000000000000000000000000000000000000000000000000000000",
    DIAMOND_STORAGE: "0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131b",
    DIAMOND_STORAGE_1: "0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c",
    MATIC_IMPL: "0xbaab7dbf64751104133af04abc7d9979f0fda3b059a322a8333f533d3f32bf7f",
    ARAGON_KERNEL: "0x4172f0f7d2289153072b0a6ca36959e0cbe2efc3afe50fc81636caa96338137b",
};
exports.slotResolvers = {
    [exports.slots.EIP1967_IMPL]: new EIP1967ProxyResolver("EIP1967Proxy"),
    [exports.slots.EIP1967_BEACON]: new EIP1967ProxyResolver("EIP1967Proxy"),
    [exports.slots.ZEPPELINOS_IMPL]: new ZeppelinOSProxyResolver("ZeppelinOSProxy"),
    [exports.slots.PROXIABLE]: new PROXIABLEProxyResolver("PROXIABLE"),
    [exports.slots.GNOSIS_SAFE_SELECTOR]: new GnosisSafeProxyResolver("GnosisSafeProxy"),
    [exports.slots.DIAMOND_STORAGE]: new DiamondProxyResolver("DiamondProxy"),
    [exports.slots.DIAMOND_STORAGE_1]: new DiamondProxyResolver("DiamondProxy", exports.slots.DIAMOND_STORAGE_1),
    [exports.slots.MATIC_IMPL]: new MaticProxyResolver("MaticProxy"),
    [exports.slots.ARAGON_KERNEL]: new AragonAppProxyResolver("AragonAppProxy"),
    "0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131d": new DiamondProxyResolver("DiamondProxy"),
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbd": new EIP1967ProxyResolver("EIP1967Proxy"),
};
exports.slotPreimages = {
    "0x6d617469632e6e6574776f726b2e70726f78792e696d706c656d656e746174696f6e": exports.slotResolvers[exports.slots.MATIC_IMPL],
};
//# sourceMappingURL=proxies.js.map