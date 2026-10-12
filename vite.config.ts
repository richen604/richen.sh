import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { blogPlugin } from "./src/blog/build/plugin.ts";

export default defineConfig({
  root: resolve(import.meta.dirname, "routes"),
  publicDir: resolve(import.meta.dirname, "public"),
  base: "/",
  appType: "mpa",
  plugins: [react(), blogPlugin(import.meta.dirname)],
  server: {
    allowedHosts: ["cedar.richen.sh"],
    fs: { allow: [import.meta.dirname] },
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
      "/src": resolve(import.meta.dirname, "src"),
      "/docs": resolve(import.meta.dirname, "docs"),
    },
  },
  build: {
    outDir: resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "routes/index.html"),
        projects: resolve(import.meta.dirname, "routes/projects/index.html"),
        contact: resolve(import.meta.dirname, "routes/contact/index.html"),
        terminal: resolve(import.meta.dirname, "src/main.tsx"),
        blogStyle: resolve(import.meta.dirname, "src/blog/blog.css"),
      },
    },
  },
});
