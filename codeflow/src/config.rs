use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub api_key: String,
}

/// Read config file containing the API key
pub fn read_config() -> Result<Config> {
    let home_dir = dirs::home_dir().context("Could not determine home directory")?;
    let config_path = home_dir.join(".codeflow");

    let content =
        fs::read_to_string(config_path).context("Failed to read config file at ~/.codeflow")?;

    let api_key = content.trim().to_string();
    Ok(Config { api_key })
}
