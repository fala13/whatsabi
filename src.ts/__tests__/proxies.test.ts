import { test, describe, expect } from '@jest/globals';

import {cached_test } from './env';

import { disasm } from '../disasm';
import * as proxies from '../proxies';

import { ZEPPELINOS_USDC } from './__fixtures__/proxies'

// TODO: Test for proxy factories to not match

describe('proxy detection', () => {
    test('Minimal Proxy Pattern', async () => {
        // https://eips.ethereum.org/EIPS/eip-1167
        const bytecode = "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3";

        const program = disasm(bytecode);
        expect(program.delegateAddresses).toContain("0xbebebebebebebebebebebebebebebebebebebebe");
    });

    test.skip('SequenceWallet Proxy', async() => {
        // Gas-optimized version of EIP-1167
        // https://github.com/0xsequence/wallet-contracts/blob/master/contracts/Wallet.sol
        // FIXME: Need to refactor proxySlots, since the slot is dynamic
        const bytecode = "0x363d3d373d3d3d363d30545af43d82803e903d91601857fd5bf3";
        const program = disasm(bytecode);
        expect(program.proxySlots).toContain("TODO");
    });

    test('Gnosis Safe Proxy Factory', async () => {
        // https://eips.ethereum.org/EIPS/eip-1167
        const bytecode = "0x608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea265627a7a72315820d8a00dc4fe6bf675a9d7416fc2d00bb3433362aa8186b750f76c4027269667ff64736f6c634300050e0032";

        const program = disasm(bytecode);
        expect(program.proxySlots).toContain("0xa619486e00000000000000000000000000000000000000000000000000000000");
    });

    test('ZeppelinOS Proxy', async () => {
        const bytecode = ZEPPELINOS_USDC;
        const program = disasm(bytecode);
        expect(program.proxySlots).toContain("0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3");
    });
});

describe('proxy resolving', () => {
    //test('Safe: Proxy Factory 1.1.1', async () => {
    //    const address = "0x655a9e6b044d6b62f393f9990ec3ea877e966e18";
    //    // Need to call masterCopy() or getStorageAt for 0th slot
    //    const want = "0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F";
    //});
    
    cached_test('EIP-1967 Proxy', async ({ provider, withCache }) => {
        const address = "0xa1a3cf8593cab3ea4c3a0b729d2c9fa2ad04e4b0";
        const got = proxies.EIP1967ProxyResolver.resolve(provider, address);
        const wantImplementation = "0x4a5ad53ed70357961e58faf304ccfd06180d2c30,";

        expect(got).toEqual(wantImplementation);
    });
    
    // FIXME: Is there one on mainnet? Seems they're all on polygon
    //online_test('SequenceWallet Proxy', async() => {
    //});
});
