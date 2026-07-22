#!/usr/bin/env -S tsx
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const index_js_1 = require("./index.js");
const provider = new ethers_1.ethers.IpcSocketProvider("/srv/black/reth/reth.ipc");
async function main() {
    const address = process.env["ADDRESS"] || process.argv[2];
    if (!address) {
        console.log("Usage: autoload.ts ADDRESS");
        process.exit(1);
    }
    let r = await index_js_1.whatsabi.autoload(address, {
        provider,
    });
    console.log(r.abi);
    console.log(JSON.stringify(r.abi, null, 2));
    process.exit(0);
}
main().then().catch(err => {
    console.error("Failed:", err);
    process.exit(2);
});
//# sourceMappingURL=autoload.js.map