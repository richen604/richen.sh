import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./{projects,contact}/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {},
  plugins: [],
};
export default config;
