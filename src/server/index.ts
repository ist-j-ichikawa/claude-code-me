import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execFile } from "node:child_process";
import fs from "node:fs";
import { api } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const HOSTNAME = "claude-code-me.localhost";
export const PORT = Number(process.env.PORT) || 3333;
const OPEN_COMMANDS: Record<string, string> = {
  darwin: "open",
  win32: "start",
  linux: "xdg-open",
};

const app = new Hono();
app.route("/api", api);

const CLIENT_DIR = fs.existsSync(join(__dirname, "client"))
  ? join(__dirname, "client")
  : join(__dirname, "../dist/client");

app.use("/*", serveStatic({ root: CLIENT_DIR }));
app.get("*", (c) => {
  const indexPath = join(CLIENT_DIR, "index.html");
  try {
    return c.html(fs.readFileSync(indexPath, "utf-8"));
  } catch {
    return c.text("Not found", 404);
  }
});

export function openBrowser(url: string) {
  const openCmd = OPEN_COMMANDS[process.platform] ?? "xdg-open";
  execFile(openCmd, [url], (err) => {
    if (err) console.warn(`Could not open browser: ${err.message}`);
  });
}

// Auto-startup only when run as the bundled production server.
// In dev, src/server/dev.ts imports `app` from this module and starts the
// HTTP server itself; this guard prevents double-listen.
if (process.argv[1]?.endsWith("/server.mjs")) {
  serve({ fetch: app.fetch, hostname: HOSTNAME, port: PORT }, (info) => {
    const url = `http://${HOSTNAME}:${info.port}`;
    console.log(`Claude Code Me: ${url}`);
    openBrowser(url);
  });
}

export { app };
