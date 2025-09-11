use tiny_keccak::{Hasher, Keccak};

pub fn hex_to_bytes(mut hexstr: &str) -> Result<Vec<u8>, String> {
    if let Some(stripped) = hexstr.strip_prefix("0x") { hexstr = stripped; }
    if hexstr.len() % 2 != 0 { return Err(format!("hex_to_bytes: odd length: {}", hexstr.len())); }
    let bytes_len = hexstr.len() / 2;
    let mut out = vec![0u8; bytes_len];
    for i in 0..bytes_len {
        let hi = u8::from_str_radix(&hexstr[i*2..i*2+1], 16).map_err(|e| e.to_string())?;
        let lo = u8::from_str_radix(&hexstr[i*2+1..i*2+2], 16).map_err(|e| e.to_string())?;
        out[i] = (hi << 4) | lo;
    }
    Ok(out)
}

pub fn bytes_to_hex(bytes: &[u8]) -> String {
    format!("0x{}", hex::encode(bytes))
}

pub fn bytes_to_hex_pad(bytes: &[u8], pad_to_bytes: usize) -> String {
    let mut s = hex::encode(bytes);
    if s.len() < pad_to_bytes * 2 { s = format!("{}{}", "0".repeat(pad_to_bytes*2 - s.len()), s); }
    format!("0x{}", s)
}

pub fn keccak256(data: impl AsRef<[u8]>) -> [u8; 32] {
    let mut hasher = Keccak::v256();
    hasher.update(data.as_ref());
    let mut out = [0u8; 32];
    hasher.finalize(&mut out);
    out
}

pub fn keccak256_hex(data: &str) -> String {
    if let Some(stripped) = data.strip_prefix("0x") {
        return bytes_to_hex(&keccak256(hex_to_bytes(stripped).expect("hex")));
    }
    bytes_to_hex(&keccak256(data.as_bytes()))
}

pub fn address_with_checksum(addr: &str) -> Result<String, String> {
    let lower = addr.trim_start_matches("0x").to_lowercase();
    if lower.len() != 40 { return Err("address length must be 40 hex chars".into()); }
    let mut expanded = [0u8; 40];
    for (i, ch) in lower.chars().enumerate() { expanded[i] = ch as u8; }
    let hash = keccak256(&expanded);
    let mut chars: Vec<char> = lower.chars().collect();
    for i in (0..40).step_by(2) {
        if (hash[i/2] >> 4) & 0x0f >= 8 { chars[i] = chars[i].to_ascii_uppercase(); }
        if (hash[i/2] & 0x0f) >= 8 { chars[i+1] = chars[i+1].to_ascii_uppercase(); }
    }
    Ok(format!("0x{}", chars.into_iter().collect::<String>()))
}


