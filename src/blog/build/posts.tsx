import { readFile, readdir, mkdir, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { BlogLayout, type PostMetadata } from "../BlogLayout.tsx";
import { BlogContent } from "../BlogContent.tsx";
import { TerminalFrame } from "../../app/components/TerminalFrame.tsx";
import { CommandEntry } from "../../app/components/CommandEntry.tsx";
import { prepareText, pruneTextCache, type PreparedText } from "../art/prepared-text.ts";
import { mdxOptions } from "./mdx-options.ts";
import { assetPath, artworkPath } from "./assets.ts";

/** Dev imports use Vite's dependency-aware module cache, not Node's permanent cache. */
function devImports() {
  return (tree: unknown) => {
    function visit(value: unknown) {
      if (typeof value !== "object" || value === null) return;
      if (Array.isArray(value)) { value.forEach(visit); return; }
      const node = value as Record<string, unknown>;
      Object.values(node).forEach(visit);
      if (node.type !== "ImportExpression") return;
      const source = node.source;
      delete node.source;
      delete node.options;
      Object.assign(node, { type: "CallExpression", optional: false,
        callee: { type: "MemberExpression", computed: false, optional: false,
          object: { type: "MemberExpression", computed: true, optional: false, object: { type: "Identifier", name: "arguments" }, property: { type: "Literal", value: 0 } },
          property: { type: "Identifier", name: "importModule" } }, arguments: [source] });
    }
    visit(tree);
  };
}

export function validateSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid blog slug: ${slug}`);
}

export function validateMetadata(value: unknown): asserts value is PostMetadata {
  if (typeof value !== "object" || value === null) throw new Error("Post must export metadata");
  const metadata = value as Record<string, unknown>;
  for (const field of ["title", "description", "date"]) {
    if (typeof metadata[field] !== "string" || !metadata[field].trim()) throw new Error(`Missing metadata: ${field}`);
  }
  const date = String(metadata.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
    throw new Error(`Invalid publication date: ${date}`);
  }
}

export async function readPosts(root: string, lazy = false, importModule?: (url: string) => Promise<unknown>) {
  const cacheDirectory = join(root, ".cache/art");
  const activeCacheFiles = new Set<string>();
  const directories = [join(root, "content/blog")];
  const posts = (await Promise.all(directories.map(async (content) => {
    const entries = await readdir(content, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    return Promise.all(entries.filter((entry) => entry.isDirectory()).map(async (entry) => {
      const slug = entry.name;
      validateSlug(slug);
      const directory = join(content, slug);
      const file = join(directory, "index.mdx");
      // Trusted repository content only: evaluate executes author-written JS.
      const references = { art: new Set<string>(), assets: new Set<string>() };
      const text = await readFile(file, "utf8");
      async function evaluate(text: string) {
        const code = String(await compile(text, { ...mdxOptions(slug, references), outputFormat: "function-body", recmaPlugins: importModule ? [devImports] : [] }));
        return run(code, { ...runtime, baseUrl: pathToFileURL(file), ...{ importModule } });
      }
      // Metadata is a standalone MDX export block. Discovery never executes the
      // article or prepares its art; trusted repository JS runs only on demand.
      const metadataBlock = text.split(/\n\s*\n/).find(block => /^export const metadata\s*=/.test(block.trim()));
      if (!metadataBlock) throw new Error(`Post must export metadata in a standalone block: ${slug}`);
      const module = await evaluate(lazy ? metadataBlock : text);
      const metadata: unknown = module.metadata;
      validateMetadata(metadata);
      const artifacts: Record<string, PreparedText> = {};
      const dependencies: string[] = [];
      let pending: Promise<void> | undefined;
      const post = { slug, metadata, assets: [] as string[], dependencies, directory, file, module: { default: module.default, artifacts }, load: () => pending ??= prepare().catch((error: unknown) => { pending = undefined; throw error; }) };
      async function prepare() {
        if (lazy) {
          const evaluated = await evaluate(text);
          validateMetadata(evaluated.metadata);
          post.module.default = evaluated.default;
        }
        for (const name of references.art) {
           const file = await artworkPath(root, directory, name);
           const raw = await readFile(file, "utf8").catch((error: NodeJS.ErrnoException) => {
            if (error.code === "ENOENT") throw new Error(`Unknown artwork ${name} in ${slug}`);
            throw error;
          });
          artifacts[name] = await prepareText(raw, cacheDirectory, activeCacheFiles);
          dependencies.push(file);
        }
        post.assets = [...references.assets].sort();
        for (const name of post.assets) dependencies.push(await assetPath(directory, name));
      }
      if (!lazy) await post.load();
      return post;
    }));
  }))).flat();
  posts.sort((a, b) => b.metadata.date.localeCompare(a.metadata.date) || a.slug.localeCompare(b.slug));
  // Full discovery knows every referenced artifact. Lazy dev discovery does not.
  if (!lazy) await pruneTextCache(cacheDirectory, activeCacheFiles);
  return posts;
}

function renderDocument(post: Awaited<ReturnType<typeof readPosts>>[number] | undefined, slug: string | undefined, content: string, path: string, styles: string[], script: string, font?: string) {
  const html = renderToString(<TerminalFrame activeTab="blog"><CommandEntry command="blog" args={slug ? [slug] : []}>
    <div data-blog-island={slug ?? ""} dangerouslySetInnerHTML={{ __html: content }} />
  </CommandEntry></TerminalFrame>);
  return "<!doctype html>" + renderToStaticMarkup(<BlogLayout
    {...(post?.metadata ?? { title: "Blog", description: "Notes from the terminal. Written in MDX, published as static pages." })}
    path={path} styles={styles} script={script} html={html} font={font} />);
}

export async function renderBlog(root: string, styles: string[], script = "/src/main.tsx", cached?: Awaited<ReturnType<typeof readPosts>>, font?: string) {
  const source = cached ?? await readPosts(root);
  const render = async (slug?: string) => {
    const post = source.find((entry) => entry.slug === slug);
    await post?.load();
    const content = renderToStaticMarkup(<BlogContent posts={source} slug={slug} post={post?.module} />);
    return renderDocument(post, slug, content, slug ? `/blog/${slug}/` : "/blog/", styles, script, font);
  };
  return { posts: await Promise.all(source.map(async (post) => ({ ...post, html: await render(post.slug) }))), index: await render() };
}

/** Render just the requested route, not every other post/gallery. */
export async function renderBlogPage(source: Awaited<ReturnType<typeof readPosts>>, slug?: string, root = process.cwd()) {
  const post = source.find(entry => entry.slug === slug);
  await post?.load();
  const path = slug ? `/blog/${slug}/` : "/blog/";
  const content = renderToStaticMarkup(<BlogContent posts={source} slug={slug} post={post?.module} />);
  return renderDocument(post, slug, content, path, ["/src/blog/blog.css"], "/src/main.tsx", `/@fs${join(root, "docs/fonts/art-grid.woff2")}?no-inline`);
}

export async function buildBlog(root = process.cwd()) {
  const output = join(root, "dist");
  const manifest = JSON.parse(await readFile(join(output, ".vite/manifest.json"), "utf8")) as Record<string, { src?: string; file: string; css?: string[]; imports?: string[] }>;
  const entry = manifest["../src/main.tsx"];
  if (!entry) throw new Error("Terminal entry missing from Vite manifest");
  const styles = new Set<string>();
  const visit = (item: typeof entry) => { for (const css of item.css ?? []) styles.add(`/${css}`); for (const key of item.imports ?? []) visit(manifest[key]); };
  visit(entry);
  const fontFile = (await readdir(join(output, "assets")).catch(() => [] as string[])).find(file => /^art-grid-.*\.woff2$/.test(file));
  const { posts, index } = await renderBlog(root, [...styles], `/${entry.file}`, undefined, fontFile ? `/assets/${fontFile}` : undefined);
  await mkdir(join(output, "blog"), { recursive: true });
  await writeFile(join(output, "blog/index.html"), index);
  for (const post of posts) {
    const destination = join(output, "blog", post.slug);
    await mkdir(destination, { recursive: true });
    await writeFile(join(destination, "index.html"), post.html);
    for (const name of post.assets) {
      const source = await assetPath(post.directory, name);
      const target = await assetPath(destination, name);
      await mkdir(dirname(target), { recursive: true });
      await copyFile(source, target);
    }
  }
  // Keep existing static routes; include every generated post.
  const routes = ["/", "/projects/", "/contact/", "/blog/", ...posts.map((post) => `/blog/${post.slug}/`)];
  await writeFile(join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((path) => `  <url><loc>https://richen.sh${path}</loc></url>`).join("\n")}\n</urlset>\n`);
  await copyFile(join(root, "docs/licenses/ascii-rest-MIT.txt"), join(output, "ascii-rest-MIT.txt"));
  await copyFile(join(root, "docs/fonts/DejaVu-LICENSE.txt"), join(output, "art-grid-LICENSE.txt"));
  console.log(`Built /blog/ and ${posts.length} static post(s)`);
}
