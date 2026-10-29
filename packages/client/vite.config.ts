import { lingui as linguiSolidPlugin } from "@lingui/vite-plugin";
import devtools from "@solid-devtools/transform";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import babelMacrosPlugin from "vite-plugin-babel-macros";
import Inspect from "vite-plugin-inspect";
import { VitePWA } from "vite-plugin-pwa";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";

import codegenPlugin from "./codegen.plugin";
import { addFontPreload } from "./fontpreload.plugin";
import { BRAND } from "./src/awakyn/brand";
import { AWAKYN_THEME } from "./src/awakyn/theme/tokens";

const base = process.env.BASE_PATH ?? "/";
const pwaScope = process.env.PWA_SCOPE || base;

export default defineConfig({
  base,
  plugins: [
    Inspect(),
    devtools(),
    codegenPlugin(),
    babelMacrosPlugin(),
    solidPlugin({
      babel: {
        plugins: ["@lingui/babel-plugin-lingui-macro"],
      },
    }),
    linguiSolidPlugin(),
    solidSvg({
      defaultAsComponent: false,
    }),
    addFontPreload(),
    VitePWA({
      srcDir: "src",
      registerType: "autoUpdate",
      filename: "serviceWorker.ts",
      strategies: "injectManifest",
      injectManifest: {
        maximumFileSizeToCacheInBytes: 8000000,
        globPatterns: ["**/*.{js,css,html}", "**/material-symbols-*.woff2"],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        // Awakyn: install name, colours and icons
        name: BRAND.name,
        short_name: BRAND.name,
        description: BRAND.description,
        categories: ["communication", "chat", "messaging"],
        start_url: base,
        scope: pwaScope,
        display_override: ["window-controls-overlay"],
        display: "standalone",
        background_color: AWAKYN_THEME.dark.bg,
        theme_color: AWAKYN_THEME.dark.bg,
        icons: [
          { src: `${base}awakyn/icon-192.png`, type: "image/png", sizes: "192x192" },
          { src: `${base}awakyn/icon-512.png`, type: "image/png", sizes: "512x512" },
          { src: `${base}awakyn/icon-512.png`, type: "image/png", sizes: "512x512", purpose: "maskable" },
        ],
        // TODO: take advantage of shortcuts
      },
    }),
  ],
  build: {
    target: "esnext",
    rollupOptions: {
      external: ["hast"],
      output: {
        manualChunks: {
          markdown: [
            "lowlight",
            "rehype-highlight",
            "rehype-katex",
            "remark-breaks",
            "remark-gfm",
            "remark-math",
            "remark-parse",
            "remark-rehype",
            "vfile",
          ],
        },
      },
    },
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ["hast"],
  },
  resolve: {
    alias: {
      "styled-system": resolve(__dirname, "styled-system"),
      ...readdirSync(resolve(__dirname, "components")).reduce(
        (p, f) => ({
          ...p,
          [`@revolt/${f}`]: resolve(__dirname, "components", f),
        }),
        {},
      ),
    },
  },
});
