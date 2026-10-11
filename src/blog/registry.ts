import { posts } from "virtual:blog";
export { posts };

type CachedPost = { html?: string; node?: HTMLElement };
const loaded = new Map<string, CachedPost>();
type PostRequest = {
  controller: AbortController;
  foreground: number;
  started: boolean;
  consumers: Set<{ resolve: (html: string) => void; reject: (error: unknown) => void }>;
};
const pending = new Map<string, PostRequest>();
const maxBytes = 16 * 1024 * 1024;
let detached: CachedPost | undefined;
const postPath = (slug: string) => slug ? `/blog/${slug}/` : "/blog/";
export function getPost(slug = "", path = postPath(slug)) { return loaded.get(path)?.node; }
export function adoptPost() {
  const island = document.querySelector<HTMLElement>("[data-blog-island]");
  if (island) loaded.set(location.pathname, { node: island });
}

function checkPath(slug: string, path: string) {
  if (slug && !posts.some(post => post.slug === slug)) throw new Error("Post not found");
  if (path !== postPath(slug)) throw new Error("Invalid blog path");
}

function remember(path: string, value: CachedPost) {
  if ((value.html?.length ?? 0) * 2 > maxBytes) value.html = undefined;
  loaded.delete(path);
  loaded.set(path, value);
  let bytes = [...loaded.values()].reduce((total, entry) => total + (entry.html?.length ?? 0) * 2, 0);
  for (const [key, entry] of loaded) {
    if (bytes <= maxBytes && loaded.size <= 8) break;
    bytes -= (entry.html?.length ?? 0) * 2;
    loaded.delete(key);
  }
}

function backgroundAllowed() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !connection?.saveData && !["slow-2g", "2g", "3g"].includes(connection?.effectiveType ?? "");
}

async function fetchDocument(path: string, signal: AbortSignal, foreground: boolean) {
  const response = await fetch(path, { signal, credentials: "same-origin", cache: "no-cache", priority: foreground ? "high" : "low" });
  if (!response.ok || new URL(response.url).origin !== location.origin || new URL(response.url).pathname !== path || !response.headers.get("content-type")?.includes("text/html")) throw new Error("Unable to load post");
  const html = await response.text();
  signal.throwIfAborted();
  remember(path, { ...loaded.get(path), html });
  return html;
}

function cancelRequest(path: string, request: PostRequest) {
  if (pending.get(path) !== request) return;
  pending.delete(path);
  request.controller.abort();
  for (const consumer of request.consumers) consumer.reject(request.controller.signal.reason);
}

function startRequests() {
  // ponytail: two global foreground slots; per-origin limits only if needed.
  let slots = 2 - [...pending.values()].filter(request => request.started).length;
  // Newest foreground consumer first; speculation never queues behind clicks.
  for (const [path, request] of [...pending].reverse()) {
    if (slots <= 0) break;
    if (request.started) continue;
    request.started = true;
    slots--;
    const finish = () => {
      if (pending.get(path) === request) pending.delete(path);
    };
    void fetchDocument(path, request.controller.signal, request.foreground > 0).then(
      html => { finish(); for (const consumer of request.consumers) consumer.resolve(html); },
      error => { finish(); for (const consumer of request.consumers) consumer.reject(error); },
    );
  }
}

/** Share work, but release each consumer immediately on abort or settlement. */
function rawPost(path: string, foreground: boolean, signal?: AbortSignal) {
  signal?.throwIfAborted();
  if (foreground) {
    for (const [key, request] of pending) {
      if (key !== path && !request.foreground) cancelRequest(key, request);
    }
  }
  const cached = loaded.get(path);
  if (cached?.html !== undefined) { remember(path, cached); return Promise.resolve(cached.html); }
  let request = pending.get(path);
  if (!request) {
    request = { controller: new AbortController(), foreground: 0, started: false, consumers: new Set() };
    pending.set(path, request);
  }
  const shared = request;
  if (foreground) {
    shared.foreground++;
    pending.delete(path);
    pending.set(path, shared);
  }
  const result = new Promise<string>((resolve, reject) => {
    const release = () => {
      if (!shared.consumers.delete(consumer)) return;
      signal?.removeEventListener("abort", abort);
      if (foreground) shared.foreground--;
      if (!shared.consumers.size) cancelRequest(path, shared);
      startRequests();
    };
    const abort = () => {
      release();
      const reason: unknown = signal?.reason;
      reject(reason instanceof Error ? reason : new DOMException("Aborted", "AbortError"));
    };
    const consumer = {
      resolve: (html: string) => { release(); resolve(html); },
      reject: (error: unknown) => { release(); reject(error instanceof Error ? error : new Error("Unable to load post")); },
    };
    shared.consumers.add(consumer);
    signal?.addEventListener("abort", abort, { once: true });
  });
  startRequests();
  return result;
}

