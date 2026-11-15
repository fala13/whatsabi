/**
 * @module loaders
 * @example
 * Verified contract source code:
 * ```ts
 * const loader = whatsabi.loaders.defaultsWithEnv(env);
 * const result = await loader.getContract(address);
 * const sources = await result.getSources();
 *
 * for (const s of sources) {
 *   console.log(s.path, " -> ", s.content + "...");
 * }
 * ```
 *
 * @example
 * Combine loaders with custom settings behind a single interface, or use {@link defaultsWithEnv} as a shortcut for this.
 * ```ts
 * const loader = new whatsabi.loaders.MultiABILoader([
 *   new whatsabi.loaders.SourcifyABILoader({ chainId: 8453 }),
 *   new whatsabi.loaders.EtherscanV2ABILoader({
 *     apiKey: "...", // Replace the value with your API key
 *     chainId: 8453,
 *   }),
 * ]);
 * ```
 */
import { fetchJSON } from "./utils.js";
import * as errors from "./errors.js";
const emptyContractResult = {
    ok: false,
    abi: [],
    name: null,
    evmVersion: "",
    compilerVersion: "",
    runs: 0,
};
/** Load ABIs from multiple providers until a result is found. */
export class MultiABILoader {
    name = "MultiABILoader";
    loaders;
    /// Note: This callback is used to pull out which loader succeeded without modifying the return API.
    /// We can remove it once we switch to using getContract for autoload.
    /// @internal
    onLoad;
    constructor(loaders) {
        this.loaders = loaders;
    }
    async getContract(address) {
        const failures = [];
        for (const loader of this.loaders) {
            try {
                const r = await loader.getContract(address);
                if (r && r.abi.length > 0) {
                    if (this.onLoad)
                        this.onLoad(loader);
                    return r;
                }
            }
            catch (err) {
                // A 404 is an ordinary miss (contract not indexed by this
                // loader); anything else is a loader failure. Keep walking the
                // chain either way, so one degraded loader can't mask a
                // healthy loader behind it.
                if (err.cause?.status === 404)
                    continue;
                failures.push({ loader, error: err });
            }
        }
        if (failures.length > 0) {
            // No loader produced a result and at least one failed, so we
            // can't distinguish "unverified" from "unavailable". Surface the
            // failures rather than returning a false miss.
            throw new MultiABILoaderError("MultiABILoader getContract errors: " + failures.map(f => f.loader.name + ": " + f.error.message).join("; "), {
                context: { failures, address, loader: failures[0].loader },
                cause: failures[0].error,
            });
        }
        return emptyContractResult;
    }
    async loadABI(address) {
        const failures = [];
        for (const loader of this.loaders) {
            try {
                const r = await loader.loadABI(address);
                // Return the first non-empty result
                if (r.length > 0) {
                    if (this.onLoad)
                        this.onLoad(loader);
                    return r;
                }
            }
            catch (err) {
                // Same walk semantics as getContract above.
                if (err.cause?.status === 404)
                    continue;
                failures.push({ loader, error: err });
            }
        }
        if (failures.length > 0) {
            throw new MultiABILoaderError("MultiABILoader loadABI errors: " + failures.map(f => f.loader.name + ": " + f.error.message).join("; "), {
                context: { failures, address, loader: failures[0].loader },
                cause: failures[0].error,
            });
        }
        return [];
    }
}
export class MultiABILoaderError extends errors.LoaderError {
}
;
export class EtherscanABILoaderError extends errors.LoaderError {
}
;
/** Etherscan v2 API loader */
export class EtherscanV2ABILoader {
    name = "EtherscanV2ABILoader";
    apiKey;
    baseURL;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseURL = `https://api.etherscan.io/v2/api?chainid=${config?.chainId ?? 1}`;
    }
    /** Etherscan helper for converting the encoded SourceCode result arg to a decoded ContractSources. */
    #toContractSources(result) {
        if (!result.SourceCode.startsWith("{{")) {
            return [{ content: result.SourceCode }];
        }
        // Etherscan adds an extra {} to the encoded JSON
        const s = JSON.parse(result.SourceCode.slice(1, result.SourceCode.length - 1));
        // Flatten sources
        // { "sources": {"foo.sol": {"content": "..."}}}
        const sources = s.sources;
        return Object.entries(sources).map(([path, source]) => {
            return { path, content: source.content };
        });
    }
    async getContract(address) {
        const url = new URL(this.baseURL);
        const params = {
            module: "contract",
            action: "getsourcecode",
            address: address,
            ...(this.apiKey && { apikey: this.apiKey }),
        };
        // Using .set() to overwrite any default values that may be present in baseURL
        Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
        try {
            const r = await fetchJSON(url.toString());
            if (r.status === "0") {
                if (r.result === "Contract source code not verified")
                    return emptyContractResult;
                throw new Error(r.result); // This gets wrapped below
            }
            // Status 1 means success, but the result could still be empty
            if (r.result.length > 0 && r.result[0].ABI === "Contract source code not verified") {
                return emptyContractResult;
            }
            const result = r.result[0];
            return {
                abi: JSON.parse(result.ABI),
                name: result.ContractName,
                evmVersion: result.EVMVersion,
                compilerVersion: result.CompilerVersion,
                runs: result.Runs,
                getSources: async () => {
                    try {
                        return this.#toContractSources(result);
                    }
                    catch (err) {
                        throw new EtherscanABILoaderError("EtherscanABILoader getContract getSources error: " + err.message, {
                            context: { url, address },
                            cause: err,
                        });
                    }
                },
                ok: true,
                loader: this,
                loaderResult: result,
            };
        }
        catch (err) {
            throw new EtherscanABILoaderError("EtherscanABILoader getContract error: " + err.message, {
                context: { url, address },
                cause: err,
            });
        }
    }
    async loadABI(address) {
        const url = new URL(this.baseURL);
        const params = {
            module: "contract",
            action: "getabi",
            address: address,
            ...(this.apiKey && { apikey: this.apiKey }),
        };
        // Using .set() to overwrite any default values that may be present in baseURL
        Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
        try {
            const r = await fetchJSON(url.toString());
            if (r.status === "0") {
                if (r.result === "Contract source code not verified")
                    return [];
                throw new Error(r.result); // This gets wrapped below
            }
            return JSON.parse(r.result);
        }
        catch (err) {
            throw new EtherscanABILoaderError("EtherscanABILoader loadABI error: " + err.message, {
                context: { url, address },
                cause: err,
            });
        }
    }
}
/**
  * Alias to the EtherscanV2ABILoader
  */
