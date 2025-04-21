import React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<React.StrictMode>
			<html lang="en">
				<head>
					<title>Codeflow</title>
				</head>
				<body>{children}</body>
			</html>
		</React.StrictMode>
	);
}
