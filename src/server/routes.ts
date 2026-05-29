import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { join } from "node:path";
import fs from "node:fs";
import { discoverScopes, resolveScope } from "./scopes";
import { buildConfig, HOME_CLAUDE_DIR } from "./config";
import { getSessions } from "./sessions";
import { readDirRecursive, resolveSafeFilePath, resolveScopeDir, readJsonFile } from "./files";
import { CLAUDE_CODE_ENV_VARS } from "./env-vars";
import { getHistory } from "./history";

const scopeQuery = z.object({
  scopeId: z.string().default("user"),
});

const FILE_ZONES = ["user", "project", "parent", "projectClaude", "memory"] as const;

const fileQuery = z.object({
  scopeId: z.string().default("user"),
  scope: z.enum(FILE_ZONES),
  path: z.string().min(1, "path is required"),
});

const historyQuery = z.object({
  limit: z.coerce.number().int().min(1).max(5000).default(500),
});

export function createApi(homeClaudeDir = HOME_CLAUDE_DIR) {
  return new Hono()
    .get("/scopes", (c) => {
      return c.json(discoverScopes(homeClaudeDir));
    })
    .get("/config", zValidator("query", scopeQuery), (c) => {
      const { scopeId } = c.req.valid("query");
      const config = buildConfig(scopeId, homeClaudeDir);
      if (!config) return c.json({ error: "Scope not found" }, 404);
      return c.json(config);
    })
    .get("/sessions", zValidator("query", scopeQuery), (c) => {
      const { scopeId } = c.req.valid("query");
      const resolved = resolveScope(scopeId, homeClaudeDir);
      if (!resolved) return c.json([], 404);
      return c.json(getSessions(resolved.claudeDir));
    })
    .get("/version", (c) => {
      try {
        const upstreamPath = join(process.cwd(), "upstream-version");
        const version = fs.readFileSync(upstreamPath, "utf-8").trim();
        return c.json({ version });
      } catch {
        return c.json({ version: null });
      }
    })
    .get("/env", (c) => {
      const settings = readJsonFile(join(homeClaudeDir, "settings.json")) as
        | { env?: Record<string, string> }
        | null;
      const settingsEnv = settings?.env ?? {};

      const entries = CLAUDE_CODE_ENV_VARS.flatMap((def) => {
        const inShell = process.env[def.name];
        const inSettings = settingsEnv[def.name];
        if (inShell == null && inSettings == null) return [];
        const sources: ("shell" | "settings")[] = [];
        if (inSettings != null) sources.push("settings");
        if (inShell != null) sources.push("shell");
        const value = inSettings ?? inShell ?? "";
        return [{
          name: def.name,
          description: def.description,
          sensitive: def.sensitive ?? false,
          value: def.sensitive ? "<set>" : value,
          sources,
        }];
      });

      return c.json(entries);
    })
    .get("/history", zValidator("query", historyQuery), (c) => {
      const { limit } = c.req.valid("query");
      return c.json(getHistory(homeClaudeDir, limit));
    })
    .get("/insights", (c) => {
      const reportPath = join(homeClaudeDir, "usage-data", "report.html");
      try {
        const html = fs.readFileSync(reportPath, "utf-8");
        return c.html(html);
      } catch {
        return c.text("report.html not found. Run `/insights` in Claude Code to generate it.", 404);
      }
    })
    .get("/file", zValidator("query", fileQuery), (c) => {
      const { scopeId, scope, path: filePath } = c.req.valid("query");

      const resolved = resolveScope(scopeId, homeClaudeDir);
      if (!resolved) return c.text("Scope not found", 404);

      const baseDir = resolveScopeDir(resolved, scope, filePath);
      if (!baseDir) return c.text("Forbidden: invalid scope or path", 403);

      try {
        const full = resolveSafeFilePath(baseDir, filePath);
        if (!full) return c.text("Forbidden", 403);
        const stat = fs.statSync(full);
        if (!stat.isFile()) return c.text("Not found", 404);
        if (stat.size > 5_000_000) return c.text("File too large (>5MB)", 413);
        const content = fs.readFileSync(full, "utf-8");
        return c.text(content);
      } catch {
        return c.text("Not found", 404);
      }
    })
    .get("/tree", zValidator("query", scopeQuery), (c) => {
      const { scopeId } = c.req.valid("query");
      const resolved = resolveScope(scopeId, homeClaudeDir);
      if (!resolved) return c.json([], 404);
      return c.json(readDirRecursive(resolved.claudeDir));
    });
}

const api = createApi();

export type ApiType = typeof api;
export { api };
