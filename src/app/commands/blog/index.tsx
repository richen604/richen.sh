import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CommandParams } from "..";
import { attachPost, getPost, loadPost, posts, prefetchNewest } from "../../../blog/registry";
import { PostList } from "../../../blog/PostList";

function BlogIndex() {
  useEffect(() => prefetchNewest(), []);
  return <div data-blog-island=""><PostList posts={posts} /></div>;
}

function StaticIsland({ slug, path, node }: { slug: string; path: string; node: HTMLElement }) {
  const host = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => attachPost(path, host.current!, node), [path, node]);
  // SSR children already exist; React must neither hydrate nor rewrite them.
  // The constant empty HTML claims no children on client-created shells.
  return <div ref={host} data-blog-island={slug} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "" }} />;
}

export default function Blog({ args = [], pagePath }: Pick<CommandParams, "args"> & { pagePath?: string }) {
  if (!args[0]) return <BlogIndex />;
  return <BlogPost args={args} pagePath={pagePath} />;
}

function BlogPost({ args = [], pagePath }: Pick<CommandParams, "args"> & { pagePath?: string }) {
  const slug = args[0] ?? "";
  const key = pagePath ?? slug;
  const [result, setResult] = useState(() => ({ slug: key, node: getPost(slug, pagePath), error: false }));
  useEffect(() => {
    const controller = new AbortController();
    void loadPost(slug, controller.signal, pagePath).then(node => {
      if (!controller.signal.aborted) setResult({ slug: key, node, error: false });
    }).catch(() => { if (!controller.signal.aborted) setResult({ slug: key, node: undefined, error: true }); });
    return () => controller.abort();
  }, [slug, pagePath, key]);
  const node = result.slug === key ? result.node : getPost(slug, pagePath);
  if (slug && !posts.some(post => post.slug === slug)) return <p className="p-2">Post not found: {slug}. Try <a href="/blog/">blog</a>.</p>;
  if (result.slug === key && result.error) return <p className="p-2" role="alert">Unable to load post. <a data-reload href={pagePath ?? (slug ? `/blog/${slug}/` : "/blog/")}>Reload to retry.</a></p>;
  if (node === undefined) return <p className="p-2" role="status">Loading post…</p>;
  return <StaticIsland key={key} slug={slug} path={pagePath ?? (slug ? `/blog/${slug}/` : "/blog/")} node={node} />;
}
