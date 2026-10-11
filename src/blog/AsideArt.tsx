import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { AsciiArt } from "./AsciiArt.tsx";

/** Authored art beside prose; stacks naturally on narrow screens. */
export function AsideArt({ children, side = "right", width = "38%", ...props }: ComponentProps<typeof AsciiArt> & {
  children?: ReactNode; side?: "left" | "right";
}) {
  return <div className={`aside-art aside-art-${side}`} style={{ "--aside-width": typeof width === "number" ? `${width}px` : width } as CSSProperties}>
    <AsciiArt {...props} />{children}
  </div>;
}
