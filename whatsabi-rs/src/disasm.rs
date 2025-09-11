use crate::opcodes::{push_width, is_log, is_halt, is_compare};
use crate::proxies::{ProxyResolver, FixedProxyResolver, SequenceWalletProxyResolver, resolver_for_slot};
use crate::opcodes::OpCode;
use crate::utils::{hex_to_bytes, bytes_to_hex};

#[derive(Default, Clone)]
pub struct FunctionInfo {
    pub byte_offset: usize,
    pub start: usize,
    pub op_tags: std::collections::HashSet<u8>,
    pub jumps: Vec<usize>,
    pub end: Option<usize>,
}

#[derive(Default)]
pub struct Program {
    pub dests: std::collections::BTreeMap<usize, FunctionInfo>,
    pub selectors: std::collections::BTreeMap<String, usize>,
    pub not_payable: std::collections::BTreeMap<usize, usize>,
    pub fallback_fn: Option<usize>,
    pub event_candidates: std::collections::HashSet<String>,
    pub proxy_slots: Vec<String>,
    pub proxies: Vec<Box<dyn ProxyResolver>>, // minimal for proxy.ts usage
    pub has_delegatecall: bool,
}

pub struct BytecodeIter {
    bytecode: Vec<u8>,
    next_step: usize,
    next_pos: usize,
    pos_buffer: Vec<usize>,
    pos_buffer_size: usize,
}

impl BytecodeIter {
    pub fn new(bytecode_hex: &str, buffer_size: usize) -> Self {
        Self {
            bytecode: hex_to_bytes(bytecode_hex).expect("valid hex"),
            next_step: 0,
            next_pos: 0,
            pos_buffer: Vec::new(),
            pos_buffer_size: buffer_size.max(1),
        }
    }

    pub fn has_more(&self) -> bool { self.bytecode.len() > self.next_pos }
    pub fn step(&self) -> isize { self.next_step as isize - 1 }
    pub fn pos(&self) -> isize { if self.pos_buffer.is_empty() { -1 } else { *self.pos_buffer.last().unwrap() as isize } }

    pub fn next(&mut self) -> u8 {
        if self.bytecode.len() <= self.next_pos { return OpCode::STOP as u8; }
        let instruction = self.bytecode[self.next_pos];
        let width = push_width(instruction);
        if self.pos_buffer.len() >= self.pos_buffer_size { self.pos_buffer.remove(0); }
        self.pos_buffer.push(self.next_pos);
        self.next_step += 1; self.next_pos += 1 + width;
        instruction
    }

    fn as_pos(&self, pos_or_rel: isize) -> isize {
        let mut pos = pos_or_rel;
        if pos < 0 { let idx = (self.pos_buffer.len() as isize + pos) as usize; if idx >= self.pos_buffer.len() { return -1; } pos = self.pos_buffer[idx] as isize; }
        pos
    }

    pub fn at(&self, pos_or_rel: isize) -> u8 { let pos = self.as_pos(pos_or_rel) as usize; self.bytecode[pos] }
    pub fn value_at(&self, pos_or_rel: isize) -> &[u8] {
        let pos = self.as_pos(pos_or_rel) as usize; let instruction = self.bytecode[pos]; let width = push_width(instruction); &self.bytecode[pos+1..pos+1+width]
    }
}

pub fn disasm(bytecode: &str) -> Program {
    let mut p = Program::default();
    let mut current = FunctionInfo { byte_offset: 0, start: 0, op_tags: Default::default(), jumps: vec![], end: None };
    p.dests.insert(0, current.clone());

    let mut code = BytecodeIter::new(bytecode, 5);
    while code.has_more() {
        let inst = code.next();
        let pos = code.pos();

        // Detect PUSH32 for proxy slots and event candidates
        if inst == OpCode::PUSH32 as u8 {
            let v = code.value_at(-1);
            let hex = bytes_to_hex(v);
            if let Some(resolver) = resolver_for_slot(&hex) {
                let push = match p.proxies.last() { Some(prev) => prev.name() != resolver.name(), None => true };
                if push { p.proxies.push(resolver); }
            } else {
                p.event_candidates.insert(hex);
            }
            continue;
        } else if is_log(inst) {
            // leave event_candidates as-is
        }

        if inst == OpCode::DELEGATECALL as u8 && code.at(-2) == OpCode::GAS as u8 {
            p.has_delegatecall = true;
            if let val @ 0x60..=0x7f = code.at(-3) { // PUSHN
                let v = code.value_at(-3);
                let addr = {
                    let len = v.len();
                    let slice = &v[len.saturating_sub(20)..];
                    bytes_to_hex(slice)
                };
                p.proxies.push(Box::new(FixedProxyResolver { name: "HardcodedDelegateProxy".into(), resolved_address: addr }));
            } else if code.at(-3) == OpCode::SLOAD as u8 && code.at(-4) == OpCode::ADDRESS as u8 {
                p.proxies.push(Box::new(SequenceWalletProxyResolver(crate::proxies::BaseProxyResolver::new("SequenceWalletProxy"))));
            }
        }

        if inst == OpCode::JUMPDEST as u8 { p.dests.insert((pos as usize), current.clone()); }
        // Minimal analysis is sufficient for proxy.ts behavior
    }
    p
}


