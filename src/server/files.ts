import fs from "node:fs";
import path from "node:path";
import type { ResolvedScope, ScopeType } from "./types";

/** Tree node for directory listing. */
export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  children?: TreeNode[];
}

/** Files served from the project root (cwd) rather than cwd/.claude/. */
export const PROJECT_ROOT_ALLOWLIST = new Set(["CLAUDE.md", ".mcp.json"]);

/** Reserved JSONL filenames in ~/.claude/ that are not user sessions. */
const NON_SESSION_JSONL = new Set(["history.jsonl"]);

/** List session .jsonl files in a directory (excludes Claude Code's reserved files like history.jsonl). */
export function listJsonlFiles(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith(".jsonl") && !NON_SESSION_JSONL.has(e.name))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

/** Recursively build a tree of files and directories. Skips dotfiles (.DS_Store, .git, etc.). */
export function readDirRecursive(dir: string, base = ""): TreeNode[] {
  const items: TreeNode[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return items;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const rel = path.join(base, entry.name);
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      items.push({
        name: entry.name,
        path: rel,
        type: "dir",
        children: readDirRecursive(full, rel),
      });
    } else {
      try {
        const stat = fs.statSync(full);
        items.push({ name: entry.name, path: rel, type: "file", size: stat.size });
      } catch {
        /* skip unreadable */
      }
    }
  }
  return items;
}

/** Parse a JSON file, returning null on error. */
export function readJsonFile(filePath: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

/**
 * Resolve a scope + filePath to a base directory.
 * - scope=user: file lives under `~/.claude/`.
 * - scope=project: `CLAUDE.md` / `.mcp.json` live at the project root (cwd);
 *   `memory/*` lives under the project's session directory; everything else
 *   lives under `<cwd>/.claude/`.
 * Rejects path traversal attempts (.. or absolute paths).
 */
export function resolveScopeDir(
  resolved: Pick<ResolvedScope, "claudeDir" | "projectCwd" | "projectClaudeDir">,
  scope: ScopeType | string,
  filePath: string,
): string | null {
  const normalized = path.normalize(filePath);
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) return null;

  if (scope === "user") return resolved.claudeDir;

  if (scope === "project") {
    if (PROJECT_ROOT_ALLOWLIST.has(normalized) && resolved.projectCwd) {
      return resolved.projectCwd;
    }
    if (normalized === "memory" || normalized.startsWith("memory/")) {
      return resolved.claudeDir;
    }
    if (resolved.projectClaudeDir) return resolved.projectClaudeDir;
  }
  return null;
}
