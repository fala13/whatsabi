"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cached_test = exports.online_test = void 0;
exports.describe_cached = describe_cached;
var vitest_1 = require("vitest");
var ethers_1 = require("ethers");
var viem_1 = require("viem");
var web3_1 = require("web3");
var filecache_1 = require("../internal/filecache");
var types_js_1 = require("../types.js");
var env = {
    INFURA_API_KEY: process.env.INFURA_API_KEY,
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
    PROVIDER: process.env.PROVIDER,
    PROVIDER_RPC_URL: process.env.PROVIDER_RPC_URL,
};
var DEFAULT_PUBLIC_RPC = "https://ethereum-rpc.publicnode.com";
var provider = (0, types_js_1.CompatibleProvider)(function () {
    var rpc_url = env.PROVIDER_RPC_URL;
    if (env.INFURA_API_KEY) {
        rpc_url = "https://mainnet.infura.io/v3/" + env.INFURA_API_KEY;
    }
    if (env.PROVIDER === "viem") {
        return (0, viem_1.createPublicClient)({
            transport: (0, viem_1.http)(rpc_url !== null && rpc_url !== void 0 ? rpc_url : DEFAULT_PUBLIC_RPC),
        });
    }
    if (env.PROVIDER === "web3") {
        return new web3_1.Web3(rpc_url !== null && rpc_url !== void 0 ? rpc_url : DEFAULT_PUBLIC_RPC);
    }
    if (!env.PROVIDER || env.PROVIDER === "ethers") {
        if (env.PROVIDER_RPC_URL)
            return new ethers_1.ethers.JsonRpcProvider(env.PROVIDER_RPC_URL);
        if (env.INFURA_API_KEY)
            return new ethers_1.ethers.InfuraProvider("homestead", env.INFURA_API_KEY);
        return new ethers_1.ethers.JsonRpcProvider(DEFAULT_PUBLIC_RPC);
    }
    throw new Error("Unknown PROVIDER: " + env.PROVIDER);
}());
function testerWithContext(tester, context) {
    return function (name, fn, timeout) { return tester(name, function () { return fn(context); }, timeout); };
}
function describe_cached(d, fn) {
    return (0, vitest_1.describe)(d, function () { return fn({ provider: provider, env: env, withCache: filecache_1.withCache }); });
}
// TODO: Port this to context-aware wrapper
exports.online_test = testerWithContext(process.env["ONLINE"] ? vitest_1.test : vitest_1.test.skip, { provider: provider, env: env });
exports.cached_test = testerWithContext(!process.env["SKIP_CACHED"] ? vitest_1.test : vitest_1.test.skip, { provider: provider, env: env, withCache: filecache_1.withCache });
if (process.env["ONLINE"] === undefined) {
    console.log("Skipping online tests. Set ONLINE env to run them.");
}
