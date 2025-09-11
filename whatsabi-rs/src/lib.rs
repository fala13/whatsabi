pub mod utils;
pub mod opcodes;
pub mod providers;
pub mod slots;
pub mod proxies;
pub mod disasm;
pub mod fixtures;

pub use disasm::{disasm, Program};
pub use proxies::{DiamondProxyResolver, ProxyResolver};

// Convenience: resolve targets like src/proxy.ts does
use providers::{Provider, StorageCallProvider};

pub async fn resolve_proxies<P: Provider>(provider: &P, address: &str, bytecode: &str, selector: Option<&str>) -> Result<Vec<String>, String> {
    let program = disasm(bytecode);
    let mut out = Vec::new();
    for resolver in program.proxies.iter() {
        let name = resolver.name();
        if name == "DiamondProxy" {
            // Diamond resolver requires selector, else return facets mapping as debug-like output
            if selector.is_none() {
                // Return a single stringified facets map
                // We can't call facets here without a concrete type; skip and just continue
                continue;
            }
        }
        let sel = selector.unwrap_or("");
        let addr = resolver
            .resolve(
                provider as &dyn StorageCallProvider,
                address,
                if sel.is_empty() { None } else { Some(sel) }
            )
            .await
            .map_err(|e| format!("{:?}", e))?;
        if addr != "0x0000000000000000000000000000000000000000" { out.push(addr); }
    }
    Ok(out)
}

