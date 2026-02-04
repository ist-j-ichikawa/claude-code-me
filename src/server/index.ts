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
const HOSTNAME = "claude-code-me.localhost";
const OPEN_COMMANDS: Record<string, string> = {
  darwin: "open",
  win32: "start",
  linux: "xdg-open",
};

const app = new Hono();

// --- API routes (chained for RPC type inference) ---
app.route("/api", api);

// --- Static file serving (SvelteKit build output) ---
const CLIENT_DIR = fs.existsSync(join(__dirname, "client"))
  ? join(__dirname, "client")
  : join(__dirname, "../dist/client");

app.use("/*", serveStatic({ root: CLIENT_DIR }));

// SPA fallback
app.get("*", (c) => {
  const indexPath = join(CLIENT_DIR, "index.html");
  try {
    return c.html(fs.readFileSync(indexPath, "utf-8"));
  } catch {
    return c.text("Not found", 404);
  }
});

// --- Server startup ---
if (
  process.argv[1] === __filename ||
  process.argv[1]?.endsWith("/server/index.ts") ||
  process.argv[1]?.endsWith("/server.mjs")
) {
  const port = 3333;
  serve({ fetch: app.fetch, hostname: HOSTNAME, port }, (info) => {
    const url = `http://${HOSTNAME}:${info.port}`;
    console.log(`Claude Code Me: ${url}`);
    const openCmd = OPEN_COMMANDS[process.platform] ?? "xdg-open";
    execFile(openCmd, [url], (err) => {
      if (err) console.warn(`Could not open browser: ${err.message}`);
    });
  });
}

export { app };
