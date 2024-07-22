"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Program = exports.Function = exports.BytecodeIter = void 0;
exports.abiFromBytecode = abiFromBytecode;
exports.disasm = disasm;
var utils_js_1 = require("./utils.js");
var opcodes_js_1 = require("./opcodes.js");
var proxies_js_1 = require("./proxies.js");
function valueToOffset(value) {
    // FIXME: Should be a cleaner way to do this...
    return parseInt((0, utils_js_1.bytesToHex)(value), 16);
}
// BytecodeIter takes EVM bytecode and handles iterating over it with correct
// step widths, while tracking N buffer of previous offsets for indexed access.
// This is useful for checking against sequences of variable width
// instructions.
var BytecodeIter = /** @class */ (function () {
    function BytecodeIter(bytecode, config) {
        this.nextStep = 0;
        this.nextPos = 0;
        if (config === undefined)
            config = {};
        this.posBufferSize = Math.max(config.bufferSize || 1, 1);
        this.posBuffer = [];
        this.bytecode = (0, utils_js_1.hexToBytes)(bytecode);
    }
    BytecodeIter.prototype.hasMore = function () {
        return (this.bytecode.length > this.nextPos);
    };
    BytecodeIter.prototype.next = function () {
        if (this.bytecode.length <= this.nextPos)
            return opcodes_js_1.opcodes.STOP;
        var instruction = this.bytecode[this.nextPos];
        var width = (0, opcodes_js_1.pushWidth)(instruction);
        // TODO: Optimization: Could use a circular buffer
        if (this.posBuffer.length >= this.posBufferSize)
            this.posBuffer.shift();
        this.posBuffer.push(this.nextPos);
        this.nextStep += 1;
        this.nextPos += 1 + width;
        return instruction;
    };
    // step is the current instruction position that we've iterated over. If
    // iteration has not begun, then it's -1.
    BytecodeIter.prototype.step = function () {
        return this.nextStep - 1;
    };
    // pos is the byte offset of the current instruction we've iterated over.
    // If iteration has not begun then it's -1.
    BytecodeIter.prototype.pos = function () {
        if (this.posBuffer.length === 0)
            return -1;
        return this.posBuffer[this.posBuffer.length - 1];
    };
    // asPos returns an absolute position for a given position that could be relative.
    // Returns -1 if out of bounds.
    BytecodeIter.prototype.asPos = function (posOrRelativeStep) {
        var pos = posOrRelativeStep;
        if (pos < 0) {
            pos = this.posBuffer[this.posBuffer.length + pos];
            if (pos === undefined) {
                return -1;
            }
        }
        return pos;
    };
    // at returns instruction at an absolute byte position or relative negative
    // buffered step offset. Buffered step offsets must be negative and start
    // at -1 (current step).
    BytecodeIter.prototype.at = function (posOrRelativeStep) {
        var pos = this.asPos(posOrRelativeStep);
        return this.bytecode[pos];
    };
    // value of last next-returned OpCode (should be a PUSHN intruction)
    BytecodeIter.prototype.value = function () {
        return this.valueAt(-1);
    };
    // valueAt returns the variable width value for PUSH-like instructions (or
    // empty value otherwise), at pos pos can be a relative negative count for
    // relative buffered offset.
    BytecodeIter.prototype.valueAt = function (posOrRelativeStep) {
        var pos = this.asPos(posOrRelativeStep);
        var instruction = this.bytecode[pos];
        var width = (0, opcodes_js_1.pushWidth)(instruction);
        return this.bytecode.slice(pos + 1, pos + 1 + width);
    };
    return BytecodeIter;
}());
exports.BytecodeIter = BytecodeIter;
// Opcodes that tell us something interesting about the function they're in
var interestingOpCodes = new Set([
    opcodes_js_1.opcodes.STOP, // No return value
    opcodes_js_1.opcodes.RETURN, // Has return value?
    opcodes_js_1.opcodes.CALLDATALOAD, // Has arguments
    opcodes_js_1.opcodes.CALLDATASIZE, // FIXME: Is it superfluous to have these two?
    opcodes_js_1.opcodes.CALLDATACOPY,
    opcodes_js_1.opcodes.DELEGATECALL, // We use this to detect proxies
    opcodes_js_1.opcodes.SLOAD, // Not pure
    opcodes_js_1.opcodes.SSTORE, // Not view
    opcodes_js_1.opcodes.REVERT,
    // TODO: Add LOGs to track event emitters?
]);
var Function = /** @class */ (function () {
    function Function(byteOffset, start) {
        if (byteOffset === void 0) { byteOffset = 0; }
        if (start === void 0) { start = 0; }
        this.byteOffset = byteOffset;
        this.start = start;
        this.opTags = new Set();
        this.jumps = [];
    }
    return Function;
}());
exports.Function = Function;
var Program = /** @class */ (function () {
    function Program(init) {
        this.dests = {};
        this.selectors = {};
        this.notPayable = {};
        this.eventCandidates = [];
        this.proxySlots = [];
        this.proxies = [];
        this.init = init;
    }
    return Program;
}());
exports.Program = Program;
function abiFromBytecode(bytecodeOrProgram) {
    var p = typeof bytecodeOrProgram === "string" ? disasm(bytecodeOrProgram) : bytecodeOrProgram;
    var abi = [];
    for (var _i = 0, _a = Object.entries(p.selectors); _i < _a.length; _i++) {
        var _b = _a[_i], selector = _b[0], offset = _b[1];
        // TODO: Optimization: If we only look at selectors in the jump table region, we shouldn't need to check JUMPDEST validity.
        if (!(offset in p.dests)) {
            // Selector does not point to a valid jumpdest. This should not happen.
            continue;
        }
        // Collapse tags for function call graph
        var fn = p.dests[offset];
        var tags = subtreeTags(fn, p.dests);
        var funcABI = {
            type: "function",
            selector: selector,
            payable: !p.notPayable[offset],
        };
        // Note that these are not very reliable because our tag detection
        // fails to follow dynamic jumps.
        var mutability = "nonpayable";
        if (funcABI.payable) {
            mutability = "payable";
        }
        else if (!tags.has(opcodes_js_1.opcodes.SSTORE)) {
            mutability = "view";
        }
        // TODO: Can we make a claim about purity? Probably not reliably without handling dynamic jumps?
        // if (mutability === "view" && !tags.has(opcodes.SLOAD)) {
        //    mutability = "pure";
        // }
        funcABI.stateMutability = mutability;
        // Unfortunately we don't have better details about the type sizes, so we just return a dynamically-sized /shrug
        if (tags.has(opcodes_js_1.opcodes.RETURN) || mutability === "view") {
            // FIXME: We assume outputs based on mutability, that's a hack.
            funcABI.outputs = [{ type: "bytes", name: "" }];
        }
        if (tags.has(opcodes_js_1.opcodes.CALLDATALOAD) || tags.has(opcodes_js_1.opcodes.CALLDATASIZE) || tags.has(opcodes_js_1.opcodes.CALLDATACOPY)) {
            funcABI.inputs = [{ type: "bytes", name: "" }];
        }
        abi.push(funcABI);
    }
    for (var _c = 0, _d = p.eventCandidates; _c < _d.length; _c++) {
        var h = _d[_c];
        abi.push({
            type: "event",
            hash: h,
        });
    }
    return abi;
}
var _EmptyArray = new Uint8Array();
function disasm(bytecode, config) {
    var onlyJumpTable = (config || {}).onlyJumpTable;
    var p = new Program();
    var selectorDests = new Set();
    var invertedSelector = "";
    var lastPush32 = _EmptyArray; // Track last push32 to find log topics
    var checkJumpTable = true;
    var resumeJumpTable = new Set();
    var runtimeOffset = 0; // Non-zero if init deploy code is included
    var currentFunction = new Function();
    p.dests[0] = currentFunction;
    var code = new BytecodeIter(bytecode, { bufferSize: 5 });
    while (code.hasMore()) {
        var inst = code.next();
        var pos = code.pos();
        var step = code.step();
        // Track last PUSH32 to find LOG topics
        // This is probably not bullet proof but seems like a good starting point
        if (inst === opcodes_js_1.opcodes.PUSH32) {
            var v = code.value();
            var resolver = proxies_js_1.slotResolvers[(0, utils_js_1.bytesToHex)(v)];
            if (resolver !== undefined) {
                // While we're looking at PUSH32, let's find proxy slots
                p.proxies.push(resolver);
            }
            else {
                lastPush32 = v;
            }
            continue;
        }
        else if ((0, opcodes_js_1.isLog)(inst) && lastPush32.length > 0) {
            p.eventCandidates.push((0, utils_js_1.bytesToHex)(lastPush32));
            continue;
        }
        // Possible minimal proxy pattern? EIP-1167
        if (inst === opcodes_js_1.opcodes.DELEGATECALL &&
            code.at(-2) === opcodes_js_1.opcodes.GAS) {
            if ((0, opcodes_js_1.isPush)(code.at(-3))) {
                // Hardcoded delegate address
                // TODO: We can probably do more here to determine which kind? Do we care?
                var addr = (0, utils_js_1.bytesToHex)(code.valueAt(-3), 20);
                p.proxies.push(new proxies_js_1.FixedProxyResolver("HardcodedDelegateProxy", addr));
            }
            else if (code.at(-3) === opcodes_js_1.opcodes.SLOAD &&
                code.at(-4) === opcodes_js_1.opcodes.ADDRESS) {
                // SequenceWallet-style proxy (keyed on address)
                p.proxies.push(new proxies_js_1.SequenceWalletProxyResolver());
            }
        }
        // Find JUMPDEST labels
        if (inst === opcodes_js_1.opcodes.JUMPDEST) {
            // End of the function, or disjoint function?
            if ((0, opcodes_js_1.isHalt)(code.at(-2)) || code.at(-2) === opcodes_js_1.opcodes.JUMP) {
                if (currentFunction)
                    currentFunction.end = pos - 1 - runtimeOffset;
                currentFunction = new Function(step, pos);
                // We don't stop looking for jump tables until we find at least one selector
                if (checkJumpTable && Object.keys(p.selectors).length > 0) {
                    checkJumpTable = false;
                }
                if (resumeJumpTable.delete(pos)) {
                    // Continuation of a previous jump table?
                    // Selector branch trees start by pushing CALLDATALOAD or it was pushed before.
                    checkJumpTable = code.at(pos + 1) === opcodes_js_1.opcodes.DUP1 || code.at(pos + 1) === opcodes_js_1.opcodes.CALLDATALOAD;
                }
                else if (!checkJumpTable && resumeJumpTable.size === 0 && onlyJumpTable) {
                    // Exit early if we're only looking in the jump table
                    break;
                }
            } // Otherwise it's just a simple branch, we continue
            // Index jump destinations so we can check against them later
            p.dests[pos - runtimeOffset] = currentFunction;
            // Check whether a JUMPDEST has non-payable guards
            //
            // We look for a sequence of instructions that look like:
            // JUMPDEST CALLVALUE DUP1 ISZERO
            //
            // We can do direct positive indexing because we know that there
            // are no variable-width instructions in our sequence.
            if (code.at(pos + 1) === opcodes_js_1.opcodes.CALLVALUE &&
                code.at(pos + 2) === opcodes_js_1.opcodes.DUP1 &&
                code.at(pos + 3) === opcodes_js_1.opcodes.ISZERO) {
                p.notPayable[pos] = step;
                // TODO: Optimization: Could seek ahead 3 pos/count safely
            }
            // TODO: Check whether function has a simple return flow?
            // if (code.at(pos - 1) === opcodes.RETURN) { ... }
            continue;
        }
        // Annotate current function
        if (currentFunction.opTags !== undefined) {
            // Detect simple JUMP/JUMPI helper subroutines
            if ((inst === opcodes_js_1.opcodes.JUMP || inst === opcodes_js_1.opcodes.JUMPI) && (0, opcodes_js_1.isPush)(code.at(-2))) {
                var jumpOffset = valueToOffset(code.valueAt(-2));
                currentFunction.jumps.push(jumpOffset - runtimeOffset);
            }
            // Tag current function with interesting opcodes (not including above)
            if (interestingOpCodes.has(inst)) {
                currentFunction.opTags.add(inst);
            }
        }
        // Did we just copy code that might be the runtime code?
        // PUSH2 <RUNTIME OFFSET> PUSH1 0x00 CODECOPY
        if (code.at(-1) === opcodes_js_1.opcodes.CODECOPY &&
            code.at(-2) === opcodes_js_1.opcodes.PUSH1 &&
            code.at(-3) === opcodes_js_1.opcodes.PUSH2) {
            var offsetDest_1 = valueToOffset(code.valueAt(-3));
            resumeJumpTable.add(offsetDest_1);
            runtimeOffset = offsetDest_1;
            continue;
        }
        if (pos === runtimeOffset &&
            currentFunction.opTags.has(opcodes_js_1.opcodes.RETURN) &&
            !currentFunction.opTags.has(opcodes_js_1.opcodes.CALLDATALOAD)) {
            // Reset state, embed program as init
            p = new Program(p);
            currentFunction = new Function();
            p.dests[0] = currentFunction;
            checkJumpTable = true;
        }
        if (!checkJumpTable)
            continue; // Skip searching for function selectors at this point
        // We're in a jump table section now. Let's find some selectors.
        if (inst === opcodes_js_1.opcodes.JUMP && (0, opcodes_js_1.isPush)(code.at(-2))) {
            var offsetDest_2 = valueToOffset(code.valueAt(-2));
            if (invertedSelector !== "") {
                p.selectors[invertedSelector] = offsetDest_2;
                selectorDests.add(offsetDest_2);
                invertedSelector = "";
            }
            else {
                // The table is continued elsewhere? Or could be a default target
                resumeJumpTable.add(offsetDest_2);
            }
        }
        // Beyond this, we're only looking with instruction sequences that end with 
        //   ... PUSHN <BYTEN> JUMPI
        if (!(code.at(-1) === opcodes_js_1.opcodes.JUMPI && (0, opcodes_js_1.isPush)(code.at(-2))))
            continue;
        var offsetDest = valueToOffset(code.valueAt(-2));
        currentFunction.jumps.push(offsetDest);
        // Find callable function selectors:
        //
        // https://github.com/ethereum/solidity/blob/242096695fd3e08cc3ca3f0a7d2e06d09b5277bf/libsolidity/codegen/ContractCompiler.cpp#L333
        //
        // We're looking for a sequence of opcodes that looks like:
        //
        //    DUP1 PUSH4 0x2E64CEC1 EQ PUSH1 0x37    JUMPI
        //    DUP1 PUSH4 <SELECTOR> EQ PUSHN <OFFSET> JUMPI
        //    80   63    ^          14 60-7f ^       57
        //               Selector            Dest
        //
        // We can reliably skip checking for DUP1 if we're only searching
        // within `inJumpTable` range.
        //
        // Note that sizes of selectors and destinations can vary. Selector
        // PUSH can get optimized with zero-prefixes, all the way down to an
        // ISZERO routine (see next condition block).
        if (code.at(-3) === opcodes_js_1.opcodes.EQ &&
            (0, opcodes_js_1.isPush)(code.at(-4))) {
            // Found a function selector sequence, save it to check against JUMPDEST table later
            var value = code.valueAt(-4);
            // 0-prefixed comparisons get optimized to a smaller width than PUSH4
            var selector = (0, utils_js_1.bytesToHex)(value, 4);
            p.selectors[selector] = offsetDest;
            selectorDests.add(offsetDest);
            continue;
        }
        // Sometimes the positions get swapped with DUP2:
        //    PUSHN <SELECTOR> DUP2 EQ PUSHN <OFFSET> JUMPI
        if (code.at(-3) === opcodes_js_1.opcodes.EQ &&
            code.at(-4) === opcodes_js_1.opcodes.DUP2 &&
            (0, opcodes_js_1.isPush)(code.at(-5))) {
            // Found a function selector sequence, save it to check against JUMPDEST table later
            var value = code.valueAt(-5);
            // 0-prefixed comparisons get optimized to a smaller width than PUSH4
            var selector = (0, utils_js_1.bytesToHex)(value, 4);
            p.selectors[selector] = offsetDest;
            selectorDests.add(offsetDest);
            continue;
        }
        // Sometimes the final selector is negated using SUB
        //    PUSHN <SELECTOR> SUB PUSHN <OFFSET> JUMPI ... <OFFSET> <JUMP>
        //                                        ^ We are here (at -1)
        if (code.at(-3) === opcodes_js_1.opcodes.SUB &&
            (0, opcodes_js_1.isPush)(code.at(-4))) {
            // Found an inverted JUMPI, probably a final "else" condition
            invertedSelector = (0, utils_js_1.bytesToHex)(code.valueAt(-4), 4);
            p.fallback = offsetDest; // Fallback
        }
        // In some cases, the sequence can get optimized such as for 0x00000000:
        //    DUP1 ISZERO PUSHN <OFFSET> JUMPI
        // FIXME: Need a better heuristic to descriminate the preceding value. This is hacky. :(
        if (code.at(-3) === opcodes_js_1.opcodes.ISZERO &&
            code.at(-4) === opcodes_js_1.opcodes.DUP1 &&
            (code.at(-5) === opcodes_js_1.opcodes.CALLDATASIZE ||
                code.at(-5) === opcodes_js_1.opcodes.CALLDATALOAD ||
                code.at(-5) === opcodes_js_1.opcodes.JUMPDEST ||
                code.at(-5) === opcodes_js_1.opcodes.SHR)) {
            var selector = "0x00000000";
            p.selectors[selector] = offsetDest;
            selectorDests.add(offsetDest);
            continue;
        }
        // Jumptable trees use GT/LT comparisons to branch jumps.
        //    DUP1 PUSHN <SELECTOR> GT/LT PUSHN <OFFSET> JUMPI
        if (code.at(-3) !== opcodes_js_1.opcodes.EQ &&
            (0, opcodes_js_1.isCompare)(code.at(-3)) &&
            code.at(-5) === opcodes_js_1.opcodes.DUP1) {
            resumeJumpTable.add(offsetDest);
            continue;
        }
    }
    return p;
}
function subtreeTags(entryFunc, dests) {
    var tags = new Set([]);
    var stack = new Array(entryFunc);
    var seen = new Set();
    while (stack.length > 0) {
        var fn = stack.pop();
        if (!fn)
            continue;
        if (seen.has(fn.start))
            continue;
        seen.add(fn.start);
        tags = new Set(__spreadArray(__spreadArray([], tags, true), fn.opTags, true));
        stack.push.apply(stack, fn.jumps.map(function (offset) { return dests[offset]; }));
    }
    return tags;
}