export class EtherscanABILoader extends EtherscanV2ABILoader {
}
;
/**
  * EtherscanV1ABILoader
  * @deprecated v1 API is deprecated, use EtherscanV2ABILoader instead. This may be removed in a future release.
  */
export class EtherscanV1ABILoader extends EtherscanV2ABILoader {
    name = "EtherscanV1ABILoader";
    constructor(config) {
        if (config === undefined)
            config = {};
        super({ apiKey: config.apiKey ?? "" });
        this.baseURL = config.baseURL || "https://api.etherscan.io/api";
    }
}
;
function isSourcifyNotFound(error) {
    // Note: The v1 API returned strict CORS on a miss, so "Failed to fetch"
    // used to imply not-found. The v2 API serves proper CORS headers and a
    // real 404, so a network-level failure is a failure again: treating it as
    // a miss would let MultiABILoader report "unverified" while Sourcify was
    // merely unreachable.
    return error.status === 404;
}
// https://sourcify.dev/
export class SourcifyABILoader {
    name = "SourcifyABILoader";
    chainId;
    constructor(config) {
        this.chainId = config?.chainId ?? 1;
    }
    /** @deprecated Source paths from the API v2 are no longer prefixed, so stripping is unnecessary for new results. */
    static stripPathPrefix(path) {
        return path.replace(/^\/contracts\/(full|partial)_match\/\d*\/\w*\/(sources\/)?/, "");
    }
    #contractURL(address, fields) {
        const url = new URL(`https://sourcify.dev/server/v2/contract/${this.chainId}/${address}`);
        url.searchParams.set("fields", fields);
        return url;
    }
    async #loadSources(address) {
        const url = this.#contractURL(address, "sources");
        try {
            const result = await fetchJSON(url.toString());
            return Object.entries(result.sources ?? {}).map(([path, source]) => { return { path, content: source.content }; });
        }
        catch (err) {
            throw new SourcifyABILoaderError("SourcifyABILoader getSources error: " + err.message, {
                context: { address, url: url.toString() },
                cause: err,
            });
        }
    }
    async #loadContract(address) {
        const url = this.#contractURL(address, "abi,compilation,metadata");
        try {
            const result = await fetchJSON(url.toString());
            const settings = result.compilation?.compilerSettings;
            return {
                abi: result.abi ?? [],
                name: result.compilation?.name ?? null,
                evmVersion: settings?.evmVersion,
                compilerVersion: result.compilation?.compilerVersion,
                runs: settings?.optimizer?.runs,
                // Sources can be large, so they're fetched separately and only on demand
                getSources: () => this.#loadSources(address),
                ok: result.match === "match" || result.match === "exact_match",
                loader: this,
                loaderResult: result,
            };
        }
        catch (err) {
            if (isSourcifyNotFound(err))
                return emptyContractResult;
            throw new SourcifyABILoaderError("SourcifyABILoader load contract error: " + err.message, {
                context: { address, url: url.toString() },
                cause: err,
            });
        }
    }
    async getContract(address) {
        return this.#loadContract(address);
    }
    async loadABI(address) {
        const url = this.#contractURL(address, "abi");
        try {
            const result = await fetchJSON(url.toString());
            return result.abi ?? [];
        }
        catch (err) {
            if (isSourcifyNotFound(err))
                return [];
            throw new SourcifyABILoaderError("SourcifyABILoader loadABI error: " + err.message, {
                context: { address, url: url.toString() },
                cause: err,
            });
        }
    }
}
export class SourcifyABILoaderError extends errors.LoaderError {
}
;
/** Blockscout API loader: https://docs.blockscout.com/ */
export class BlockscoutABILoader {
    name = "BlockscoutABILoader";
    apiKey;
    baseURL;
    constructor(config) {
        if (config === undefined)
            config = {};
        this.apiKey = config.apiKey;
        // A chainId routes through the multichain gateway, which requires an
        // apiKey (or an x402 payment); the server enforces this. Some
        // "featured" chains (e.g. Base) also require a paid plan and respond
        // with 402 to free-tier keys. An explicit baseURL wins over chainId.
        this.baseURL = config.baseURL ||
            (config.chainId !== undefined
                ? `https://api.blockscout.com/${config.chainId}/api`
                : "https://eth.blockscout.com/api");
    }
    /** Blockscout helper for converting the result arg to a decoded ContractSources. */
    #toContractSources(result) {
        const sources = [];
        if (result.source_code) {
            sources.push({
                path: result.file_path,
                content: result.source_code,
            });
        }
        result.additional_sources?.forEach((source) => {
            sources.push({
                path: source.file_path,
                content: source.source_code,
            });
        });
        return sources;
    }
    async #loadContract(address) {
        let url = this.baseURL + `/v2/smart-contracts/${address}`;
        if (this.apiKey)
            url += "?apikey=" + this.apiKey;
        try {
            let response = await fetch(url);
            // The gateway rate-limits per key; back off and retry a few times
            // before giving up, respecting a sane Retry-After when present.
            for (let attempt = 1; response.status === 429 && attempt <= 3; attempt++) {
                const retryAfter = Number(response.headers.get("retry-after"));
                const seconds = (retryAfter >= 0 && retryAfter <= 10) ? retryAfter : attempt;
                await new Promise(resolve => setTimeout(resolve, seconds * 1000));
                response = await fetch(url);
            }
            if (response.status === 404)
                return emptyContractResult;
            const responseText = await response.text();
            let responseBody = responseText;
            try {
                responseBody = JSON.parse(responseText);
            }
            catch (err) {
                if (response.ok) {
                    throw new BlockscoutABILoaderError("BlockscoutABILoader load contract returned invalid JSON", {
                        context: {
                            url,
                            address,
                            status: response.status,
                            response: responseText,
                        },
                        cause: err,
                    });
                }
            }
            const status = [response.status, response.statusText]
                .filter(Boolean)
                .join(" ");
            if (!response.ok) {
                const responseDescription = typeof responseBody === "string"
                    ? responseBody
                    : JSON.stringify(responseBody);
                throw new BlockscoutABILoaderError(`BlockscoutABILoader load contract response error: ${status}: ${responseDescription}`, {
                    context: {
                        url,
                        address,
                        status: response.status,
                        response: responseBody,
                    },
                });
            }
            if (!responseBody ||
                typeof responseBody !== "object" ||
                Array.isArray(responseBody)) {
                throw new BlockscoutABILoaderError("BlockscoutABILoader load contract returned invalid JSON", {
                    context: {
                        url,
                        address,
                        status: response.status,
                        response: responseBody,
                    },
                });
            }
            const result = responseBody;
            if (!result.abi)
                return emptyContractResult;
            // Blockscout can return an ABI without optional source or compiler
            // metadata; ContractResult models those fields as optional, so a
            // usable ABI is enough to consider the contract found.
            return {
                abi: result.abi,
                name: result.name ?? null,
                evmVersion: result.evm_version,
                compilerVersion: result.compiler_version,
                runs: result.optimization_runs ?? undefined,
                getSources: async () => {
                    try {
                        return this.#toContractSources(result);
                    }
                    catch (err) {
                        throw new BlockscoutABILoaderError("BlockscoutABILoader load contract getSources error: " +
                            err.message, {
                            context: { url, address },
                            cause: err,
                        });
                    }
                },
                ok: true,
                loader: this,
                loaderResult: result,
            };
        }
        catch (err) {
            if (err instanceof BlockscoutABILoaderError)
                throw err;
            throw new BlockscoutABILoaderError("BlockscoutABILoader load contract error: " + err.message, {
                context: { url, address },
                cause: err,
            });
        }
    }
    async getContract(address) {
        return this.#loadContract(address);
    }
    async loadABI(address) {
        return (await this.#loadContract(address)).abi;
    }
}
export class BlockscoutABILoaderError extends errors.LoaderError {
}
function isAnyABINotFound(error) {
    return (error.status === 404 ||
        // "ABI not found" or "Not found"
        /not found/i.test(error.message));
}
/** https://anyabi.xyz/ */
export class AnyABILoader {
    name = "AnyABILoader";
    chainId;
    constructor(config) {
        this.chainId = config?.chainId ?? 1;
    }
    async #fetchAnyABI(address) {
        const url = "https://anyabi.xyz/api/get-abi/" + this.chainId + "/" + address;
        try {
            const r = await fetchJSON(url);
            const { abi, name } = r;
            return {
                abi: abi,
                name: name,
                ok: true,
                loader: this,
                loaderResult: r,
            };
        }
        catch (err) {
            if (isAnyABINotFound(err))
                return emptyContractResult;
            throw new AnyABILoaderError("AnyABILoader load contract error: " + err.message, {
                context: { url },
                cause: err,
            });
        }
    }
    async getContract(address) {
        {
            const r = await this.#fetchAnyABI(address);
            if (r.ok)
                return r;
        }
        return emptyContractResult;
    }
    async loadABI(address) {
        {
            const r = await this.#fetchAnyABI(address);
            if (r.ok)
                return r.abi;
        }
        return [];
    }
}
export class AnyABILoaderError extends errors.LoaderError {
}
;
// Load signatures from multiple providers until a result is found.
export class MultiSignatureLookup {
    lookups;
    constructor(lookups) {
        this.lookups = lookups;
    }
    async loadFunctions(selector) {
        for (const lookup of this.lookups) {
            const r = await lookup.loadFunctions(selector);
            // Return the first non-empty result
            if (r.length > 0)
                return r;
        }
        return [];
    }
    async loadEvents(hash) {
        for (const lookup of this.lookups) {
            const r = await lookup.loadEvents(hash);
            // Return the first non-empty result
            if (r.length > 0)
                return r;
        }
        return [];
    }
}
/** https://www.4byte.directory/ */
export class FourByteSignatureLookup {
    async load(url) {
        try {
            const r = await fetchJSON(url);
            if (r.results === undefined)
                return [];
            return r.results.map((r) => { return r.text_signature; });
        }
        catch (err) {
            if (err.status === 404)
                return [];
            throw new FourByteSignatureLookupError("FourByteSignatureLookup load error: " + err.message, {
                context: { url },
                cause: err,
            });
        }
    }
    async loadFunctions(selector) {
        // Note: Could also lookup directly on Github, but not sure that's a good idea
        return this.load("https://www.4byte.directory/api/v1/signatures/?hex_signature=" + selector);
    }
    async loadEvents(hash) {
        return this.load("https://www.4byte.directory/api/v1/event-signatures/?hex_signature=" + hash);
    }
}
export class FourByteSignatureLookupError extends errors.LoaderError {
}
;
/**
 * https://openchain.xyz/
 * Formerly: https://sig.eth.samczsun.com/
 */
