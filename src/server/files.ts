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
export function readDirRecursive(dir: string, base = "", seen: Set<string> = new Set()): TreeNode[] {
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
    // statSync (not Dirent.isDirectory) so symlinked dirs — e.g. a skill symlinked
    // into ~/.claude/skills/ — are recursed as directories, not listed as files.
    let stat: fs.Stats;
    try {
      stat = fs.statSync(full);
    } catch {
      continue; // broken symlink / unreadable
    }
    if (stat.isDirectory()) {
      // Guard against symlink cycles by tracking resolved real paths.
      let real: string;
      try {
        real = fs.realpathSync(full);
      } catch {
        real = full;
      }
      if (seen.has(real)) continue;
      items.push({
        name: entry.name,
        path: rel,
        type: "dir",
        children: readDirRecursive(full, rel, new Set(seen).add(real)),
      });
    } else {
      items.push({ name: entry.name, path: rel, type: "file", size: stat.size });
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
  // Lexical resolution (symlinks NOT followed here). `..`/absolute are already
  // rejected, so this path stays within the base tree lexically.
  const lexicalFull = path.resolve(baseReal, normalized);
  if (!isWithinDir(baseReal, lexicalFull)) return null;
  if (!fs.existsSync(lexicalFull)) return null;

  const fullReal = fs.realpathSync(lexicalFull);
  if (isWithinDir(baseReal, fullReal)) return fullReal; // no escape — normal file

  // The resolved path escaped baseDir via a symlink. Allow ONLY the intended
  // "mount" pattern: a single *directory* symlink that itself lives within base
  // (e.g. a skill dir symlinked into ~/.claude/skills/), with the target reached
  // without any further symlink hop, and the leaf staying inside that one target.
  // This supports symlinked skills without blanket-trusting nested/leaf symlinks
  // (a path-traversal vector flagged in review).
  const parts = path.relative(baseReal, lexicalFull).split(path.sep);
  let cur = baseReal;
  let mount: string | null = null;
  for (const part of parts) {
    cur = path.join(cur, part);
    let lst: fs.Stats;
    try {
      lst = fs.lstatSync(cur);
    } catch {
      return null;
    }
    if (lst.isSymbolicLink()) {
      if (mount) return null; // a second symlink hop — reject
      const target = fs.realpathSync(cur);
      if (!fs.statSync(target).isDirectory()) return null; // file symlink (leak) — reject
      mount = target;
      cur = target; // continue resolving within the mounted directory
    }
  }
  return mount && isWithinDir(mount, fullReal) ? fullReal : null;
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
