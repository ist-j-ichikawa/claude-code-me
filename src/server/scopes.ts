import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { ScopeType, ResolvedScope } from "./types";
import { listJsonlFiles } from "./files";
import { readJsonlHead, parseJsonLines } from "./jsonl";

/** Scope entry for /api/scopes response. */
export interface ScopeEntry {
  id: string;
  scope: ScopeType;
  displayName: string;
  projectPath: string | null;
  claudeDir: string;
  sessionCount: number;
  lastModified: string | null;
}

/** CWD resolution cache (projectDir → { cwd, newestMtimeMs }). */
const cwdCache = new Map<string, { cwd: string | null; newestMtimeMs: number | null }>();

/**
 * Best-effort decode of a project directory name.
 * Claude Code encodes paths as: /Users/user/foo-bar → -Users-user-foo-bar
 * Encoding is lossy (hyphens vs path separators are ambiguous),
 * so we only strip the home directory prefix and keep the rest as-is.
 */
function decodeDirName(name: string): string {
  const homeEncoded = os.homedir().replaceAll("/", "-");
  if (name.startsWith(homeEncoded)) {
    // Strip home prefix only; keep remaining segment as-is (lossy decode is worse than raw)
    return "~/" + name.slice(homeEncoded.length + 1);
  }
  return name;
}

/** Find the newest file by mtime. Returns name + mtimeMs, or null if no valid files. */
export function newestFile(dir: string, files: string[]): { name: string; mtimeMs: number } | null {
  let best: { name: string; mtimeMs: number } | null = null;
  for (const f of files) {
    try {
      const ms = fs.statSync(path.join(dir, f)).mtimeMs;
      if (!best || ms > best.mtimeMs) best = { name: f, mtimeMs: ms };
    } catch {
      /* skip */
    }
  }
  return best;
}

/** Convenience: get just the newest mtime (for backward compat with tests). */
export function newestMtime(dir: string, files: string[]): number | null {
  return newestFile(dir, files)?.mtimeMs ?? null;
}

/**
 * Resolve CWD + newest mtime from JSONL files in a project directory.
 * Results are cached for the lifetime of the process.
 * Accepts pre-listed files to avoid redundant readdirSync.
 */
export function resolveCwdFromJsonl(
  projectDir: string,
  preListedFiles?: string[],
): { cwd: string | null; newestMtimeMs: number | null } {
  if (cwdCache.has(projectDir)) return cwdCache.get(projectDir)!;

  const result = { cwd: null as string | null, newestMtimeMs: null as number | null };
  try {
    const files = preListedFiles ?? listJsonlFiles(projectDir);
    if (files.length === 0) {
      cwdCache.set(projectDir, result);
      return result;
    }

    const newest = newestFile(projectDir, files);
    if (!newest) {
      cwdCache.set(projectDir, result);
      return result;
    }

    result.newestMtimeMs = newest.mtimeMs;

    const lines = readJsonlHead(path.join(projectDir, newest.name));
    parseJsonLines(lines, (obj) => {
      if (obj.cwd) {
        result.cwd = obj.cwd as string;
        return true;
      }
      return false;
    });
  } catch {
    /* skip */
  }

  cwdCache.set(projectDir, result);
  return result;
}

/**
 * Discover all scopes under a given claude home directory.
 * @param homeClaudeDir - The ~/.claude/ directory (parameterized for testing)
 */
export function discoverScopes(homeClaudeDir: string): ScopeEntry[] {
  const projectsDir = path.join(homeClaudeDir, "projects");

  const scopes: ScopeEntry[] = [
    {
      id: "user",
      scope: "user",
      displayName: `User (${homeClaudeDir.replace(os.homedir(), "~")})`,
      projectPath: null,
      claudeDir: homeClaudeDir,
      sessionCount: 0,
      lastModified: null,
    },
  ];

  if (fs.existsSync(projectsDir)) {
    try {
      for (const entry of fs.readdirSync(projectsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;

        const fullDir = path.join(projectsDir, entry.name);
        const jsonlFiles = listJsonlFiles(fullDir);
        if (jsonlFiles.length === 0) continue; // Skip empty projects

        // Single pass: resolves CWD + finds newest mtime
        const { cwd, newestMtimeMs } = resolveCwdFromJsonl(fullDir, jsonlFiles);

        scopes.push({
          id: entry.name,
          scope: "project",
          displayName: cwd ? cwd.replace(os.homedir(), "~") : decodeDirName(entry.name),
          projectPath: cwd,
          claudeDir: fullDir,
          sessionCount: jsonlFiles.length,
          lastModified: newestMtimeMs ? new Date(newestMtimeMs).toISOString() : null,
        });
      }
    } catch {
      /* skip */
    }
  }

  // User first, then projects by lastModified descending
  scopes.sort((a, b) => {
    if (a.scope === "user") return -1;
    if (b.scope === "user") return 1;
    return (b.lastModified ?? "") > (a.lastModified ?? "") ? 1 : -1;
  });

  return scopes;
}

/**
 * Resolve a scopeId to its directories.
 * @param scopeId - 'user' or a project directory name
 * @param homeClaudeDir - The ~/.claude/ directory (parameterized for testing)
 */
export function resolveScope(scopeId: string, homeClaudeDir: string): ResolvedScope | null {
  if (scopeId === "user" || !scopeId) {
    return { scope: "user", claudeDir: homeClaudeDir, parentDir: null, projectClaudeDir: null };
  }

  const claudeDir = path.join(homeClaudeDir, "projects", scopeId);
  if (!fs.existsSync(claudeDir)) return null;

  const { cwd } = resolveCwdFromJsonl(claudeDir);
  const projectClaudeDir = cwd ? path.join(cwd, ".claude") : null;

  return { scope: "project", claudeDir, parentDir: cwd, projectClaudeDir };
}
