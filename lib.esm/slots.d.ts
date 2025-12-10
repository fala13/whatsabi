import type { StorageProvider } from "./providers.js";
export declare function joinSlot(parts: string[]): string;
export declare function addSlotOffset(slot: string, offset: number): string;
/**
 * Read an array at some slot
 * @param {StorageProvider} provider - Implementation of a provider that can call getStorageAt
 * @param {string} address - Address of the contract storage namespace
 * @param {number|string} pos - Slot position of the array
 * @param {number=32} width - Array item size, in bytes
 * @param {number=0} limit - Array size limit, throw error if exceeded
 * @returns {Promise<string[]>} Values of the array at the given slot
 */
export declare function readArray(provider: StorageProvider, address: string, pos: number | string, width?: number, limit?: number): Promise<string[]>;
