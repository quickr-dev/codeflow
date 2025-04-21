import type { ProjectFile } from "../lib/schemas";

export function HomePage({ files }: { files: ProjectFile[] }) {
	return (
		<div>
			<h1>Home</h1>
			<p>{JSON.stringify(files, null, 2)}</p>
		</div>
	);
}