/** Speculation fetches strings only: no parsing or large detached trees at idle. */
export function prefetchPost(slug: string) {
  if (!slug || !backgroundAllowed()) return;
  const path = postPath(slug);
  const cached = loaded.get(path);
  if (cached?.node || cached?.html !== undefined || [...pending.values()].some(request => !request.controller.signal.aborted)) return;
  checkPath(slug, path);
  void rawPost(path, false).catch(() => { /* Speculation must never surface an error. */ });
}

export function prefetchNewest() {
  const newest = posts[0];
  if (!newest || !backgroundAllowed()) return () => { /* Nothing scheduled. */ };
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(() => prefetchPost(newest.slug));
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(() => prefetchPost(newest.slug), 200);
  return () => clearTimeout(id);
}

/** Only same-origin repository-generated documents may supply static markup. */
export async function loadPost(slug = "", signal?: AbortSignal, path = postPath(slug)) {
  checkPath(slug, path);
  signal?.throwIfAborted();
  const cached = loaded.get(path)?.node;
  if (cached) return cached;
  const html = await rawPost(path, true, signal);
  signal?.throwIfAborted();
  // Concurrent consumers share both the fetch and the first validated parse.
  const prepared = loaded.get(path)?.node;
  if (prepared) return prepared;
  let node: HTMLElement;
  try { node = parseIsland(html, path, slug); }
  catch (error) { loaded.delete(path); throw error; }
  const entry = { html, node };
  remember(path, entry);
  if (slug) retainDetached(entry);
  return node;
}

function parseIsland(html: string, path: string, slug: string) {
  // Template parsing stays inert, including image/preload fetches. Validate URLs
  // before any document nodes become connected to the live page.
  const template = document.createElement("template");
  template.innerHTML = html;
  const bootstrap = template.content.querySelector("#terminal-bootstrap");
  const island = template.content.querySelector<HTMLElement>("[data-blog-island]");
  const state: unknown = JSON.parse(bootstrap?.textContent ?? "{}");
  if (!bootstrap || !island || island.tagName !== "DIV" || template.content.querySelectorAll("[data-blog-island]").length !== 1 || typeof state !== "object" || state === null || !("path" in state) || state.path !== path || island.dataset.blogIsland !== slug) throw new Error("Invalid blog document");
  // Not a general HTML sanitizer: repository MDX is trusted executable content.
  // Reject active document markup and unexpected resource/navigation origins.
  if (island.querySelector("script,iframe,object,embed,base,form")) throw new Error("Invalid blog content");
  for (const element of [island, ...island.querySelectorAll("*")]) {
    for (const attribute of element.attributes) {
      if (/^on/i.test(attribute.name)) throw new Error("Invalid blog handler");
      if (attribute.name === "srcset") throw new Error("Blog srcset is not supported");
      if (["src", "href", "xlink:href", "poster", "action"].includes(attribute.name)) {
        const url = new URL(attribute.value, location.origin + path);
        const link = attribute.name === "href" && element.tagName.toLowerCase() === "a";
        if (!["http:", "https:", ...(link ? ["mailto:"] : [])].includes(url.protocol) || (!link && url.origin !== location.origin)) throw new Error("Invalid blog URL");
      }
    }
  }
  return island;
}

function retainDetached(entry: CachedPost) {
  if (detached && detached !== entry && !detached.node?.isConnected) detached.node = undefined;
  detached = entry;
}

/** React owns the shell; this module alone owns its static children. */
export function attachPost(path: string, host: HTMLElement, prepared: HTMLElement) {
  const entry = loaded.get(path) ?? { node: prepared };
  const source = entry.node ?? prepared;
  if (source !== host) {
    // Another transcript entry may still display this post. Never steal its nodes.
    const content = source.isConnected ? source.cloneNode(true) : source;
    const fragment = document.createDocumentFragment();
    while (content.firstChild) fragment.append(content.firstChild);
    host.replaceChildren(fragment);
  }
  entry.node = host;
  remember(path, entry);
  if (detached === entry) detached = undefined;
  return () => {
    if (path !== "/blog/" && entry.node === host) retainDetached(entry);
  };
}
