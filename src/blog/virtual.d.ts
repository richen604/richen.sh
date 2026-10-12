declare module "virtual:blog" {
  import type { PostSummary } from "@/blog/types";
  export const posts: PostSummary[];
}

declare module "*.art.json?prepared" {
  import type { PreparedText } from "@/blog/art/prepared-text";
  const artifact: PreparedText;
  export default artifact;
}
