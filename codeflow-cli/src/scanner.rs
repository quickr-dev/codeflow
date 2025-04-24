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
pub fn scan_directory(dir: &Path) -> Result<(Vec<ScannedFile>, i32)> {
    let mut files = Vec::new();
    let mut scanned_files = 0;

    for result in Walk::new(dir) {
        scanned_files += 1;

        let entry = result?;
        let path = entry.path();
        if path.is_file() {
            // Ignore binary files
            let content = match fs::read_to_string(path) {
                Ok(text) => text,
                Err(_) => {
                    // println!("Ignored {}", path.display());
                    continue;
                }
            };

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

    Ok((files, scanned_files))
}
