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
exports.defaultSignatureLookup = exports.defaultABILoader = exports.SamczunSignatureLookup = exports.OpenChainSignatureLookupError = exports.OpenChainSignatureLookup = exports.FourByteSignatureLookupError = exports.FourByteSignatureLookup = exports.MultiSignatureLookup = exports.AnyABILoaderError = exports.AnyABILoader = exports.BlockscoutABILoaderError = exports.BlockscoutABILoader = exports.SourcifyABILoaderError = exports.SourcifyABILoader = exports.EtherscanV1ABILoader = exports.EtherscanABILoader = exports.EtherscanV2ABILoader = exports.EtherscanABILoaderError = exports.MultiABILoaderError = exports.MultiABILoader = void 0;
exports.defaultsWithEnv = defaultsWithEnv;
const utils_js_1 = require("./utils.js");
const errors = __importStar(require("./errors.js"));
const emptyContractResult = {
    ok: false,
    abi: [],
    name: null,
    evmVersion: "",
    compilerVersion: "",
    runs: 0,
};
class MultiABILoader {
    name = "MultiABILoader";
    loaders;
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
                if (err.cause?.status === 404)
                    continue;
                failures.push({ loader, error: err });
            }
        }
        if (failures.length > 0) {
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
                if (r.length > 0) {
                    if (this.onLoad)
                        this.onLoad(loader);
                    return r;
                }
            }
            catch (err) {
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
exports.MultiABILoader = MultiABILoader;
class MultiABILoaderError extends errors.LoaderError {
}
exports.MultiABILoaderError = MultiABILoaderError;
;
class EtherscanABILoaderError extends errors.LoaderError {
}
exports.EtherscanABILoaderError = EtherscanABILoaderError;
;
class EtherscanV2ABILoader {
    name = "EtherscanV2ABILoader";
    apiKey;
    baseURL;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseURL = `https://api.etherscan.io/v2/api?chainid=${config?.chainId ?? 1}`;
    }
    #toContractSources(result) {
        if (!result.SourceCode.startsWith("{{")) {
            return [{ content: result.SourceCode }];
        }
        const s = JSON.parse(result.SourceCode.slice(1, result.SourceCode.length - 1));
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
        Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
        try {
            const r = await (0, utils_js_1.fetchJSON)(url.toString());
            if (r.status === "0") {
                if (r.result === "Contract source code not verified")
                    return emptyContractResult;
                throw new Error(r.result);
            }
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
        Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
        try {
            const r = await (0, utils_js_1.fetchJSON)(url.toString());
            if (r.status === "0") {
                if (r.result === "Contract source code not verified")
                    return [];
                throw new Error(r.result);
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
exports.EtherscanV2ABILoader = EtherscanV2ABILoader;
class EtherscanABILoader extends EtherscanV2ABILoader {
}
exports.EtherscanABILoader = EtherscanABILoader;
;
class EtherscanV1ABILoader extends EtherscanV2ABILoader {
    name = "EtherscanV1ABILoader";
    constructor(config) {
        if (config === undefined)
            config = {};
        super({ apiKey: config.apiKey ?? "" });
        this.baseURL = config.baseURL || "https://api.etherscan.io/api";
    }
}
exports.EtherscanV1ABILoader = EtherscanV1ABILoader;
;
function isSourcifyNotFound(error) {
    return error.status === 404;
}
class SourcifyABILoader {
    name = "SourcifyABILoader";
    chainId;
    constructor(config) {
        this.chainId = config?.chainId ?? 1;
    }
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
            const result = await (0, utils_js_1.fetchJSON)(url.toString());
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
            const result = await (0, utils_js_1.fetchJSON)(url.toString());
            const settings = result.compilation?.compilerSettings;
            return {
                abi: result.abi ?? [],
                name: result.compilation?.name ?? null,
                evmVersion: settings?.evmVersion,
                compilerVersion: result.compilation?.compilerVersion,
                runs: settings?.optimizer?.runs,
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
            const result = await (0, utils_js_1.fetchJSON)(url.toString());
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
exports.SourcifyABILoader = SourcifyABILoader;
class SourcifyABILoaderError extends errors.LoaderError {
}
exports.SourcifyABILoaderError = SourcifyABILoaderError;
;
class BlockscoutABILoader {
    name = "BlockscoutABILoader";
    apiKey;
    baseURL;
    constructor(config) {
        if (config === undefined)
            config = {};
        this.apiKey = config.apiKey;
        this.baseURL = config.baseURL ||
            (config.chainId !== undefined
                ? `https://api.blockscout.com/${config.chainId}/api`
                : "https://eth.blockscout.com/api");
    }
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
            const response = await fetch(url);
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
exports.BlockscoutABILoader = BlockscoutABILoader;
class BlockscoutABILoaderError extends errors.LoaderError {
}
exports.BlockscoutABILoaderError = BlockscoutABILoaderError;
function isAnyABINotFound(error) {
    return (error.status === 404 ||
        /not found/i.test(error.message));
}
class AnyABILoader {
    name = "AnyABILoader";
    chainId;
    constructor(config) {
        this.chainId = config?.chainId ?? 1;
    }
    async #fetchAnyABI(address) {
        const url = "https://anyabi.xyz/api/get-abi/" + this.chainId + "/" + address;
        try {
            const r = await (0, utils_js_1.fetchJSON)(url);
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
exports.AnyABILoader = AnyABILoader;
class AnyABILoaderError extends errors.LoaderError {
}
exports.AnyABILoaderError = AnyABILoaderError;
;
class MultiSignatureLookup {
    lookups;
    constructor(lookups) {
        this.lookups = lookups;
    }
    async loadFunctions(selector) {
        for (const lookup of this.lookups) {
            const r = await lookup.loadFunctions(selector);
            if (r.length > 0)
                return r;
        }
        return [];
    }
    async loadEvents(hash) {
        for (const lookup of this.lookups) {
            const r = await lookup.loadEvents(hash);
            if (r.length > 0)
                return r;
        }
        return [];
    }
}
exports.MultiSignatureLookup = MultiSignatureLookup;
class FourByteSignatureLookup {
    async load(url) {
        try {
            const r = await (0, utils_js_1.fetchJSON)(url);
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
        return this.load("https://www.4byte.directory/api/v1/signatures/?hex_signature=" + selector);
    }
    async loadEvents(hash) {
        return this.load("https://www.4byte.directory/api/v1/event-signatures/?hex_signature=" + hash);
    }
}
exports.FourByteSignatureLookup = FourByteSignatureLookup;
class FourByteSignatureLookupError extends errors.LoaderError {
}
exports.FourByteSignatureLookupError = FourByteSignatureLookupError;
;
class OpenChainSignatureLookup {
    async load(url) {
        try {
            const r = await (0, utils_js_1.fetchJSON)(url);
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
exports.OpenChainSignatureLookup = OpenChainSignatureLookup;
class OpenChainSignatureLookupError extends errors.LoaderError {
}
exports.OpenChainSignatureLookupError = OpenChainSignatureLookupError;
;
class SamczunSignatureLookup extends OpenChainSignatureLookup {
}
exports.SamczunSignatureLookup = SamczunSignatureLookup;
const defaultEnv = globalThis.process?.env ?? {};
exports.defaultABILoader = new MultiABILoader([new SourcifyABILoader(), new EtherscanV2ABILoader({ apiKey: defaultEnv?.ETHERSCAN_API_KEY })]);
exports.defaultSignatureLookup = new MultiSignatureLookup([new OpenChainSignatureLookup(), new FourByteSignatureLookup()]);
function defaultsWithEnv(env) {
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