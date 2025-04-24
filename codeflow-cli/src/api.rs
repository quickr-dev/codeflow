use anyhow::{Context, Result};
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};
use serde::Serialize;

use crate::{config::Config, scanner::ScannedFile};

#[derive(Serialize)]
struct Data {
    files: Vec<ScannedFile>,
}

// @codeflow(cli->init#4)
// @codeflow(cli->push#5)
pub fn send_to_api(files: Vec<ScannedFile>, config: &Config) -> Result<()> {
    let client = reqwest::blocking::Client::new();

    let mut headers = HeaderMap::new();
    let auth_value = format!("Bearer {}", "api_key");
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&auth_value).context("Invalid authorization header value")?,
    );

    let url = format!(
        "https://dev-codeflow.vercel.app/api/projects/{}/files",
        config.project
    );
    let response = client
        .post(url)
        .headers(headers)
        .json(&Data { files })
        .send()
        .context("Failed to send data to API")?;

    if !response.status().is_success() {
        anyhow::bail!("API request failed with status: {}", response.status());
    }

    Ok(())
}
