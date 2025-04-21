import type { ProjectFile } from "@schemas";
import { describe, expect, it } from "bun:test";
import { getAnnotations } from "./file-annotations";

describe("projectFileToAnnotations", () => {
	it("should extract codeflow annotations from a Rust file", () => {
		const projectFile: ProjectFile = {
			project: "",
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
			"cli->start": [{ step: 1, lineNumber: 1, filePath: "path/to/scan.rs" }],
			"cli->scan": [
				{ step: 1, lineNumber: 4, filePath: "path/to/scan.rs" },
				{ step: 2, lineNumber: 6, filePath: "path/to/scan.rs" },
			],
		});
	});

	it("should handle files with no annotations", () => {
		const projectFile: ProjectFile = {
			project: "",
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
