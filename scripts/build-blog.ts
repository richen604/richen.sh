import { buildBlog } from "../src/blog/build/posts";

buildBlog().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
