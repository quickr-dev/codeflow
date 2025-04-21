import type { ProjectFile } from "@schemas";

interface CodeFlowAnnotation {
	step: number;
	lineNumber: number;
	filePath: string;
}

export interface AnnotationsMap {
	[key: string]: CodeFlowAnnotation[];
}

export function buildAnnotations(projectFiles: ProjectFile[]): AnnotationsMap {
	return projectFiles.reduce<AnnotationsMap>((map, file) => {
		Object.assign(map, getAnnotations(file));
		return map;
	}, {});
}

export function getAnnotations(file: ProjectFile): AnnotationsMap {
	const annotations: AnnotationsMap = {};
	const lines = file.content.split("\n");

	lines.forEach((line, index) => {
		const match = line.match(/@codeflow\(([^)]+)\)/);
		if (match) {
			const [path, stepStr] = match[1].split("#");
			const step = Number.parseInt(stepStr, 10);

			if (!annotations[path]) {
				annotations[path] = [];
			}

			annotations[path].push({
				step,
				lineNumber: index + 1,
				filePath: file.path,
			});
		}
	});

	return annotations;
}
