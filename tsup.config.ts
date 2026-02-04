import { defineConfig } from "tsup";

export default defineConfig({
  entry: { server: "src/server/index.ts" },
  outDir: "dist",
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  target: "node18",
  platform: "node",
  splitting: false,
  clean: false, // Don't clean — dist/client/ is already built by vite
  banner: {
    js: "#!/usr/bin/env node",
  },
  // Bundle everything except Node.js builtins
  noExternal: [/(.*)/],
  external: [
    "node:fs",
    "node:path",
    "node:os",
    "node:url",
    "node:child_process",
    "node:http",
    "node:https",
    "node:net",
    "node:stream",
    "node:crypto",
    "node:zlib",
    "node:buffer",
    "node:util",
    "node:events",
    "node:querystring",
  ],
});
