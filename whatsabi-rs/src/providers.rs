use async_trait::async_trait;
use thiserror::Error;
use crate::utils::{bytes_to_hex};

#[derive(Debug, Error)]
pub enum ProviderError {
    #[error("Unsupported provider")] Unsupported,
    #[error("Missing ENS provider")] MissingEns,
    #[error("RPC error: {0}")] Rpc(String),
}

#[async_trait]
pub trait StorageProvider: Send + Sync {
    async fn get_storage_at(&self, address: &str, slot: &str) -> Result<String, ProviderError>;
}

#[async_trait]
pub trait CallProvider: Send + Sync {
    async fn call(&self, to: &str, data: &str) -> Result<String, ProviderError>;
}

#[async_trait]
pub trait CodeProvider: Send + Sync {
    async fn get_code(&self, address: &str) -> Result<String, ProviderError>;
}

#[async_trait]
pub trait EnsProvider: Send + Sync {
    async fn get_address(&self, name: &str) -> Result<String, ProviderError>;
}

pub trait Provider: StorageProvider + CallProvider + CodeProvider + EnsProvider {}
impl<T> Provider for T where T: StorageProvider + CallProvider + CodeProvider + EnsProvider {}

// Combined trait for object-safe usage in resolvers
pub trait StorageCallProvider: StorageProvider + CallProvider {}
impl<T> StorageCallProvider for T where T: StorageProvider + CallProvider {}

pub struct WithCachedCode<P: Provider> {
    inner: P,
    cache: std::collections::HashMap<String, String>,
}

impl<P: Provider> WithCachedCode<P> {
    pub fn new(inner: P, cache: std::collections::HashMap<String, String>) -> Self { Self { inner, cache } }
}

#[async_trait]
impl<P: Provider> CodeProvider for WithCachedCode<P> {
    async fn get_code(&self, address: &str) -> Result<String, ProviderError> {
        if let Some(code) = self.cache.get(address) { return Ok(code.clone()); }
        self.inner.get_code(address).await
    }
}

#[async_trait]
impl<P: Provider> StorageProvider for WithCachedCode<P> {
    async fn get_storage_at(&self, address: &str, slot: &str) -> Result<String, ProviderError> { self.inner.get_storage_at(address, slot).await }
}

#[async_trait]
impl<P: Provider> CallProvider for WithCachedCode<P> {
    async fn call(&self, to: &str, data: &str) -> Result<String, ProviderError> { self.inner.call(to, data).await }
}

#[async_trait]
impl<P: Provider> EnsProvider for WithCachedCode<P> {
    async fn get_address(&self, name: &str) -> Result<String, ProviderError> { self.inner.get_address(name).await }
}

// Minimal JSON-RPC provider over a generic transport function closure.
pub struct JsonRpcProvider<T>
where T: Send + Sync + 'static + Fn(&str, serde_json::Value) -> std::pin::Pin<Box<dyn std::future::Future<Output=Result<serde_json::Value, String>> + Send>> {
    transport: T,
}

impl<T> JsonRpcProvider<T>
where T: Send + Sync + 'static + Fn(&str, serde_json::Value) -> std::pin::Pin<Box<dyn std::future::Future<Output=Result<serde_json::Value, String>> + Send>> {
    pub fn new(transport: T) -> Self { Self { transport } }
}

#[async_trait]
impl<T> StorageProvider for JsonRpcProvider<T>
where T: Send + Sync + 'static + Fn(&str, serde_json::Value) -> std::pin::Pin<Box<dyn std::future::Future<Output=Result<serde_json::Value, String>> + Send>> {
    async fn get_storage_at(&self, address: &str, slot: &str) -> Result<String, ProviderError> {
        let params = serde_json::json!([address, slot, "latest"]);
        let v = (self.transport)("eth_getStorageAt", params).await.map_err(ProviderError::Rpc)?;
        Ok(v.as_str().unwrap_or_default().to_string())
    }
}

#[async_trait]
impl<T> CallProvider for JsonRpcProvider<T>
where T: Send + Sync + 'static + Fn(&str, serde_json::Value) -> std::pin::Pin<Box<dyn std::future::Future<Output=Result<serde_json::Value, String>> + Send>> {
    async fn call(&self, to: &str, data: &str) -> Result<String, ProviderError> {
        let tx = serde_json::json!({"from": "0x0000000000000000000000000000000000000001", "to": to, "data": data});
        let v = (self.transport)("eth_call", serde_json::json!([tx, "latest"]))
            .await.map_err(ProviderError::Rpc)?;
        Ok(v.as_str().unwrap_or_default().to_string())
    }
}

#[async_trait]
impl<T> CodeProvider for JsonRpcProvider<T>
where T: Send + Sync + 'static + Fn(&str, serde_json::Value) -> std::pin::Pin<Box<dyn std::future::Future<Output=Result<serde_json::Value, String>> + Send>> {
    async fn get_code(&self, address: &str) -> Result<String, ProviderError> {
        let v = (self.transport)("eth_getCode", serde_json::json!([address, "latest"]))
            .await.map_err(ProviderError::Rpc)?;
        Ok(v.as_str().unwrap_or_default().to_string())
    }
}

#[async_trait]
impl<T> EnsProvider for JsonRpcProvider<T>
where T: Send + Sync + 'static + Fn(&str, serde_json::Value) -> std::pin::Pin<Box<dyn std::future::Future<Output=Result<serde_json::Value, String>> + Send>> {
    async fn get_address(&self, _name: &str) -> Result<String, ProviderError> { Err(ProviderError::MissingEns) }
}


