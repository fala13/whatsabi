#!/usr/bin/env -S tsx
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const proxies_js_1 = require("./proxies.js");
const disasm_js_1 = require("./disasm.js");
const opcodes_js_1 = require("./opcodes.js");
const providers_js_1 = require("./providers.js");
async function main() {
    const endpoint = process.argv[3];
    const rawProvider = endpoint?.startsWith("ws")
        ? new ethers_1.ethers.WebSocketProvider(endpoint)
        : endpoint?.startsWith("http")
            ? new ethers_1.ethers.JsonRpcProvider(endpoint)
            : new ethers_1.ethers.IpcSocketProvider(endpoint);
    const provider = (0, providers_js_1.CompatibleProvider)(rawProvider);
    const address = process.env["ADDRESS"] || process.argv[2];
    const selector = "";
    const code = process.argv[4];
    const program = (0, disasm_js_1.disasm)(code);
    let hasDelegateCall = false;
    for (const fn of Object.values(program.dests)) {
        if (fn.opTags.has(opcodes_js_1.opcodes.DELEGATECALL)) {
            hasDelegateCall = true;
            break;
        }
    }
    for (const resolver of program.proxies) {
        if (!selector && resolver instanceof proxies_js_1.DiamondProxyResolver) {
            const facets = await resolver.facets(provider, address);
            console.log("Resolved to facets: ", facets);
        }
        else {
            const addr = await resolver.resolve(provider, address, selector);
            if (addr === "0x0000000000000000000000000000000000000000")
                continue;
            console.log(addr);
        }
        process.exit(0);
        return;
    }
    if (hasDelegateCall && program.proxies.length === 0) {
        console.log("DELEGATECALL detected but no proxies found");
    }
    else {
        console.log("No DELEGATECALL detected");
        return;
    }
    process.exit(0);
    return;
}
main().then().catch(err => {
    console.error("Failed:", err);
    process.exit(2);
});
//# sourceMappingURL=proxy.js.map