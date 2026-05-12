import fs from "node:fs";
import path from "node:path";
import type { ResolvedScope, Zone } from "./types";

/** Tree node for directory listing. */
export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  children?: TreeNode[];
}

/** Files allowed to be served from the parent zone. */
export const PARENT_ALLOWLIST = new Set(["CLAUDE.md", ".mcp.json"]);

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
 * Resolve a zone + filePath to a base directory.
 * Enforces PARENT_ALLOWLIST for the parent zone.
 * Rejects path traversal attempts (.. or absolute paths).
 */
export function resolveZoneDir(
  resolved: Pick<ResolvedScope, "claudeDir" | "parentDir" | "projectClaudeDir">,
  zone: Zone | string,
  filePath: string,
): string | null {
  // Reject traversal attempts
  const normalized = path.normalize(filePath);
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) return null;

  if (zone === "claude") return resolved.claudeDir;
  if (zone === "parent" && resolved.parentDir) {
    return PARENT_ALLOWLIST.has(normalized) ? resolved.parentDir : null;
  }
  if (zone === "projectClaude" && resolved.projectClaudeDir) return resolved.projectClaudeDir;
  if (zone === "memory") return path.join(resolved.claudeDir, "memory");
  return null;
}
