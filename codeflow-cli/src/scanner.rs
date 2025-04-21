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
                let relative_path = path
                    .display()
                    .to_string()
                    .replace(&(dir.display().to_string() + "/"), "");

                files.push(ScannedFile {
                    path: relative_path,
                    content,
                });
            }
        }
    }

    Ok(files)
}
