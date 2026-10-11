import type { PostMetadata } from "./types.ts";
export type { PostMetadata } from "./types.ts";

export function BlogLayout({ title, description, path, styles, date, html, script, font }: {
  title: string; description: string; path: string; styles: string[]; date?: PostMetadata["date"]; html: string; script: string; font?: string;
}) {
  const canonical = `https://richen.sh${path}`;
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="darkreader-lock" />
        <title>{`${title} | richen.sh`}</title><meta name="description" content={description} />
        <link rel="canonical" href={canonical} /><link rel="icon" href="/favicon.svg" />
        <meta property="og:title" content={title} /><meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} /><meta property="og:type" content={date ? "article" : "website"} />
        <meta property="og:image" content="https://richen.sh/opengraph-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://richen.sh/opengraph-image.png" />
        {date && <meta property="article:published_time" content={`${date}T00:00:00Z`} />}
        {font && <link rel="preload" href={font} as="font" type="font/woff2" crossOrigin="anonymous" />}
        {styles.map((href) => <link key={href} rel="stylesheet" href={href} />)}
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: html }} />
        <script id="terminal-bootstrap" type="application/json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ path }).replace(/</g, "\\u003c") }} />
        <script type="module" src={script} />
      </body>
    </html>
  );
}
