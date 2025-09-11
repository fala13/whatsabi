use std::env;
use whatsabi_rs::*;
use whatsabi_rs::providers::*;

// Simple example binary that mimics proxy.ts functionality
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();

    if args.len() < 3 {
        eprintln!("Usage: {} <address> <bytecode>", args[0]);
        std::process::exit(1);
    }

    let address = &args[1];
    let bytecode = &args[2];

    // Disassemble the bytecode
    let program = disasm(bytecode);

    // Check for DELEGATECALL
    if program.has_delegatecall {
        println!("DELEGATECALL detected");
    } else {
        println!("No DELEGATECALL detected");
    }

    // Show found proxies
    for resolver in program.proxies.iter() {
        println!("Proxy found: {}", resolver.name());
    }

    // Note: In a real implementation, you'd need to provide actual RPC connectivity
    // to resolve proxy addresses. This example just demonstrates the disassembly.

    Ok(())
}
