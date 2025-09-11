use crate::providers::{StorageProvider, CallProvider, StorageCallProvider, ProviderError};
use crate::slots::{add_slot_offset, read_array, join_slot};
use crate::utils::{address_with_checksum};

const ZERO_ADDR: &str = "0x0000000000000000000000000000000000000000";

#[async_trait::async_trait]
pub trait ProxyResolver: Send + Sync {
    fn name(&self) -> &str;
    async fn resolve(&self, provider: &dyn StorageCallProvider, address: &str, selector: Option<&str>) -> Result<String, ProviderError>;
}

pub struct BaseProxyResolver { name: String }
impl BaseProxyResolver { pub fn new(name: &str) -> Self { Self { name: name.to_string() } } }

pub struct GnosisSafeProxyResolver(pub BaseProxyResolver);
#[async_trait::async_trait]
impl ProxyResolver for GnosisSafeProxyResolver {
    fn name(&self) -> &str { &self.0.name }
    async fn resolve(&self, provider: &dyn StorageCallProvider, address: &str, _selector: Option<&str>) -> Result<String, ProviderError> {
        let slot_position = "0x0";
        Ok(address_from_padded(&provider.get_storage_at(address, slot_position).await?))
    }
}

pub struct LegacyUpgradeableProxyResolver(pub BaseProxyResolver);
#[async_trait::async_trait]
impl ProxyResolver for LegacyUpgradeableProxyResolver {
    fn name(&self) -> &str { &self.0.name }
    async fn resolve(&self, provider: &dyn StorageCallProvider, address: &str, _selector: Option<&str>) -> Result<String, ProviderError> {
        let slot_position = "0x1";
        Ok(address_from_padded(&provider.get_storage_at(address, slot_position).await?))
    }
}

const EIP1967_FALLBACK_SELECTORS: &[&str] = &[
    "0x5c60da1b", // implementation()
    "0xda525716", // childImplementation()
    "0xa619486e", // masterCopy()
    "0xbb82aa5e", // comptrollerImplementation()
];

pub struct EIP1967ProxyResolver(pub BaseProxyResolver);
#[async_trait::async_trait]
impl ProxyResolver for EIP1967ProxyResolver {
    fn name(&self) -> &str { &self.0.name }
    async fn resolve(&self, provider: &dyn StorageCallProvider, address: &str, _selector: Option<&str>) -> Result<String, ProviderError> {
        let impl_addr = address_from_padded(&provider.get_storage_at(address, SLOTS::EIP1967_IMPL).await?);
        if impl_addr != ZERO_ADDR { return Ok(impl_addr); }
        let fallback_addr = address_from_padded(&provider.get_storage_at(address, SLOTS::EIP1967_BEACON).await?);
        if fallback_addr == ZERO_ADDR { return Ok(ZERO_ADDR.to_string()); }
        for sel in EIP1967_FALLBACK_SELECTORS {
            if let Ok(r) = provider.call(&fallback_addr, sel).await {
                let addr = address_from_padded(&r);
                if addr != ZERO_ADDR { return Ok(addr); }
            }
        }
        Ok(ZERO_ADDR.to_string())
    }
}

const DIAMOND_SELECTORS: &[&str] = &[
    "0xcdffacc6",
    "0x0d741577",
];

pub struct DiamondProxyResolver { name: String, storage_slot: String }
impl DiamondProxyResolver {
    pub fn new(name: &str, storage_slot: Option<&str>) -> Self {
        Self { name: name.to_string(), storage_slot: storage_slot.unwrap_or(SLOTS::DIAMOND_STORAGE).to_string() }
    }

    pub async fn facets(&self, provider: &impl StorageProvider, address: &str, limit: Option<usize>) -> Result<std::collections::HashMap<String, Vec<String>>, ProviderError> {
        let storage_start = &self.storage_slot;
        let facets_offset = add_slot_offset(storage_start, 2);
        let address_width = 20usize;
        let facets = read_array(&WrapStorage(provider), address, &facets_offset, address_width).await.map_err(|e| e)?;
        let mut facet_selectors = std::collections::HashMap::<String, Vec<String>>::new();
        let selector_width = 4usize;
        let slot = add_slot_offset(storage_start, 1);
        let mut remaining = limit.unwrap_or(0);
        for f in facets {
            let facet = address_from_padded(&f);
            let facet_selectors_slot = join_slot(&[facet.as_str(), &slot]);
            let selectors = read_array(&WrapStorage(provider), address, &facet_selectors_slot, selector_width).await.map_err(|e| e)?;
            let checksummed = address_with_checksum(&facet).map_err(|e| ProviderError::Rpc(e))?;
            facet_selectors.insert(checksummed, selectors.into_iter().map(|s| format!("0x{}", s)).collect());
            if remaining > 0 { remaining -= 1; if remaining == 0 { break; } }
        }
        Ok(facet_selectors)
    }
}

struct WrapStorage<'a, P>(&'a P);
#[async_trait::async_trait]
impl<'a, P> crate::slots::ReadArrayProvider for WrapStorage<'a, P>
where P: StorageProvider + Sync {
    type Error = ProviderError;
    async fn get_storage_at(&self, address: &str, slot: &str) -> Result<String, Self::Error> { self.0.get_storage_at(address, slot).await }
}

