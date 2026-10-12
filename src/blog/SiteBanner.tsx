import { AsciiArt } from "./AsciiArt.tsx";
import type { PreparedText } from "./art/prepared-text.ts";

/** Shared markup; callers supply the same prepared artifact in Vite and static builds. */
export function SiteBanner({ artifact }: { artifact: PreparedText }) {
  return <section className="blog-content homepage-banner" aria-label="Site banner">
    <AsciiArt artifact={artifact} description="ASCII landscape banner: Wallhaven 8g518k" />
  </section>;
}
