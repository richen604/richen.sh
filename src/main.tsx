import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

import ErrorBoundary from "./components/ErrorBoundary";
import "./blog/blog.css";
import { adoptPost } from "./blog/registry";
import { TerminalStoreProvider } from "./app/providers/TerminalStoreProvider";
import { displayAtom, store } from "./app/store";
import Navigation from "./navigation";

const resetTerminal = () => {
  store.set(displayAtom, []);
  window.location.reload();
};

const root = document.getElementById("root")!;
const bootstrap = document.getElementById("terminal-bootstrap");
// A document load restores saved home output or the route's clean direct view.
// In-app command output ranges belong only to the current navigation session.
const canonicalURL = new URL(window.location.href);
if (bootstrap) {
  // Reloads/direct entries are clean views, even when reached by a saved command.
  canonicalURL.pathname = canonicalURL.pathname.replace(/\/index\.html$/, "/");
}
window.history.replaceState({ terminal: false }, "", canonicalURL);
if (bootstrap) adoptPost();
const app = (
  <StrictMode>
    <ErrorBoundary onReset={resetTerminal}>
      <TerminalStoreProvider>
        <Navigation />
      </TerminalStoreProvider>
    </ErrorBoundary>
  </StrictMode>
);
if (bootstrap) hydrateRoot(root, app);
else createRoot(root).render(app);
