import type { StorageProvider, CallProvider } from "./providers.js";
export interface ProxyResolver {
    readonly name: string;
    resolve(provider: StorageProvider | CallProvider, address: string, selector?: string): Promise<string>;
    toString(): string;
}
export declare class BaseProxyResolver {
    name: string;
    constructor(name?: string);
    toString(): string;
}
export declare class GnosisSafeProxyResolver extends BaseProxyResolver implements ProxyResolver {
    resolve(provider: StorageProvider, address: string): Promise<string>;
}
export declare class LegacyUpgradeableProxyResolver extends BaseProxyResolver implements ProxyResolver {
    resolve(provider: StorageProvider, address: string): Promise<string>;
}
export declare class EIP1967ProxyResolver extends BaseProxyResolver implements ProxyResolver {
    name: string;
    resolve(provider: StorageProvider & CallProvider, address: string): Promise<string>;
}
export declare class DiamondProxyResolver extends BaseProxyResolver implements ProxyResolver {
    name: string;
    readonly storageSlot: string;
    readArrayLimit: number;
    constructor(name: string, overrideStorageSlot?: string);
    resolve(provider: StorageProvider & CallProvider, address: string, selector: string): Promise<string>;
    facets(provider: StorageProvider, address: string, config?: {
        limit: number;
    }): Promise<Record<string, string[]>>;
    selectors(provider: StorageProvider, address: string): Promise<string[]>;
}
export declare class ZeppelinOSProxyResolver extends BaseProxyResolver implements ProxyResolver {
    name: string;
    resolve(provider: StorageProvider, address: string): Promise<string>;
}
export declare class PROXIABLEProxyResolver extends BaseProxyResolver implements ProxyResolver {
    name: string;
    resolve(provider: StorageProvider, address: string): Promise<string>;
}
export declare class MaticProxyResolver extends BaseProxyResolver implements ProxyResolver {
    name: string;
    resolve(provider: StorageProvider, address: string): Promise<string>;
}
export declare class SequenceWalletProxyResolver extends BaseProxyResolver implements ProxyResolver {
    name: string;
    resolve(provider: StorageProvider, address: string): Promise<string>;
}
export declare class LivepeerManagerProxyResolver extends BaseProxyResolver implements ProxyResolver {
    name: string;
    resolve(provider: StorageProvider & CallProvider, address: string): Promise<string>;
}
export declare const livepeerManagerProxySelectors: string[];
export declare class AragonAppProxyResolver extends BaseProxyResolver implements ProxyResolver {
    name: string;
    resolve(provider: CallProvider, address: string): Promise<string>;
}
export declare const aragonAppProxyImplementationSelector = "0x5c60da1b";
export declare class FixedProxyResolver extends BaseProxyResolver implements ProxyResolver {
    name: string;
    readonly resolvedAddress: string;
    constructor(name: string, resolvedAddress: string);
    resolve(provider: StorageProvider, address: string): Promise<string>;
}
export declare const slots: Record<string, string>;
export declare const slotResolvers: Record<string, ProxyResolver>;
/**
 * Slot pre-images to look for in the data segment, mapped to the resolver for
 * the slot they hash to.
 *
 * Normally a proxy embeds its slot as a PUSH32 constant, and we match that value
 * directly via {@link slotResolvers}. Some proxies instead keep the pre-image
 * string in their data segment and hash it at runtime, so the slot value never
 * appears in the bytecode at all and there is nothing for that scan to match.
 *
 * This happens when the source writes the slot as an expression rather than as a
 * hex literal, and the compiler does not fold it. Polygon's UpgradableProxy is
 * one such contract: it declares the slot as
 * `keccak256("matic.network.proxy.implementation")` and solc 0.6.6 inlines that
 * expression at each use site, so the string ships and the hash is computed on
 * every call.
 *
 * Keys are the hex encoding of the ASCII pre-image, so that the data segment
 * scan in disasm can match them the same way it matches slot values.
 */
export declare const slotPreimages: Record<string, ProxyResolver>;
//# sourceMappingURL=proxies.d.ts.map