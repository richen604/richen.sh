import type { CSSProperties } from "react";
import type { PreparedText } from "./art/prepared-text.ts";

export function AsciiArt({ artifact, description, decorative = false, caption, width = "100%" }: {
  artifact: PreparedText; description?: string; decorative?: boolean; caption?: string; renderMode?: "text"; width?: CSSProperties["width"];
}) {
  if (!decorative && !description?.trim()) throw new Error("Meaningful artwork needs a description");
  return <figure className="ascii-art ascii-art-text" style={{ width, maxWidth: "100%", "--art-columns": artifact.width, "--art-rows": artifact.height } as CSSProperties}>
    <div className="ascii-text-grid" style={{ background: artifact.background }} role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : description} aria-hidden={decorative || undefined}>
      <style>{artifact.css}</style>
      <pre className={artifact.className} aria-hidden="true" style={{ background: artifact.background }} dangerouslySetInnerHTML={{ __html: artifact.html }} />
    </div>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}
