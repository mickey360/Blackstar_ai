//! High-speed deterministic transforms used as a portable reference implementation.
pub fn dedupe_strings(items: &[String]) -> Vec<String> {
    let mut out=Vec::new();
    for item in items { if !out.contains(item) { out.push(item.clone()); } }
    out
}
pub fn numeric_sum(items: &[f64]) -> f64 { items.iter().sum() }
