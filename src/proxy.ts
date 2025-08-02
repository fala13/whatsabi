#!/usr/bin/env -S tsx

import { ethers } from "ethers";

//import { DiamondProxyResolver } from '../src/proxies.js';
//import { disasm } from '../src/disasm.js';
//import { withCache } from "../src/internal/filecache.js";
//import { opcodes } from "../src/opcodes.js";
//import { CompatibleProvider } from "../src/types.js";
//import type { StorageProvider } from "../src/types.js";
import { DiamondProxyResolver } from './proxies.js';
import { disasm } from './disasm.js';
//import { withCache } from "../src/internal/filecache.js";
import { opcodes } from "./opcodes.js";
//import { CompatibleProvider } from "../src/types.js";
import { CompatibleProvider } from "./providers.js";

async function main() {
    const rawProvider = new ethers.IpcSocketProvider(process.argv[3]);
    const provider = CompatibleProvider(rawProvider);
    //const provider = new ethers.IpcSocketProvider(process.argv[3]) as unknown as typeof CompatibleProvider;
    const address = process.env["ADDRESS"] || process.argv[2];
    const selector = "";//process.env["SELECTOR"] || process.argv[3];
    const code = process.argv[4];

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
