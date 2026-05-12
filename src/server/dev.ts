import { getRequestListener } from "@hono/node-server";
import { createServer as createViteServer } from "vite";
import http from "node:http";
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
  openBrowser(url);
});
