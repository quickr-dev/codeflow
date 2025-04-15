use anyhow::{Context, Result};
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};
use serde::Serialize;

use crate::scanner::{Annotation, ScannedFile};

#[derive(Serialize)]
struct Data {
    annotations: Vec<Annotation>,
    files: Vec<ScannedFile>,
}

pub fn send_to_api(
    annotations: Vec<Annotation>,
    files: Vec<ScannedFile>,
    api_key: &str,
) -> Result<()> {
    let client = reqwest::blocking::Client::new();

    let mut headers = HeaderMap::new();
    let auth_value = format!("Bearer {}", api_key);
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&auth_value).context("Invalid authorization header value")?,
    );

    let response = client
        .post("http://localhost:3000/new")
        .headers(headers)
        .json(&Data { annotations, files })
        .send()
        .context("Failed to send data to API")?;

    if !response.status().is_success() {
        anyhow::bail!("API request failed with status: {}", response.status());
    }

    Ok(())
}
