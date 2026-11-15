export declare function hexToBytes(hex: string): Uint8Array;
export declare function bytesToHex(bytes: Uint8Array | Number | bigint, padToBytes?: number): string;
export declare class FetchError extends Error {
    status: number;
    constructor(message: string, status: number);
}
export declare function fetchJSON(url: string): Promise<any>;
//# sourceMappingURL=utils.d.ts.map