import * as errors from "./errors.js";
export interface StorageProvider {
    getStorageAt(address: string, slot: number | string, block?: BlockTagOrNumber): Promise<string>;
}
export interface CallProvider {
    call(transaction: {
        to: string;
        data: string;
    }, block?: BlockTagOrNumber): Promise<string>;
}
export interface CodeProvider {
    getCode(address: string, block?: BlockTagOrNumber): Promise<string>;
}
export interface ENSProvider {
    getAddress(name: string): Promise<string>;
}
export interface Provider extends StorageProvider, CallProvider, CodeProvider, ENSProvider {
}
export interface AnyProvider {
}
export type BlockTagOrNumber = 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized' | number | bigint;
export declare function CompatibleProvider(provider: any): Provider;
/**
 * Wrap an existing provider into one that will return a fixed getCode result for items defined in codeCache.
 * The cache is treated as read-only, it will not be updated. Mainly used to avoid an extra RPC call when we already have the bytcode.
 *
 * For more advanced behaviours, consider copying this code and modifying it to your needs.
 *
 * @param provider - Any existing provider
 * @param codeCache - Object containing address => code mappings
 * @returns {Provider} - Provider that will return a fixed getCode result for items defined in codeCache.
 * @example
 * ```ts
 * const address = "0x0000000000000000000000000000000000000001";
 * const bytecode = "0x6001600101"
 * const cachedProvider = WithCachedCode(provider, {
 *   [address]: bytecode,
 * });
 * const code = await cachedProvider.getCode(address);
 * console.log(code); // "0x6001600101"
 * ```
 */
export declare function WithCachedCode(provider: AnyProvider, codeCache: Record<string, string>): Provider;
/**
 * Wrap an existing Provider into one that will always use a specified
 * blockTag for requests.
 *
 * This helper is to avoid plumbing the blockTag throughout the whatsabi stack,
 * and because it's more ergonomic to use the same blockTag consistently across
 * a given provider.
 *
 * @param provider - An existing Provider
 * @param blockNumber - Block tag or number to use for all requests
 * @returns {Provider} - Provider that will use the specified blockTag for all requests.
 * @example
 * ```ts
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * const client = createPublicClient({ chain: mainnet, transport: http() })
 * const blockNumber = await client.getBlockNumber() // or "latest", "earliest", etc.
 * const blockProvider = whatsabi.providers.WithBlockNumber(client, blockNumber);
 * const r = await whatsabi.autoload(address, { provider: blockProvider });
 */
export declare function WithBlockNumber(provider: Provider, blockNumber: BlockTagOrNumber): Provider;
export declare class MissingENSProviderError extends errors.ProviderError {
}
export declare class Web3ProviderError extends errors.ProviderError {
}
//# sourceMappingURL=providers.d.ts.map