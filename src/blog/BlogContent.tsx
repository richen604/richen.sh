import { createContext, useContext, type ComponentProps } from "react";
import { AsciiArt } from "./AsciiArt.tsx";
import { AsideArt } from "./AsideArt.tsx";
import type { PostModule, PostSummary } from "./types.ts";

const ArtworkContext = createContext<PostModule["artifacts"]>({});
function useArtwork(src: string) {
  const artifact = useContext(ArtworkContext)[src];
  if (!artifact) throw new Error(`Unknown artwork ${src}`);
  return artifact;
}
function EmbeddedArt({ src, ...props }: { src: string } & Omit<ComponentProps<typeof AsciiArt>, "artifact">) {
  return <AsciiArt artifact={useArtwork(src)} {...props} />;
}
function EmbeddedAsideArt({ src, ...props }: { src: string } & Omit<ComponentProps<typeof AsideArt>, "artifact">) {
  return <AsideArt artifact={useArtwork(src)} {...props} />;
}
const CodeBlock = (props: ComponentProps<"pre">) => <pre tabIndex={0} {...props} />;
// Build-only MDX components. Browser adopts this same static content without
// evaluating MDX or hydrating artwork; assets resolve in the shared transform.
const components = { AsciiArt: EmbeddedArt, AsideArt: EmbeddedAsideArt, pre: CodeBlock };

export function BlogContent({ posts, slug, post }: { posts: PostSummary[]; slug?: string; post?: PostModule }) {
  const summary = posts.find((entry) => entry.slug === slug);
  if (slug && !summary) return <div className="p-2">Post not found: {slug}. Try <a href="/blog/">blog</a>.</div>;
  if (!slug) return <section className="blog-index" aria-label="Blog"><h1 className="sr-only">Blog</h1>
    {posts.length ? <ul className="post-list">{posts.map(({ slug: key, metadata }) => <li key={key}>
      <time dateTime={metadata.date}>{metadata.date}</time><h2><a href={`/blog/${key}/`}>{metadata.title}</a></h2>
      <code className="post-command">blog {key}</code>
      <p>{metadata.description}</p>
    </li>)}</ul> : <p>No posts yet.</p>}
  </section>;
  if (!post || !summary) return <p className="p-2" role="status">Loading post…</p>;
  const Content = post.default;
  const { metadata } = summary;
  return <article className="blog-content" data-post={slug}><header><a href="/blog/">← all posts</a><h1>{metadata.title}</h1>
    <time dateTime={metadata.date}>{metadata.date}</time><p className="post-description">{metadata.description}</p></header>
    <ArtworkContext.Provider value={post.artifacts}><Content components={components} /></ArtworkContext.Provider>
  </article>;
}
