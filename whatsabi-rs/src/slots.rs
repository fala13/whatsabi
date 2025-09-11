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
    let slot_clean = slot.trim_start_matches("0x");

    // Handle 32-byte slots (64 hex characters)
    if slot_clean.len() == 64 {
        // Parse as big-endian bytes, add offset, format back
        let mut bytes = [0u8; 32];
        for i in 0..32 {
            bytes[i] = u8::from_str_radix(&slot_clean[i*2..i*2+2], 16).unwrap_or(0);
        }

        // Add offset to the last 16 bytes (u128)
        let mut last_16 = [0u8; 16];
        last_16.copy_from_slice(&bytes[16..32]);
        let num = u128::from_be_bytes(last_16);
        let new_num = num + offset;
        let new_bytes = new_num.to_be_bytes();

        // Replace the last 16 bytes
        bytes[16..32].copy_from_slice(&new_bytes);

        // Format back to hex
        let mut result = String::from("0x");
        for byte in bytes.iter() {
            result.push_str(&format!("{:02x}", byte));
        }
        result
    } else if slot_clean.len() <= 32 {
        // Handle smaller slots as before
        let n = u128::from_str_radix(slot_clean, 16).unwrap_or(0);
        format!("0x{:x}", n + offset)
    } else {
        // For very large slots, just return as-is for now
        slot.to_string()
    }
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


