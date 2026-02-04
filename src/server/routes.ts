import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { join, resolve, sep } from "node:path";
import fs from "node:fs";
import { discoverScopes, resolveScope } from "./scopes";
import { buildConfig, HOME_CLAUDE_DIR } from "./config";
import { getSessions } from "./sessions";
import { readDirRecursive, resolveZoneDir } from "./files";
import { getTasks } from "./tasks";

const scopeQuery = z.object({
  scopeId: z.string().default("user"),
});

const ZONES = ["claude", "parent", "projectClaude", "memory"] as const;

const fileQuery = z.object({
  scopeId: z.string().default("user"),
  zone: z.enum(ZONES),
  path: z.string().min(1, "path is required"),
});

const api = new Hono()
  .get("/scopes", (c) => {
    return c.json(discoverScopes(HOME_CLAUDE_DIR));
  })
  .get("/config", zValidator("query", scopeQuery), (c) => {
    const { scopeId } = c.req.valid("query");
    const config = buildConfig(scopeId, HOME_CLAUDE_DIR);
    if (!config) return c.json({ error: "Scope not found" }, 404);
    return c.json(config);
  })
  .get("/sessions", zValidator("query", scopeQuery), (c) => {
    const { scopeId } = c.req.valid("query");
    const resolved = resolveScope(scopeId, HOME_CLAUDE_DIR);
    if (!resolved) return c.json([], 404);
    return c.json(getSessions(resolved.claudeDir));
  })
  .get("/tasks", (c) => {
    return c.json(
      getTasks(join(HOME_CLAUDE_DIR, "tasks"), join(HOME_CLAUDE_DIR, "projects")),
    );
  })
  .get("/file", zValidator("query", fileQuery), (c) => {
    const { scopeId, zone, path: filePath } = c.req.valid("query");

    const resolved = resolveScope(scopeId, HOME_CLAUDE_DIR);
    if (!resolved) return c.text("Scope not found", 404);

    const baseDir = resolveZoneDir(resolved, zone, filePath);
    if (!baseDir) return c.text("Forbidden: invalid zone or path", 403);

    const full = resolve(join(baseDir, filePath));
    if (!full.startsWith(baseDir + sep) && full !== baseDir) {
      return c.text("Forbidden", 403);
    }

    try {
      const content = fs.readFileSync(full, "utf-8");
      return c.text(content);
    } catch {
      return c.text("Not found", 404);
    }
  })
  .get("/tree", zValidator("query", scopeQuery), (c) => {
    const { scopeId } = c.req.valid("query");
    const resolved = resolveScope(scopeId, HOME_CLAUDE_DIR);
    if (!resolved) return c.json([], 404);
    return c.json(readDirRecursive(resolved.claudeDir));
  });

export type ApiType = typeof api;
export { api };