#[async_trait::async_trait]
impl ProxyResolver for DiamondProxyResolver {
    fn name(&self) -> &str { &self.name }
    async fn resolve(&self, provider: &dyn StorageCallProvider, address: &str, selector: Option<&str>) -> Result<String, ProviderError> {
        let mut sel = selector.ok_or_else(|| ProviderError::Rpc("selector required for DiamondProxy".into()))?.to_string();
        if sel.starts_with("0x") { sel = sel[2..].to_string(); }
        let facet_mapping_slot = join_slot(&[&format!("{:0<64}", sel), &self.storage_slot]);
        let facet = provider.get_storage_at(address, &facet_mapping_slot).await?;
        let storage_addr = format!("0x{}", &facet[facet.len()-40..]);
        if storage_addr != ZERO_ADDR { return Ok(storage_addr); }
        for fs in DIAMOND_SELECTORS {
            if let Ok(r) = provider.call(address, &format!("{}{}", fs, sel)).await {
                let addr = address_from_padded(&r);
                if addr != ZERO_ADDR { return Ok(addr); }
            }
        }
        Ok(ZERO_ADDR.to_string())
    }
}

pub struct ZeppelinOSProxyResolver(pub BaseProxyResolver);
#[async_trait::async_trait]
impl ProxyResolver for ZeppelinOSProxyResolver {
    fn name(&self) -> &str { &self.0.name }
    async fn resolve(&self, provider: &dyn StorageCallProvider, address: &str, _selector: Option<&str>) -> Result<String, ProviderError> {
        Ok(address_from_padded(&provider.get_storage_at(address, SLOTS::ZEPPELINOS_IMPL).await?))
    }
}

pub struct PROXIABLEProxyResolver(pub BaseProxyResolver);
#[async_trait::async_trait]
impl ProxyResolver for PROXIABLEProxyResolver {
    fn name(&self) -> &str { &self.0.name }
    async fn resolve(&self, provider: &dyn StorageCallProvider, address: &str, _selector: Option<&str>) -> Result<String, ProviderError> {
        Ok(address_from_padded(&provider.get_storage_at(address, SLOTS::PROXIABLE).await?))
    }
}

pub struct SequenceWalletProxyResolver(pub BaseProxyResolver);
#[async_trait::async_trait]
impl ProxyResolver for SequenceWalletProxyResolver {
    fn name(&self) -> &str { &self.0.name }
    async fn resolve(&self, provider: &dyn StorageCallProvider, address: &str, _selector: Option<&str>) -> Result<String, ProviderError> {
        let key = &address.to_lowercase()[2..].to_string();
        Ok(address_from_padded(&provider.get_storage_at(address, key).await?))
    }
}

pub struct FixedProxyResolver { pub name: String, pub resolved_address: String }
#[async_trait::async_trait]
impl ProxyResolver for FixedProxyResolver {
    fn name(&self) -> &str { &self.name }
    async fn resolve(&self, _provider: &dyn StorageCallProvider, _address: &str, _selector: Option<&str>) -> Result<String, ProviderError> {
        Ok(self.resolved_address.clone())
    }
}

pub struct SLOTS;
impl SLOTS {
    pub const EIP1967_IMPL: &'static str = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
    pub const EIP1967_BEACON: &'static str = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";
    pub const ZEPPELINOS_IMPL: &'static str = "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3";
    pub const PROXIABLE: &'static str = "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7";
    pub const GNOSIS_SAFE_SELECTOR: &'static str = "0xa619486e00000000000000000000000000000000000000000000000000000000";
    pub const DIAMOND_STORAGE: &'static str = "0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131b";
}

fn address_from_padded(data: &str) -> String {
    let s = data.trim_start_matches("0x");
    format!("0x{}", &s[s.len()-40..])
}

pub fn resolver_for_slot(slot: &str) -> Option<Box<dyn ProxyResolver>> {
    match slot {
        s if s.eq_ignore_ascii_case(SLOTS::EIP1967_IMPL) => Some(Box::new(EIP1967ProxyResolver(BaseProxyResolver::new("EIP1967Proxy")))),
        s if s.eq_ignore_ascii_case(SLOTS::EIP1967_BEACON) => Some(Box::new(EIP1967ProxyResolver(BaseProxyResolver::new("EIP1967Proxy")))),
        s if s.eq_ignore_ascii_case(SLOTS::ZEPPELINOS_IMPL) => Some(Box::new(ZeppelinOSProxyResolver(BaseProxyResolver::new("ZeppelinOSProxy")))),
        s if s.eq_ignore_ascii_case(SLOTS::PROXIABLE) => Some(Box::new(PROXIABLEProxyResolver(BaseProxyResolver::new("PROXIABLE")))),
        s if s.eq_ignore_ascii_case(SLOTS::GNOSIS_SAFE_SELECTOR) => Some(Box::new(GnosisSafeProxyResolver(BaseProxyResolver::new("GnosisSafeProxy")))),
        s if s.eq_ignore_ascii_case(SLOTS::DIAMOND_STORAGE) => Some(Box::new(DiamondProxyResolver::new("DiamondProxy", None))),
        // Same as above but some implementations don't do -1
        "0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c" => Some(Box::new(DiamondProxyResolver::new("DiamondProxy", Some("0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c")))),
        // Compiler quirks (+1 or +2)
        "0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131d" => Some(Box::new(DiamondProxyResolver::new("DiamondProxy", None))),
        // Off-by-one EIP1967 impl slot variant
        "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbd" => Some(Box::new(EIP1967ProxyResolver(BaseProxyResolver::new("EIP1967Proxy")))),
        _ => None,
    }
}


