import { useEffect, useState } from "react";

import ContactPage from "./views/ContactPage";
import HomePage from "./views/HomePage";
import ProjectsPage from "./views/ProjectsPage";

type RoutePath = "/" | "/contact/" | "/projects/";

interface Route {
  component: React.ComponentType;
  metadata: {
    title: string;
    description: string;
    keywords?: string;
    canonical: `https://richen.sh${RoutePath}`;
  };
}

const routes: Record<RoutePath, Route> = {
  "/": {
    component: HomePage,
    metadata: {
      title: "richen.sh",
      description: "rm -rf /",
      canonical: "https://richen.sh/",
    },
  },
  "/contact/": {
    component: ContactPage,
    metadata: {
      title: "Contact - richen.sh",
      description: "Get in touch with me for collaborations, opportunities, or just to chat about technology",
      keywords: "contact, email, collaboration, software developer",
      canonical: "https://richen.sh/contact/",
    },
  },
  "/projects/": {
    component: ProjectsPage,
    metadata: {
      title: "Projects - richen.sh",
      description: "Explore my software development projects and portfolio",
      keywords: "projects, portfolio, software development, web development",
      canonical: "https://richen.sh/projects/",
    },
  },
};

function routePath(pathname: string): RoutePath | null {
  if (pathname === "/") return "/";
  if (pathname === "/contact" || pathname === "/contact/") return "/contact/";
  if (pathname === "/projects" || pathname === "/projects/") return "/projects/";
  return null;
}

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

function updateMetadata(route: Route) {
  const { metadata } = route;
  document.title = metadata.title;
  setMeta('meta[name="description"]', "name", "description", metadata.description);
  setMeta('meta[property="og:title"]', "property", "og:title", metadata.title);
  setMeta('meta[property="og:description"]', "property", "og:description", metadata.description);
  setMeta('meta[property="og:url"]', "property", "og:url", metadata.canonical);
  setMeta('meta[name="twitter:title"]', "name", "twitter:title", metadata.title);
  setMeta('meta[name="twitter:description"]', "name", "twitter:description", metadata.description);

  const keywords = document.head.querySelector<HTMLMetaElement>('meta[name="keywords"]');
  if (metadata.keywords) {
    setMeta('meta[name="keywords"]', "name", "keywords", metadata.keywords);
  } else {
    keywords?.remove();
  }

  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = metadata.canonical;
}

export default function Navigation() {
  const initialPath = routePath(window.location.pathname) ?? "/";
  const [path, setPath] = useState<RoutePath>(initialPath);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;

      const destination = new URL(anchor.href, window.location.href);
      const destinationPath = routePath(destination.pathname);
      if (destination.origin !== window.location.origin || !destinationPath) return;

      event.preventDefault();
      if (destination.href === window.location.href) return;

      window.history.pushState(null, "", destination);
      setPath(destinationPath);
    };

    const handlePopState = () => {
      const nextPath = routePath(window.location.pathname);
      if (nextPath) setPath(nextPath);
    };

    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    updateMetadata(routes[path]);
  }, [path]);

  const Page = routes[path].component;
  return <Page />;
}
