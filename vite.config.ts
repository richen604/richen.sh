import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { blogPlugin } from "./src/blog/build/plugin.ts";

export default defineConfig({
  base: "/",
  appType: "mpa",
  plugins: [react(), blogPlugin()],
  server: {
    allowedHosts: ["cedar.richen.sh"],
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        projects: resolve(import.meta.dirname, "projects/index.html"),
        contact: resolve(import.meta.dirname, "contact/index.html"),
        terminal: resolve(import.meta.dirname, "src/main.tsx"),
        blogStyle: resolve(import.meta.dirname, "src/blog/blog.css"),
      },
    },
  },
});
