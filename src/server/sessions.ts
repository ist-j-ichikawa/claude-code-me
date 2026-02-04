import fs from "node:fs";
import path from "node:path";
import type { Session } from "./types";
import { listJsonlFiles, readJsonFile } from "./files";
import { readJsonlHead, readJsonlTail, parseJsonLines } from "./jsonl";

/** Index entry from sessions-index.json */
interface IndexEntry {
  sessionId: string;
  customTitle?: string;
  summary?: string;
  created?: string;
  modified?: string;
  projectPath?: string;
  firstPrompt?: string;
  isSidechain?: boolean;
}

/**
 * Get all sessions for a scope directory.
 * Prefers sessions-index.json metadata when available, falls back to JSONL head/tail parsing.
 * @param dir - The claudeDir for the scope (e.g., ~/.claude/projects/<id>/)
 */
export function getSessions(dir: string): Session[] {
  // Build lookup from sessions-index.json (has customTitle, summary)
  const index = readJsonFile(path.join(dir, "sessions-index.json"));
  const indexMap = new Map<string, IndexEntry>();
  if (index?.entries && Array.isArray(index.entries)) {
    for (const e of index.entries as IndexEntry[]) {
      if (!e.isSidechain) indexMap.set(e.sessionId, e);
    }
  }

  const jsonlFiles = listJsonlFiles(dir);
  if (jsonlFiles.length === 0) return [];

  const sessions: Session[] = [];
  for (const filename of jsonlFiles) {
    const filePath = path.join(dir, filename);
    const sessionId = filename.endsWith(".jsonl") ? filename.slice(0, -6) : filename;

    // Use index entry if available (faster, has rich metadata)
    const ie = indexMap.get(sessionId);
    if (ie) {
      sessions.push({
        sessionId,
        name: ie.customTitle || sessionId.slice(0, 8),
        customTitle: ie.customTitle ?? null,
        slug: null,
        summary: ie.summary ?? null,
        lastModified: ie.modified ?? ie.created ?? null,
      });
      continue;
    }

    // Fallback: parse JSONL head + tail
    try {
      const lines = readJsonlHead(filePath);
      let slug: string | null = null;

      parseJsonLines(lines, (obj) => {
        if (!slug && obj.slug) slug = obj.slug as string;
        return !!slug;
      });

      // Read tail for custom-title and summary
      let customTitle: string | null = null;
      let summary: string | null = null;
      const tail = readJsonlTail(filePath);
      parseJsonLines(
        tail.lines,
        (obj) => {
          if (!customTitle && obj.type === "custom-title" && obj.customTitle) {
            customTitle = obj.customTitle as string;
          }
          if (!summary && obj.type === "summary" && obj.summary) {
            summary = obj.summary as string;
          }
          return !!(customTitle && summary);
        },
        true,
      );

      const stat = tail.stat ?? fs.statSync(filePath);
      sessions.push({
        sessionId,
        name: customTitle || slug || sessionId.slice(0, 8),
        customTitle,
        slug,
        summary,
        lastModified: stat.mtime.toISOString(),
      });
    } catch {
      /* skip unreadable */
    }
  }

  sessions.sort((a, b) => ((b.lastModified ?? "") > (a.lastModified ?? "") ? 1 : -1));
  return sessions;
}
