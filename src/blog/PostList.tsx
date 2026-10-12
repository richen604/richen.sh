import type { PostSummary } from "./types.ts";

export function PostList({ posts }: { posts: PostSummary[] }) {
  return <section className="blog-index" aria-label="Blog">
    {posts.length ? <ul className="post-list">{posts.map(({ slug: key, metadata }) => <li key={key}>
      <code className="post-command"><span className="text-accent">blog</span>{` ${key}`}</code>
      <h2><time dateTime={metadata.date}>{metadata.date}</time>{" — "}<a href={`/blog/${key}/`}>{metadata.title}</a></h2>
      <p>{metadata.description}</p>
    </li>)}</ul> : <p>No posts yet.</p>}
  </section>;
}
