import type { CompileOptions } from "@mdx-js/mdx";
import rehypeShiki from "@shikijs/rehype";
import { validateAsset, validateArtwork } from "./assets.ts";

export function mdxOptions(slug: string, references?: { art: Set<string>; assets: Set<string> }): Pick<CompileOptions, "remarkPlugins" | "rehypePlugins"> {
  return {
    remarkPlugins: [assetLinks(slug, references)],
    rehypePlugins: [[rehypeShiki, {
      theme: "catppuccin-mocha",
      langs: ["sh", "nix", "ts"],
      addLanguageClass: true,
      colorReplacements: { "#1e1e2e": "#181818" },
    }]],
  };
}

type Node = {
  type?: string;
  name?: string;
  url?: string;
  children?: Node[];
  attributes?: { name?: string; value?: unknown }[];
};

/** Resolve authored assets before compilation, including literal MDX JSX. */
export function assetLinks(slug: string, references?: { art: Set<string>; assets: Set<string> }) {
  const absolute = (url: string) => /^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(url) ? url : `/blog/${slug}/${url.replace(/^\.\//, "")}`;
  return () => (tree: Node) => {
    const collect = (url: string) => {
      const prefix = `/blog/${slug}/`;
      const name = url.startsWith(prefix) ? url.slice(prefix.length) : url.replace(/^\.\//, "");
      const path = name.split(/[?#]/)[0];
      if (path.startsWith("assets/")) { validateAsset(path); references?.assets.add(path); }
      else if (!/^(?:[a-z][a-z\d+.-]*:|\/|#|\?)/i.test(url) && /\.(?:svg|png|jpe?g|webp|avif|json)(?:[?#]|$)/.test(url)) throw new Error("Post files belong in assets/");
    };
    const visit = (node: Node) => {
      if ((node.type === "link" || node.type === "image") && node.url) { collect(node.url); node.url = absolute(node.url); }
      if (node.name === "AsciiArt" || node.name === "AsideArt") {
        const src = node.attributes?.find((attribute) => attribute.name === "src")?.value;
        if (typeof src !== "string") throw new Error(`${node.name} needs a literal .art.json src`);
        validateArtwork(src);
        references?.art.add(src);
      }
      if (["a", "img", "source", "video", "audio"].includes(node.name ?? "")) {
        for (const attribute of node.attributes ?? []) {
          if (["href", "src", "poster"].includes(attribute.name ?? "") && typeof attribute.value === "string") { collect(attribute.value); attribute.value = absolute(attribute.value); }
        }
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
