import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: "dist/client",
      assets: "dist/client",
      fallback: "index.html",
    }),
    router: {
      type: "hash",
    },
    files: {
      appTemplate: "src/client/app.html",
      routes: "src/client/routes",
      lib: "src/client/lib",
      assets: "src/client/static",
    },
  },
};

export default config;
