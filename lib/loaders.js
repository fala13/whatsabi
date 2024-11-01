import { addressWithChecksum, fetchJSON } from "./utils.js";
const emptyContractResult = {
    ok: false,
    abi: [],
    name: null,
    evmVersion: "",
    compilerVersion: "",
    runs: 0,
};
// Load ABIs from multiple providers until a result is found.
export class MultiABILoader {
    loaders;
    constructor(loaders) {
        this.loaders = loaders;
    }
    async getContract(address) {
        for (const loader of this.loaders) {
            try {
                const r = await loader.getContract(address);
                if (r && r.abi.length > 0)
                    return Promise.resolve(r);
            }
            catch (error) {
                if (error.status === 404)
                    continue;
                throw error;
            }
        }
        return emptyContractResult;
    }
    async loadABI(address) {
        for (const loader of this.loaders) {
            const r = await loader.loadABI(address);
            // Return the first non-empty result
            if (r.length > 0)
                return Promise.resolve(r);
        }
        return Promise.resolve([]);
    }
}
export class EtherscanABILoader {
    apiKey;
    baseURL;
    constructor(config) {
        if (config === undefined)
            config = {};
        this.apiKey = config.apiKey;
        this.baseURL = config.baseURL || "https://api.etherscan.io/api";
    }
    async getContract(address) {
        let url = this.baseURL + '?module=contract&action=getsourcecode&address=' + address;
        if (this.apiKey)
            url += "&apikey=" + this.apiKey;
        const r = await fetchJSON(url);
        if (r.status === "0") {
            if (r.result === "Contract source code not verified")
                return emptyContractResult;
            throw new Error("Etherscan error: " + r.result);
        }
        const result = r.result[0];
        return {
            abi: JSON.parse(result.ABI),
            name: result.ContractName,
            evmVersion: result.EVMVersion,
            compilerVersion: result.CompilerVersion,
            runs: result.Runs,
            ok: true,
        };
    }
    async loadABI(address) {
        let url = this.baseURL + '?module=contract&action=getabi&address=' + address;
        if (this.apiKey)
            url += "&apikey=" + this.apiKey;
        const r = await fetchJSON(url);
        if (r.status === "0") {
            if (r.result === "Contract source code not verified")
                return [];
            throw new Error("Etherscan error: " + r.result);
        }
        return JSON.parse(r.result);
    }
}
function isSourcifyNotFound(error) {
    return (
    // Sourcify returns strict CORS only if there is no result -_-
    error.message === "Failed to fetch" ||
        error.status === 404);
}
// https://sourcify.dev/
export class SourcifyABILoader {
    chainId;
    constructor(config) {
        this.chainId = config?.chainId ?? 1;
    }
    async getContract(address) {
        // Sourcify doesn't like it when the address is not checksummed
        address = addressWithChecksum(address);
        try {
            // Full match index includes verification settings that matches exactly
            const r = await fetchJSON("https://repo.sourcify.dev/contracts/full_match/" + this.chainId + "/" + address + "/metadata.json");
            return {
                abi: r.output.abi,
                name: r.output.devdoc?.title ?? null, // Sourcify includes a title from the Natspec comments
                evmVersion: r.settings.evmVersion,
                compilerVersion: r.compiler.version,
                runs: r.settings.optimizer.runs,
                ok: true,
            };
        }
        catch (error) {
            if (!isSourcifyNotFound(error))
                throw error;
        }
        try {
            // Partial match index is for verified contracts whose settings didn't match exactly
            const r = await fetchJSON("https://repo.sourcify.dev/contracts/partial_match/" + this.chainId + "/" + address + "/metadata.json");
            return {
                abi: r.output.abi,
                name: r.output.devdoc?.title ?? null, // Sourcify includes a title from the Natspec comments
                evmVersion: r.settings.evmVersion,
                compilerVersion: r.compiler.version,
                runs: r.settings.optimizer.runs,
                ok: true,
            };
        }
        catch (error) {
            if (!isSourcifyNotFound(error))
                throw error;
        }
        return emptyContractResult;
    }
    async loadABI(address) {
        // Sourcify doesn't like it when the address is not checksummed
        address = addressWithChecksum(address);
        try {
            // Full match index includes verification settings that matches exactly
            return (await fetchJSON("https://repo.sourcify.dev/contracts/full_match/" + this.chainId + "/" + address + "/metadata.json")).output.abi;
        }
        catch (error) {
            if (!isSourcifyNotFound(error))
                throw error;
        }
        try {
            // Partial match index is for verified contracts whose settings didn't match exactly
            return (await fetchJSON("https://repo.sourcify.dev/contracts/partial_match/" + this.chainId + "/" + address + "/metadata.json")).output.abi;
        }
        catch (error) {
            if (!isSourcifyNotFound(error))
                throw error;
        }
        return [];
    }
}
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
                return Promise.resolve(r);
        }
        return Promise.resolve([]);
    }
    async loadEvents(hash) {
        for (const lookup of this.lookups) {
            const r = await lookup.loadEvents(hash);
            // Return the first non-empty result
            if (r.length > 0)
                return Promise.resolve(r);
        }
        return Promise.resolve([]);
    }
}
// https://www.4byte.directory/
export class FourByteSignatureLookup {
    async load(url) {
        try {
            const r = await fetchJSON(url);
            if (r.results === undefined)
                return [];
            return r.results.map((r) => { return r.text_signature; });
        }
        catch (error) {
            if (error.status === 404)
                return [];
            throw error;
        }
    }
    async loadFunctions(selector) {
        // TODO: Use github lookup?
        return this.load("https://www.4byte.directory/api/v1/signatures/?hex_signature=" + selector);
    }
    async loadEvents(hash) {
        return this.load("https://www.4byte.directory/api/v1/event-signatures/?hex_signature=" + hash);
    }
}
// openchain.xyz
// Formerly: https://sig.eth.samczsun.com/
export class OpenChainSignatureLookup {
    async load(url) {
        try {
            const r = await fetchJSON(url);
            if (!r.ok)
                throw new Error("OpenChain API bad response: " + JSON.stringify(r));
            return r;
        }
        catch (error) {
            if (error.status === 404)
                return [];
            throw error;
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
export class SamczunSignatureLookup extends OpenChainSignatureLookup {
}
export const defaultABILoader = new MultiABILoader([new SourcifyABILoader(), new EtherscanABILoader()]);
export const defaultSignatureLookup = new MultiSignatureLookup([new OpenChainSignatureLookup(), new FourByteSignatureLookup()]);
/** @deprecated Use defaultsWithEnv instead, this function is outdated and will be removed soon. */
export function defaultsWithAPIKeys(apiKeys) {
    return defaultsWithEnv(apiKeys);
}
/**
 * Return params to use with whatsabi.autoload(...)
 *
 * @example
 * ```ts
 * whatsabi.autoload(address, {provider, ...defaultsWithEnv(process.env)})
 * ```
 *
 * @example
 * ```ts
 * whatsabi.autoload(address, {
 *   provider,
 *   ...defaultsWithEnv({
 *     SOURCIFY_CHAIN_ID: 42161,
 *     ETHERSCAN_BASE_URL: "https://api.arbiscan.io/api",
 *     ETHERSCAN_API_KEY: "MYSECRETAPIKEY",
 *   }),
 * })
 * ```
 */
export function defaultsWithEnv(env) {
    return {
        abiLoader: new MultiABILoader([
            new SourcifyABILoader({ chainId: env.SOURCIFY_CHAIN_ID && Number(env.SOURCIFY_CHAIN_ID) || undefined }),
            new EtherscanABILoader({ apiKey: env.ETHERSCAN_API_KEY, baseURL: env.ETHERSCAN_BASE_URL }),
        ]),
        signatureLookup: new MultiSignatureLookup([
            new OpenChainSignatureLookup(),
            new FourByteSignatureLookup(),
        ]),
    };
}
//# sourceMappingURL=loaders.js.map