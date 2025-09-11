use crate::utils::{keccak256_hex};

pub fn join_slot(parts: &[&str]) -> String {
    let mut s = String::from("0x");
    for p in parts {
        let mut v = (*p).to_string();
        if let Some(stripped) = v.strip_prefix("0x") { v = stripped.to_string(); }
        s.push_str(&format!("{:0>64}", v));
    }
    keccak256_hex(&s)
}

pub fn add_slot_offset(slot: &str, offset: u128) -> String {
    let n = u128::from_str_radix(slot.trim_start_matches("0x"), 16).unwrap();
    format!("0x{:x}", n + offset)
}

pub async fn read_array<P>(provider: &P, address: &str, pos: &str, width: usize) -> Result<Vec<String>, P::Error>
where P: ReadArrayProvider {
    let num_hex = provider.get_storage_at(address, pos).await?;
    let num = usize::from_str_radix(num_hex.trim_start_matches("0x"), 16).unwrap_or(0);
    let start = keccak256_hex(&pos.to_string());
    let items_per_word = 32 / width;
    let mut words = Vec::new();
    for i in 0..num {
        let item_slot = add_slot_offset(&start, (i / items_per_word) as u128);
        words.push(provider.get_storage_at(address, &item_slot).await?);
    }
    Ok(words.into_iter().enumerate().map(|(i, word_hex)| {
        let item_offset = 2 + 64 - ((i % items_per_word + 1) * width * 2);
        word_hex[item_offset..item_offset + width * 2].to_string()
    }).collect())
}

#[async_trait::async_trait]
pub trait ReadArrayProvider {
    type Error;
    async fn get_storage_at(&self, address: &str, slot: &str) -> Result<String, Self::Error>;
}


