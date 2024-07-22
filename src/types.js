"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompatibleProvider = CompatibleProvider;
var utils_js_1 = require("./utils.js");
;
; // TODO: Can we narrow this more?
// Abstract away web3 provider inconsistencies
function CompatibleProvider(provider) {
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
var RPCProvider = /** @class */ (function () {
    function RPCProvider(provider) {
        this.provider = provider;
    }
    RPCProvider.prototype.getStorageAt = function (address, slot) {
        if (typeof slot === "number") {
            slot = (0, utils_js_1.bytesToHex)(slot);
        }
        return this.send("eth_getStorageAt", [address, slot, "latest"]);
    };
    RPCProvider.prototype.call = function (transaction) {
        return this.send("eth_call", [
            {
                from: "0x0000000000000000000000000000000000000001",
                to: transaction.to,
                data: transaction.data,
            },
            "latest"
        ]);
    };
    RPCProvider.prototype.getCode = function (address) {
        return this.send("eth_getCode", [address, "latest"]);
    };
    return RPCProvider;
}());
var GenericProvider = /** @class */ (function () {
    function GenericProvider(provider) {
        this.provider = provider;
    }
    GenericProvider.prototype.getStorageAt = function (address, slot) {
        return this.provider.getStorageAt(address, slot);
    };
    GenericProvider.prototype.call = function (transaction) {
        return this.provider.call(transaction);
    };
    GenericProvider.prototype.getCode = function (address) {
        return this.provider.getCode(address);
    };
    GenericProvider.prototype.getAddress = function (name) {
        return this.provider.getAddress(name);
    };
    return GenericProvider;
}());
var Web3Provider = /** @class */ (function (_super) {
    __extends(Web3Provider, _super);
    function Web3Provider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Web3Provider.prototype.send = function (method, params) {
        // this.provider is the web3 instance, we need web3.provider
        var r = this.provider.currentProvider.request({ method: method, params: params, "jsonrpc": "2.0", id: "1" });
        return r.then(function (resp) {
            if (resp.result)
                return resp.result;
            else if (resp.error)
                throw new Error(resp.error.message);
            return resp;
        });
    };
    Web3Provider.prototype.getAddress = function (name) {
        return this.provider.eth.ens.getAddress(name);
    };
    return Web3Provider;
}(RPCProvider));
var EthersProvider = /** @class */ (function (_super) {
    __extends(EthersProvider, _super);
    function EthersProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EthersProvider.prototype.send = function (method, params) {
        return this.provider.send(method, params);
    };
    EthersProvider.prototype.getAddress = function (name) {
        return this.provider.resolveName(name);
    };
    return EthersProvider;
}(RPCProvider));
var ViemProvider = /** @class */ (function (_super) {
    __extends(ViemProvider, _super);
    function ViemProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ViemProvider.prototype.send = function (method, params) {
        return this.provider.transport.request({ method: method, params: params });
    };
    ViemProvider.prototype.getAddress = function (name) {
        return this.provider.getEnsAddress({ name: name });
    };
    return ViemProvider;
}(RPCProvider));
