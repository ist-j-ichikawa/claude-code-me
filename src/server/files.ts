import fs from "node:fs";
import path from "node:path";
import type { FileZone, ResolvedScope, ScopeType } from "./types";

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

function isTraversal(normalized: string): boolean {
  return normalized === ".." || normalized.startsWith(`..${path.sep}`) || path.isAbsolute(normalized);
}

function isWithinDir(base: string, target: string): boolean {
  const rel = path.relative(base, target);
  return rel === "" || (rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel));
}

function isMemoryPath(normalized: string): boolean {
  return normalized === "memory" || normalized.startsWith(`memory${path.sep}`);
}

/**
 * Resolve an existing file path and ensure symlinks cannot escape baseDir.
 * Throws if the target does not exist; returns null when it resolves outside baseDir.
 */
export function resolveSafeFilePath(baseDir: string, filePath: string): string | null {
  const normalized = path.normalize(filePath);
  if (isTraversal(normalized)) return null;

  const baseReal = fs.realpathSync(baseDir);
  const fullReal = fs.realpathSync(path.resolve(path.join(baseDir, normalized)));
  return isWithinDir(baseReal, fullReal) ? fullReal : null;
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
  resolved: Pick<ResolvedScope, "homeClaudeDir" | "claudeDir" | "projectCwd" | "projectClaudeDir">,
  scope: FileZone | string,
  filePath: string,
): string | null {
  const normalized = path.normalize(filePath);
  if (isTraversal(normalized)) return null;

  // "user" zone is always ~/.claude. For a project scope, resolved.claudeDir is the
  // session dir (~/.claude/projects/<id>), so user-sourced (inherited) skills/commands/
  // agents/rules must resolve against homeClaudeDir — otherwise their file links 404.
  if (scope === "user") return resolved.homeClaudeDir;
  if (scope === "parent") {
    return PROJECT_ROOT_ALLOWLIST.has(normalized) && resolved.projectCwd ? resolved.projectCwd : null;
  }
  if (scope === "projectClaude") return resolved.projectClaudeDir;
  if (scope === "memory") {
    return isMemoryPath(normalized) ? resolved.claudeDir : path.join(resolved.claudeDir, "memory");
  }

  if (scope === "project") {
    if (PROJECT_ROOT_ALLOWLIST.has(normalized) && resolved.projectCwd) {
      return resolved.projectCwd;
    }
    if (isMemoryPath(normalized)) {
      return resolved.claudeDir;
    }
    if (resolved.projectClaudeDir) return resolved.projectClaudeDir;
  }
  return null;
}
