import { describe, expect, it } from "bun:test";
import { buildAnnotations, getAnnotations } from "./file-annotations";

describe("getAnnotations", () => {
  it("should extract codeflow annotations from a Rust file", () => {
    const projectFile = {
      path: "path/to/scan.rs",
      content: `// @codeflow(cli->start#1)
use anyhow::Result;

// @codeflow(cli->scan#1)
pub fn scan() -> Result<()> {
    // @codeflow(cli->scan#2)
    Ok(())
}`,
    };

    const result = getAnnotations(projectFile);

    expect(result).toEqual({
      "cli->start": [
        {
          path: "cli->start",
          step: 1,
          lineNumber: 1,
          filePath: "path/to/scan.rs",
        },
      ],
      "cli->scan": [
        {
          path: "cli->scan",
          step: 1,
          lineNumber: 4,
          filePath: "path/to/scan.rs",
        },
        {
          path: "cli->scan",
          step: 2,
          lineNumber: 6,
          filePath: "path/to/scan.rs",
        },
      ],
    });
  });

  it("should handle files with no annotations", () => {
    const projectFile = {
      path: "path/to/empty.rs",
      content: `use anyhow::Result;

pub fn empty() -> Result<()> {
    Ok(())
}`,
    };

    const result = getAnnotations(projectFile);

    expect(result).toEqual({});
  });
});

describe("buildAnnotations", () => {
  it("should combine annotations from multiple files", () => {
    const projectFiles = [
      {
        path: "path/to/scan.rs",
        content: `// @codeflow(cli->start#1)
use anyhow::Result;

// @codeflow(cli->scan#1)
pub fn scan() -> Result<()> {
    // @codeflow(cli->scan#2)
    Ok(())
}`,
      },
      {
        path: "path/to/main.rs",
        content: `// @codeflow(cli->start#2)
fn main() {
    // @codeflow(cli->start#3)
    println!("Hello, world!");
}`,
      },
    ];

    const result = buildAnnotations(projectFiles);

    expect(result).toEqual({
      "cli->start": [
        {
          path: "cli->start",
          step: 1,
          lineNumber: 1,
          filePath: "path/to/scan.rs",
        },
        {
          path: "cli->start",
          step: 2,
          lineNumber: 1,
          filePath: "path/to/main.rs",
        },
        {
          path: "cli->start",
          step: 3,
          lineNumber: 3,
          filePath: "path/to/main.rs",
        },
      ],
      "cli->scan": [
        {
          path: "cli->scan",
          step: 1,
          lineNumber: 4,
          filePath: "path/to/scan.rs",
        },
        {
          path: "cli->scan",
          step: 2,
          lineNumber: 6,
          filePath: "path/to/scan.rs",
        },
      ],
    });
  });

  it("should handle empty project files array", () => {
    const result = buildAnnotations([]);
    expect(result).toEqual({});
  });

  it("should sort annotations by step number", () => {
    const projectFiles = [
      {
        path: "path/to/file1.rs",
        content: `// @codeflow(cli->flow#3)
// @codeflow(cli->flow#1)`,
      },
      {
        path: "path/to/file2.rs",
        content: "// @codeflow(cli->flow#2)",
      },
    ];

    const result = buildAnnotations(projectFiles);

    expect(result["cli->flow"]).toEqual([
      {
        path: "cli->flow",
        step: 1,
        lineNumber: 2,
        filePath: "path/to/file1.rs",
      },
      {
        path: "cli->flow",
        step: 2,
        lineNumber: 1,
        filePath: "path/to/file2.rs",
      },
      {
        path: "cli->flow",
        step: 3,
        lineNumber: 1,
        filePath: "path/to/file1.rs",
      },
    ]);
  });
});
