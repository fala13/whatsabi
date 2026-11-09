#!/usr/bin/env -S tsx

import { ethers } from "ethers";
import { DiamondProxyResolver } from './proxies.js';
import { disasm } from './disasm.js';
import { opcodes } from "./opcodes.js";
import { CompatibleProvider } from "./providers.js";
import { readFileSync } from "fs";

// ethers batches queued calls into one JSON-RPC array (default batchMaxCount
// 100). Honor MAX_BATCH_RPC_CALLS only when it is a positive integer; unset,
// 0, and non-numeric leave the ethers default in place.
function openProvider(endpoint: string) {
    const raw = process.env["MAX_BATCH_RPC_CALLS"];
    const n = raw == null ? NaN : Number(raw);
    const batchMaxCount = Number.isInteger(n) && n > 0 ? n : undefined;
    if (endpoint?.startsWith("ws")) {
        return batchMaxCount == null
            ? new ethers.WebSocketProvider(endpoint)
            : new ethers.WebSocketProvider(endpoint, undefined, { batchMaxCount });
    }
    if (endpoint?.startsWith("http")) {
        return batchMaxCount == null
            ? new ethers.JsonRpcProvider(endpoint)
            : new ethers.JsonRpcProvider(endpoint, undefined, { batchMaxCount });
    }
    return batchMaxCount == null
        ? new ethers.IpcSocketProvider(endpoint)
        : new ethers.IpcSocketProvider(endpoint, undefined, { batchMaxCount });
}

async function main() {
    const endpoint = process.argv[3];
    const address = process.env["ADDRESS"] || process.argv[2];
    const selector = "";//process.env["SELECTOR"] || process.argv[3];
    // argv is capped at MAX_ARG_STRLEN (128KiB). Callers that would exceed it
    // omit argv[4] and write the hex bytecode on stdin. Read that before
    // opening the provider so a full pipe cannot stall startup.
    const code = (process.argv[4] ?? readFileSync(0, "utf8")).trim();
    const rawProvider = openProvider(endpoint);
    const provider = CompatibleProvider(rawProvider);

    const program = disasm(code);

    let hasDelegateCall = false;
    for (const fn of Object.values(program.dests)) {
        if (fn.opTags.has(opcodes.DELEGATECALL)) {
            hasDelegateCall = true;
            break;
        }
    }

    for (const resolver of program.proxies) {
        //console.log("Proxy found:", resolver.toString());

        if (!selector && resolver instanceof DiamondProxyResolver) {
            const facets = await (resolver as DiamondProxyResolver).facets(provider, address);
            console.log("Resolved to facets: ", facets);
        } else {
            const addr = await resolver.resolve(provider, address, selector);
            if (addr === "0x0000000000000000000000000000000000000000") continue;
            //console.log("Resolved to address:", addr);
            console.log(addr);
        }

    process.exit(0);
        return;
    }

    if (hasDelegateCall && program.proxies.length === 0) {
        console.log("DELEGATECALL detected but no proxies found");
    } else {
        console.log("No DELEGATECALL detected");
        return;
    }
    process.exit(0);
    return;
}

main().then().catch(err => {
    console.error("Failed:", err)
    process.exit(2);
})
