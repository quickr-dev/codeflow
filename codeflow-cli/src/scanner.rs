use anyhow::Result;
use ignore::Walk;
use regex::Regex;
use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
pub struct Annotation {
    pub file: String,
    pub line: String,
    pub annotation: String,
}

#[derive(Serialize)]
pub struct ScannedFile {
    pub path: String,
    pub content: String,
}

pub fn scan_directory(dir: &Path) -> Result<(Vec<Annotation>, Vec<ScannedFile>)> {
    let mut annotations = Vec::new();
    let mut files = Vec::new();

    for result in Walk::new(dir) {
        let entry = result?;
        let path = entry.path();
        if path.is_dir() {
            continue;
        }
        let content = fs::read_to_string(path)?;

        annotations.extend(extract_file_annotations(
            path.display().to_string(),
            &content,
        ));

        files.push(ScannedFile {
            path: path.display().to_string(),
            content,
        });
    }

    Ok((annotations, files))
}

fn extract_file_annotations(file: String, content: &str) -> Vec<Annotation> {
    let mut annotations = Vec::new();
    if !content.contains("@codeflow") {
        return annotations;
    }

    let re = Regex::new(r".*@codeflow\s*([^\s]+).*").unwrap();
    for (line_number, line_content) in content.lines().enumerate() {
        if line_content.contains("@codeflow") {
            annotations.push(Annotation {
                file: file.clone(),
                line: (line_number + 1).to_string(),
                annotation: re.replace(line_content, "$1").to_string(),
            });
        }
    }
    annotations
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_file_annotations() {
        let file = "App.tsx".to_string();
        let content = r#"Some code here.
          // @codeflow nodes->diagram
          export const initialNodes = [
            { id: "1", data: { title: "Node 1" } },
            { id: "2", data: { title: "Node 2" } },
          ]

          // @codeflow edges->diagram
          export const initialEdges = [
            { id: "1", source: "1", target: "2" },
          ]

          export function App() {
            return (
              {/* @codeflow diagram */}
              <ReactFlow />
            )
        }"#;

        let annotations = extract_file_annotations(file, content);

        assert_eq!(annotations.len(), 3);

        assert_eq!(annotations[0].file, "App.tsx");
        assert_eq!(annotations[0].line, "2");
        assert_eq!(annotations[0].annotation, "nodes->diagram");

        // Check second annotation
        assert_eq!(annotations[1].file, "App.tsx");
        assert_eq!(annotations[1].line, "8");
        assert_eq!(annotations[1].annotation, "edges->diagram");

        // Check third annotation
        assert_eq!(annotations[2].file, "App.tsx");
        assert_eq!(annotations[2].line, "15");
        assert_eq!(annotations[2].annotation, "diagram");
    }
}
