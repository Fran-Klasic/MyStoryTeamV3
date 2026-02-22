import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { copyFileSync } from "node:fs";
import { join } from "node:path";

// https://vite.dev/config/
export default defineConfig({
  base: "/MyStoryTeamV3/",
  plugins: [
    vue(),
    {
      name: "github-pages-404",
      closeBundle() {
        const outDir = join(fileURLToPath(import.meta.url), "..", "dist");
        copyFileSync(join(outDir, "index.html"), join(outDir, "404.html"));
      },
    },
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {},
});
