import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import ErrorBoundary from "./components/ErrorBoundary";
import "./app/globals.css";
import { TerminalStoreProvider } from "./app/providers/TerminalStoreProvider";
import { displayAtom, store } from "./app/store";
import Navigation from "./navigation";

const resetTerminal = () => {
  store.set(displayAtom, []);
  window.location.reload();
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary onReset={resetTerminal}>
      <TerminalStoreProvider>
        <Navigation />
      </TerminalStoreProvider>
    </ErrorBoundary>
  </StrictMode>,
);
