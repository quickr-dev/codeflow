use anyhow::Result;
use ignore::Walk;
use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
pub struct ScannedFile {
    pub path: String,
    pub content: String,
}

// @codeflow(cli->push#3)
/// Scans a directory for files containing the @codeflow annotation
pub fn scan_directory(dir: &Path) -> Result<Vec<ScannedFile>> {
    let mut files = Vec::new();

    for result in Walk::new(dir) {
        let entry = result?;
        let path = entry.path();
        if path.is_file() {
            let content = fs::read_to_string(path)?;

            if content.contains("@codeflow") {
                files.push(ScannedFile {
                    path: path.display().to_string(),
                    content,
                });
            }
        }
    }

    Ok(files)
}