export class OpenChainSignatureLookup {
    async load(url) {
        try {
            const r = await fetchJSON(url);
            if (!r.ok)
                throw new Error("OpenChain API bad response: " + JSON.stringify(r));
            return r;
        }
        catch (err) {
            if (err.status === 404)
                return [];
            throw new OpenChainSignatureLookupError("OpenChainSignatureLookup load error: " + err.message, {
                context: { url },
                cause: err,
            });
        }
    }
    async loadFunctions(selector) {
        const r = await this.load("https://api.openchain.xyz/signature-database/v1/lookup?function=" + selector);
        return (r.result.function[selector] || []).map((item) => item.name);
    }
    async loadEvents(hash) {
        const r = await this.load("https://api.openchain.xyz/signature-database/v1/lookup?event=" + hash);
        return (r.result.event[hash] || []).map((item) => item.name);
    }
}
export class OpenChainSignatureLookupError extends errors.LoaderError {
}
;
export class SamczunSignatureLookup extends OpenChainSignatureLookup {
}
const defaultEnv = globalThis.process?.env ?? {};
export const defaultABILoader = new MultiABILoader([new SourcifyABILoader(), new EtherscanV2ABILoader({ apiKey: defaultEnv?.ETHERSCAN_API_KEY })]);
export const defaultSignatureLookup = new MultiSignatureLookup([new OpenChainSignatureLookup(), new FourByteSignatureLookup()]);
/**
 * Return params to use with whatsabi.autoload(...)
 *
 * @example
 * ```ts
 * whatsabi.autoload(address, {provider, ...whatsabi.loaders.defaultsWithEnv(process.env)})
 * ```
 *
 * @example
 * ```ts
 * whatsabi.autoload(address, {
 *     provider,
 *     ...whatsabi.loaders.defaultsWithEnv({
 *         // Use this CHAIN_ID for all loaders that support specifying a chain
 *         CHAIN_ID: 8453,
 *         ETHERSCAN_API_KEY: "MYSECRETAPIKEY",
 *     }),
 * })
 * ```
 *
 * @example
 * ```ts
 * whatsabi.autoload(address, {
 *     provider,
 *     ...whatsabi.loaders.defaultsWithEnv({
 *         // Override specific chain IDs per-loader
 *         SOURCIFY_CHAIN_ID: 42161,
 *         ETHERSCAN_CHAIN_ID: 8453,
 *         ETHERSCAN_API_KEY: "MYSECRETAPIKEY",
 *     }),
 * })
 * ```
 *
 * @example
 * Can be useful for stand-alone usage too!
 * ```ts
 * const { abiLoader, signatureLookup } = whatsabi.loaders.defaultsWithEnv(env);
 * ```
 */
export function defaultsWithEnv(env) {
    return {
        abiLoader: new MultiABILoader([
            new SourcifyABILoader({
                chainId: Number(env.SOURCIFY_CHAIN_ID ?? env.CHAIN_ID) || undefined,
            }),
            new EtherscanV2ABILoader({
                apiKey: env.ETHERSCAN_API_KEY,
                chainId: Number(env.ETHERSCAN_CHAIN_ID ?? env.CHAIN_ID) || undefined,
            }),
        ]),
        signatureLookup: new MultiSignatureLookup([
            new OpenChainSignatureLookup(),
            new FourByteSignatureLookup(),
        ]),
    };
}
//# sourceMappingURL=loaders.js.map