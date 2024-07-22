import { bytesToHex } from "./utils.js";
;
; // TODO: Can we narrow this more?
// Abstract away web3 provider inconsistencies
export function CompatibleProvider(provider) {
    if (typeof provider.getAddress === "function") {
        return new GenericProvider(provider);
    }
    if (typeof provider.resolveName === "function") {
        return new EthersProvider(provider);
    }
    if (typeof provider.getEnsAddress === "function") {
        return new ViemProvider(provider);
    }
    if (typeof provider.eth !== undefined) {
        return new Web3Provider(provider);
    }
    throw new Error("Unsupported provider, please open an issue: https://github.com/shazow/whatsabi/issues");
}
// RPCPRovider thesis is: let's stop trying to adapt to every RPC wrapper library's high-level functions
// and instead have a discovery for the lowest-level RPC call function that we can use directly.
// At least whenever possible. Higher-level functionality like getAddress is still tricky.
class RPCProvider {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    getStorageAt(address, slot) {
        if (typeof slot === "number") {
            slot = bytesToHex(slot);
        }
        return this.send("eth_getStorageAt", [address, slot, "latest"]);
    }
    call(transaction) {
        return this.send("eth_call", [
            {
                from: "0x0000000000000000000000000000000000000001",
                to: transaction.to,
                data: transaction.data,
            },
            "latest"
        ]);
    }
    getCode(address) {
        return this.send("eth_getCode", [address, "latest"]);
    }
}
class GenericProvider {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    getStorageAt(address, slot) {
        return this.provider.getStorageAt(address, slot);
    }
    call(transaction) {
        return this.provider.call(transaction);
    }
    getCode(address) {
        return this.provider.getCode(address);
    }
    getAddress(name) {
        return this.provider.getAddress(name);
    }
}
class Web3Provider extends RPCProvider {
    send(method, params) {
        // this.provider is the web3 instance, we need web3.provider
        const r = this.provider.currentProvider.request({ method, params, "jsonrpc": "2.0", id: "1" });
        return r.then((resp) => {
            if (resp.result)
                return resp.result;
            else if (resp.error)
                throw new Error(resp.error.message);
            return resp;
        });
    }
    getAddress(name) {
        return this.provider.eth.ens.getAddress(name);
    }
}
class EthersProvider extends RPCProvider {
    send(method, params) {
        return this.provider.send(method, params);
    }
    getAddress(name) {
        return this.provider.resolveName(name);
    }
}
class ViemProvider extends RPCProvider {
    send(method, params) {
        return this.provider.transport.request({ method, params });
    }
    getAddress(name) {
        return this.provider.getEnsAddress({ name });
    }
}
//# sourceMappingURL=types.js.map