import { useEffect, useState } from "react";

import ContactPage from "./views/ContactPage";
import HomePage from "./views/HomePage";
import ProjectsPage from "./views/ProjectsPage";
import CommandPage from "./views/CommandPage";
import { navigate, recognizeBlog, terminalHistoryEntry, terminalDisplayLength, terminalDisplayStart } from "./blog/routes";
import { posts, prefetchPost } from "./blog/registry";

type RoutePath = string;

interface Route {
  component: React.ComponentType;
  metadata: {
    title: string;
    description: string;
    keywords?: string;
    canonical: `https://richen.sh${RoutePath}`;
    date?: string;
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
      description: "Open-source projects by Richen",
      keywords: "open source, NixOS, Godot, projects",
      canonical: "https://richen.sh/projects/",
    },
  },
};

function routePath(pathname: string): RoutePath | null {
  if (pathname === "/") return "/";
  if (pathname === "/contact" || pathname === "/contact/") return "/contact/";
  if (pathname === "/projects" || pathname === "/projects/") return "/projects/";
  return recognizeBlog(pathname);
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
  setMeta('meta[property="og:type"]', "property", "og:type", metadata.date ? "article" : "website");
  if (metadata.date) setMeta('meta[property="article:published_time"]', "property", "article:published_time", `${metadata.date}T00:00:00Z`);
  else document.head.querySelector('meta[property="article:published_time"]')?.remove();
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

function DirectBlog({ path }: { path: string }) {
  const args = path.split("/")[2] ? [path.split("/")[2]] : [];
  return <CommandPage command="blog" args={args} path={path} />;
}

export default function Navigation() {
  const initialPath = routePath(window.location.pathname) ?? "/";
  const [path, setPath] = useState<RoutePath>(initialPath);
  const [terminal, setTerminal] = useState(terminalHistoryEntry);
  const [displayLength, setDisplayLength] = useState(terminalDisplayLength);
  const [displayStart, setDisplayStart] = useState(terminalDisplayStart);

  useEffect(() => {
    const handleIntent = (event: PointerEvent | FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      if (event.relatedTarget instanceof Node && anchor.contains(event.relatedTarget)) return;
      if (event instanceof PointerEvent && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const destination = new URL(anchor.href, window.location.href);
      const blog = recognizeBlog(destination.pathname);
      if (destination.origin === location.origin && blog) prefetchPost(blog.split("/")[2] ?? "");
    };
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
      // Native navigation preserves URL details and explicit error recovery.
      if (destination.hash || destination.search || window.location.hash || window.location.search || anchor.hasAttribute("data-reload")) return;

      event.preventDefault();
      if (destination.pathname === window.location.pathname && !terminalHistoryEntry()) return;
      navigate(destinationPath);
    };

    const handlePopState = () => {
      const nextPath = routePath(window.location.pathname);
      if (nextPath) { setPath(nextPath); setTerminal(terminalHistoryEntry()); setDisplayLength(terminalDisplayLength()); setDisplayStart(terminalDisplayStart()); }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("pointerover", handleIntent);
    document.addEventListener("focusin", handleIntent);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("terminal-navigation", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("pointerover", handleIntent);
      document.removeEventListener("focusin", handleIntent);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("terminal-navigation", handlePopState);
    };
  }, []);

  useEffect(() => {
    const post = posts.find((entry) => path.split("/")[2] === entry.slug);
    updateMetadata(routes[path] ?? { component: HomePage, metadata: {
      title: `${post?.metadata.title ?? "Blog"} | richen.sh`,
      description: post?.metadata.description ?? "Notes from the terminal. Written in MDX, published as static pages.",
      canonical: `https://richen.sh${path}`, date: post?.metadata.date,
    } });
  }, [path]);

  if (path.startsWith("/blog/")) return terminal ? <HomePage start={displayStart} limit={displayLength} /> : <DirectBlog key={path} path={path} />;
  if (path === "/") return <HomePage start={displayStart} compareArt />;
  const Page = routes[path]?.component ?? HomePage;
  return <Page />;
}
