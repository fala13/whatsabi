use whatsabi_rs::*;
use whatsabi_rs::proxies::*;
use whatsabi_rs::providers::*;
use whatsabi_rs::fixtures::*;

// Mock provider for testing
struct MockProvider {
    storage: std::collections::HashMap<String, String>,
    calls: std::collections::HashMap<String, String>,
}

#[async_trait::async_trait]
impl StorageProvider for MockProvider {
    async fn get_storage_at(&self, _address: &str, slot: &str) -> Result<String, ProviderError> {
        Ok(self.storage.get(slot).cloned().unwrap_or_else(|| "0x0000000000000000000000000000000000000000000000000000000000000000".to_string()))
    }
}

#[async_trait::async_trait]
impl CallProvider for MockProvider {
    async fn call(&self, _to: &str, data: &str) -> Result<String, ProviderError> {
        Ok(self.calls.get(data).cloned().unwrap_or_else(|| "0x0000000000000000000000000000000000000000000000000000000000000000".to_string()))
    }
}

#[async_trait::async_trait]
impl CodeProvider for MockProvider {
    async fn get_code(&self, _address: &str) -> Result<String, ProviderError> {
        Ok("0x".to_string())
    }
}

#[async_trait::async_trait]
impl EnsProvider for MockProvider {
    async fn get_address(&self, _name: &str) -> Result<String, ProviderError> {
        Ok("0x0000000000000000000000000000000000000000".to_string())
    }
}

impl MockProvider {
    fn new() -> Self {
        Self {
            storage: std::collections::HashMap::new(),
            calls: std::collections::HashMap::new(),
        }
    }

    fn with_storage(mut self, slot: &str, value: &str) -> Self {
        self.storage.insert(slot.to_string(), value.to_string());
        self
    }

    fn with_call(mut self, data: &str, result: &str) -> Self {
        self.calls.insert(data.to_string(), result.to_string());
        self
    }
}

#[tokio::test]
async fn test_minimal_proxy_pattern() {
    let bytecode = "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3";
    let program = disasm(bytecode);

    assert_eq!(program.proxies.len(), 1);
    assert_eq!(program.proxies[0].name(), "HardcodedDelegateProxy");

    let resolver = program.proxies[0].as_any().downcast_ref::<FixedProxyResolver>().unwrap();
    assert_eq!(resolver.resolved_address, "0xbebebebebebebebebebebebebebebebebebebebe");
    assert_eq!(resolver.name, "HardcodedDelegateProxy");
}

#[tokio::test]
async fn test_eip1167_proxy_uniswap_v1() {
    let bytecode = "0x3660006000376110006000366000732157a7894439191e520825fe9399ab8655e0f7085af41558576110006000f3";
    let want = "0x2157a7894439191e520825fe9399ab8655e0f708";
    let program = disasm(bytecode);

    assert_eq!(program.proxies.len(), 1);
    assert_eq!(program.proxies[0].name(), "HardcodedDelegateProxy");

    let resolver = program.proxies[0].as_any().downcast_ref::<FixedProxyResolver>().unwrap();
    assert_eq!(resolver.resolved_address, want);
}

#[tokio::test]
async fn test_solady_minimal_proxy_cwia() {
    let bytecode = "0x36602c57343d527f9e4ac34f21c619cefc926c8bd93b54bf5a39c7ab2127a895af1cc0691d7e3dff593da1005b363d3d373d3d3d3d610016806062363936013d73bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb5af43d3d93803e606057fd5bf3e127ce638293fa123be79c25782a5652581db2340016";
    let program = disasm(bytecode);

    assert_eq!(program.proxies.len(), 1);
    assert_eq!(program.proxies[0].name(), "HardcodedDelegateProxy");

    let resolver = program.proxies[0].as_any().downcast_ref::<FixedProxyResolver>().unwrap();
    let want = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    assert_eq!(resolver.resolved_address, want);
}

#[tokio::test]
async fn test_sequence_wallet_proxy() {
    let bytecode = "0x363d3d373d3d3d363d30545af43d82803e903d91601857fd5bf3";
    let program = disasm(bytecode);

    assert_eq!(program.proxies.len(), 1);
    assert_eq!(program.proxies[0].name(), "SequenceWalletProxy");
}

#[tokio::test]
async fn test_gnosis_safe_proxy_factory() {
    let bytecode = "0x608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea265627a7a72315820d8a00dc4fe6bf675a9d7416fc2d00bb3433362aa8186b750f76c4027269667ff64736f6c634300050e0032";
    let program = disasm(bytecode);

    assert_eq!(program.proxies.len(), 1);
    assert_eq!(program.proxies[0].name(), "GnosisSafeProxy");
}

#[tokio::test]
async fn test_zeppelinos_proxy() {
    let program = disasm(ZEPPELINOS_USDC);

    assert_eq!(program.proxies.len(), 1);
    assert_eq!(program.proxies[0].name(), "ZeppelinOSProxy");
}

#[tokio::test]
async fn test_gnosis_safe_proxy_resolve() {
    let mut provider = MockProvider::new();
    provider.storage.insert(
        "0x0".to_string(),
        "0x00000000000000000000000034cfac646f301356faa8b21e94227e3583fe3f5f".to_string()
    );

    let resolver = GnosisSafeProxyResolver(BaseProxyResolver::new("GnosisSafeProxy"));
    let result = resolver.resolve(&provider, "0x655a9e6b044d6b62f393f9990ec3ea877e966e18", None).await.unwrap();
    assert_eq!(result, "0x34cfac646f301356faa8b21e94227e3583fe3f5f");
}

#[tokio::test]
async fn test_eip1967_proxy_resolve() {
    let mut provider = MockProvider::new();
    provider.storage.insert(
        SLOTS::EIP1967_IMPL.to_string(),
        "0x0000000000000000000000007d657ddcf7e2a5fd118dc8a6ddc3dc308adc2728".to_string()
    );

    let resolver = EIP1967ProxyResolver(BaseProxyResolver::new("EIP1967Proxy"));
    let result = resolver.resolve(&provider, "0xff1f2b4adb9df6fc8eafecdcbf96a2b351680455", None).await.unwrap();
    assert_eq!(result, "0x7d657ddcf7e2a5fd118dc8a6ddc3dc308adc2728");
}

#[tokio::test]
async fn test_slots_add_slot_offset() {
    use whatsabi_rs::slots::add_slot_offset;
    let slot = "0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131b";
    let got = add_slot_offset(slot, 2);
    let want = "0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131d";
    assert_eq!(got, want);
}

#[tokio::test]
async fn test_slots_join_slot() {
    use whatsabi_rs::slots::join_slot;
    let got = join_slot(&[
        "0xf3acf6a03ea4a914b78ec788624b25cec37c14a4",
        "0xc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c"
    ]);
    let want = "0x42983d3cf213719a972df53d14775d9ca74cc01b862f850a60cf959f26ffe0a2";
    assert_eq!(got, want);
}

#[tokio::test]
async fn test_multiple_proxy_resolving() {
    // This test would require mocking multiple proxy types in a single bytecode
    // For now, we'll test the disasm function can handle complex bytecode
    let bytecode = "0x3660006000376110006000366000732157a7894439191e520825fe9399ab8655e0f7085af41558576110006000f3";
    let program = disasm(bytecode);
    assert!(program.proxies.len() >= 1);
}
