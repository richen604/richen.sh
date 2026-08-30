import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import ErrorBoundary from "./components/ErrorBoundary";
import "./app/globals.css";
import { TerminalStoreProvider } from "./app/providers/TerminalStoreProvider";
import { displayAtom, store } from "./app/store";
import ContactPage from "./views/ContactPage";
import HomePage from "./views/HomePage";
import ProjectsPage from "./views/ProjectsPage";

const routes: Record<string, React.ComponentType> = {
  "/": HomePage,
  "/contact": ContactPage,
  "/projects": ProjectsPage,
};

const pathname = window.location.pathname.replace(/\/$/, "") || "/";
const Page = routes[pathname] ?? HomePage;

Object.keys(routes)
  .filter((route) => route !== pathname)
  .forEach((route) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = route === "/" ? "/" : `${route}/`;
    link.as = "document";
    document.head.append(link);
  });

const resetTerminal = () => {
  store.set(displayAtom, []);
  window.location.reload();
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary onReset={resetTerminal}>
      <TerminalStoreProvider>
        <Page />
      </TerminalStoreProvider>
    </ErrorBoundary>
  </StrictMode>,
);
