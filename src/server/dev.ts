import { getRequestListener } from "@hono/node-server";
import { createServer as createViteServer } from "vite";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { app, HOSTNAME, PORT, openBrowser } from "./index";

const httpServer = http.createServer();
const vite = await createViteServer({
  server: { middlewareMode: true, hmr: { server: httpServer } },
  appType: "spa",
});

const honoListener = getRequestListener(app.fetch);

httpServer.on("request", (req, res) => {
  if (req.url?.startsWith("/api")) {
    honoListener(req, res);
  } else {
    vite.middlewares(req, res);
  }
});

httpServer.listen(PORT, HOSTNAME, () => {
  const url = `http://${HOSTNAME}:${PORT}`;
  console.log(`Claude Code Me (dev): ${url}`);
  // tsx watch restarts this process on every file change. Use the watcher's
  // pid (our ppid) as a sentinel so we only open the browser once per
  // `pnpm dev` session, not on every reload.
  const sentinel = join(os.tmpdir(), `ccme-dev-${process.ppid}.lock`);
  if (!fs.existsSync(sentinel)) {
    fs.writeFileSync(sentinel, String(Date.now()));
    openBrowser(url);
  }
});
