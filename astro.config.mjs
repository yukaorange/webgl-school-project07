import { defineConfig } from "astro/config";
import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "./src/styles/style.scss";`,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: "js/index.js",
        },
      },
      // minify: false,
      minify: true,
    },
  },
  integrations: [image()],
  base: "",
});
