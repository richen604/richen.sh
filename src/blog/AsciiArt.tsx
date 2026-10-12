import { useLayoutEffect, useRef, type CSSProperties } from "react";
import type { PreparedText } from "./art/prepared-text.ts";
import { attachAsciiCanvases } from "./art/canvas.ts";

export function AsciiArt({ artifact, description, decorative = false, caption, width = "100%" }: {
  artifact: PreparedText; description?: string; decorative?: boolean; caption?: string; renderMode?: "text"; width?: CSSProperties["width"];
}) {
  const host = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => attachAsciiCanvases(host.current!), [artifact]);
  if (!decorative && !description?.trim()) throw new Error("Meaningful artwork needs a description");
  return <figure className="ascii-art ascii-art-text" style={{ width, maxWidth: "100%", "--art-columns": artifact.width, "--art-rows": artifact.height } as CSSProperties}>
    <div ref={host} className="ascii-text-grid" style={{ background: artifact.background }} role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : description} aria-hidden={decorative || undefined}>
      <canvas data-ascii-canvas data-columns={artifact.width} data-rows={artifact.height}
        data-colors={artifact.colors} data-palette={artifact.palette.join(",")} data-background={artifact.background} aria-hidden="true" />
      <pre aria-hidden="true" style={{ background: artifact.background }}>{artifact.rows.join("\n")}</pre>
    </div>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}
