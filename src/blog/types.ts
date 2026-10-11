import type { ComponentType } from "react";
import type { MDXProps } from "mdx/types";
import type { PreparedText } from "./art/prepared-text";

export interface PostMetadata { title: string; description: string; date: string }
export interface PostSummary { slug: string; metadata: PostMetadata }
export interface PostModule {
  default: ComponentType<MDXProps>;
  artifacts: Record<string, PreparedText>;
}
