declare module "virtual:blog" {
  import type { PostSummary } from "@/blog/types";
  export const posts: PostSummary[];
}
