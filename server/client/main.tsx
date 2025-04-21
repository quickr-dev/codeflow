import { hydrateRoot } from "react-dom/client";

const appElement = document.getElementById("app");
if (appElement) {
	hydrateRoot(appElement, <App />);
}
