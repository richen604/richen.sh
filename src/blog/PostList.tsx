import type { PostSummary } from "./types.ts";

export function PostList({ posts }: { posts: PostSummary[] }) {
  return <section className="blog-index" aria-label="Blog"><h1 className="sr-only">Blog</h1>
    {posts.length ? <ul className="post-list">{posts.map(({ slug: key, metadata }) => <li key={key}>
      <time dateTime={metadata.date}>{metadata.date}</time><h2><a href={`/blog/${key}/`}>{metadata.title}</a></h2>
      <code className="post-command">{`blog ${key}`}</code>
      <p>{metadata.description}</p>
    </li>)}</ul> : <p>No posts yet.</p>}
  </section>;
}
