export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<title>Codeflow</title>
			</head>
			<body>{children}</body>
		</html>
	);
}
