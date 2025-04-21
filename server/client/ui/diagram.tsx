import mermaid from "mermaid";
import { useEffect } from "react";

declare global {
	interface Window {
		didClickLeafNode: (nodeId: string) => void;
	}
}

// @codeflow(diagram->view#6)
export function Diagram({ mermaidString }: { mermaidString: string }) {
	useEffect(() => {
		console.log(">>> here");
		window.didClickLeafNode = (nodeId: string) => {
			location.href = `?node=${nodeId}`;
		};

		mermaid.initialize({
			startOnLoad: true,
			securityLevel: "loose",
			theme: "default",
			flowchart: {
				useMaxWidth: true,
				htmlLabels: true,
				curve: "cardinal",
			},
		});
	}, []);

	return (
		<div>
			<pre className="mermaid">{mermaidString}</pre>
		</div>
	);
}
