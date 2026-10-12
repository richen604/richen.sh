import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import { brotliCompressSync, gzipSync, constants } from "node:zlib";
import { renderBlogPage, readPosts } from "./posts.tsx";
import { assetPath } from "./assets.ts";
import { fileURLToPath } from "node:url";

export function blogPlugin(root = process.cwd()): Plugin {
  let devServer: ViteDevServer | undefined;
  let source: ReturnType<typeof readPosts> | undefined;
  let generation = 0;
  const pages = new Map<string, Promise<{ html: string; gzip: Buffer; br: Buffer }>>();
  const posts = () => {
    if (!source) {
      const pending = readPosts(root, true, devServer ? (url) => devServer!.ssrLoadModule(url.startsWith("file:") ? fileURLToPath(url) : url) : undefined);
      source = pending;
      void pending.catch(() => { if (source === pending) source = undefined; });
    }
    return source;
  };
  const install = (server: ViteDevServer) => {
    devServer = server;
    server.watcher.add([resolve(root, "content/blog"), resolve(root, "content/assets/art"), resolve(root, "src/blog")]);
    server.watcher.on("all", (_event, file) => {
      if (file.split("/").some(part => part.startsWith(".terminal-art-"))) return;
      if (["content/blog", "content/assets/art", "src/blog", "src/app/components", "docs/fonts"].some((directory) => file === resolve(root, directory) || file.startsWith(resolve(root, directory) + "/")) || file === resolve(root, "src/app/globals.css") || server.moduleGraph.getModulesByFile(file)?.size) {
        source = undefined;
        generation++;
        pages.clear();
        server.moduleGraph.invalidateAll();
        server.ws.send({ type: "full-reload", path: "*" });
      }
    });
    server.middlewares.use((req, res, next) => {
      const url = new URL(req.url ?? "/", "http://localhost");
      if (url.pathname === "/blog-style" || url.pathname === "/blog-style/") {
        res.writeHead(302, { Location: "/blog/vancouver-hikes/", "Cache-Control": "no-store" });
        res.end();
        return;
      }
      if (url.pathname !== "/blog" && !url.pathname.startsWith("/blog/")) return next();
      void (async () => {
        // Only assets explicitly referenced by authored content are public.
        const asset = /^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(assets\/.+)$/.exec(url.pathname);
        if (asset) {
          const [, slug, name] = asset;
          const entries = await posts();
          const post = entries.find(post => post.slug === slug);
          await post?.load();
          if (post?.assets.includes(name)) {
            const data = await readFile(await assetPath(post.directory, name)).catch((error: NodeJS.ErrnoException) => {
              if (error.code === "ENOENT") return undefined;
              throw error;
            });
            if (data) {
              const type = name.endsWith(".svg") ? "image/svg+xml" : name.endsWith(".json") ? "application/json" :
                name.endsWith(".png") ? "image/png" : /\.jpe?g$/.test(name) ? "image/jpeg" : name.endsWith(".avif") ? "image/avif" : name.endsWith(".webp") ? "image/webp" : "application/octet-stream";
              res.writeHead(200, { "Content-Type": type }); res.end(req.method === "HEAD" ? undefined : data); return;
            }
          }
          res.writeHead(404, { "Content-Type": "text/plain" }); res.end("Asset not found"); return;
        }
        const revision = generation;
        const entries = await posts();
        const page = url.pathname.replace(/index\.html$/, "");
        if (page === "/blog") { res.writeHead(302, { Location: `/blog/${url.search}` }); res.end(); return; }
        const post = entries.find((post) => page === `/blog/${post.slug}/` || page === `/blog/${post.slug}`);
        if (post && !page.endsWith("/")) {
          res.writeHead(302, { Location: `/blog/${post.slug}/${url.search}` }); res.end(); return;
        }
        if (page === "/blog/" || post) {
          let pending = pages.get(page);
          if (!pending) {
            pending = renderBlogPage(entries, post?.slug, root)
              .then(html => server.transformIndexHtml(page, html))
              .then(html => ({ html, gzip: gzipSync(html), br: brotliCompressSync(html, { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } }) }));
            if (revision === generation) pages.set(page, pending);
            const current = pending;
            void pending.catch(() => { if (pages.get(page) === current) pages.delete(page); });
          }
          const output = await pending;
          const accepted = (req.headers["accept-encoding"] ?? "").split(",").map(value => {
            const [name, ...params] = value.trim().split(";");
            const quality = params.find(param => param.trim().startsWith("q="));
            const q = quality ? Number(quality.trim().slice(2)) : 1;
            return { name, q: Number.isFinite(q) && q >= 0 && q <= 1 ? q : 0 };
          });
          const quality = (name: string) => accepted.find(entry => entry.name === name)?.q ?? accepted.find(entry => entry.name === "*")?.q ?? 0;
          const preferred = output.br.length < output.gzip.length ? "br" : "gzip";
          const encoding = quality("br") > 0 && (quality("br") > quality("gzip") || (quality("br") === quality("gzip") && preferred === "br")) ? "br" : quality("gzip") > 0 ? "gzip" : undefined;
          const identity = accepted.find(entry => entry.name === "identity")?.q ?? (accepted.find(entry => entry.name === "*")?.q === 0 ? 0 : 1);
          if (!encoding && identity <= 0) { res.writeHead(406, { Vary: "Accept-Encoding" }); res.end(); return; }
          const data = encoding ? output[encoding] : Buffer.from(output.html);
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache", Vary: "Accept-Encoding", "Content-Length": data.length, ...(encoding ? { "Content-Encoding": encoding } : {}) });
          res.end(req.method === "HEAD" ? undefined : data); return;
        }
        res.writeHead(404, { "Content-Type": "text/plain" }); res.end("Post not found");
      })().catch((error: unknown) => {
        console.error(error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(`Blog generation failed; fix the source and reload.\n${String(error)}`);
      });
    });
  };
  return {
    name: "native-mdx-blog",
    resolveId(id) { if (id === "virtual:blog") return "\0virtual:blog"; },
    async load(id) {
      if (id !== "\0virtual:blog") return;
      const entries = await posts();
      for (const post of entries) this.addWatchFile(post.file);
      return `export const posts = ${JSON.stringify(entries.map(({ slug, metadata }) => ({ slug, metadata })))};`.replace(/</g, "\\u003c");
    },
    handleHotUpdate({ file }) {
      // Directory watcher handles add/delete/edit, including manually updated art.
      if (["content/blog", "content/assets/art"].some(directory => file.startsWith(resolve(root, directory) + "/"))) return [];
    },
    configureServer: install,
  };
}
