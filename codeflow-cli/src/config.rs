use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::{fs, path::Path};

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub project: String,
}

// @codeflow(cli->init#3)
/// Read config file from project directory
pub fn create_config(dir: &Path) -> Result<()> {
    let config_path = dir.join(".codeflow.json");
    let config = Config {
        project: "".to_string(),
    };
    let config_str = serde_json::to_string(&config).context("Failed to serialize config")?;
    fs::write(&config_path, config_str).context("Failed to write config file")?;

    Ok(())
}

// @codeflow(cli->push#4)
/// Read config file from project directory
pub fn read_config(dir: &Path) -> Result<Config> {
    let config_path = dir.join(".codeflow.json");
    let config_str = fs::read_to_string(&config_path).context("Failed to read config file")?;
    let config: Config = serde_json::from_str(&config_str).context("Failed to parse config")?;

    Ok(config)
}
