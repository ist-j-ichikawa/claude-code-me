import fs from "node:fs";
import path from "node:path";
import { readJsonlRange, parseJsonLines } from "./jsonl";

export interface HistoryEntry {
  display: string;
  timestamp: number;
  project: string;
}

/**
 * Read recent prompt history from ~/.claude/history.jsonl.
 * Returns newest-first, capped at `limit` entries.
 *
 * history.jsonl is an append-only log of every prompt the user typed,
 * across all projects. Each line: { display, pastedContents, timestamp, project }.
 * It is NOT a session log — sessions live in ~/.claude/projects/<id>/<sid>.jsonl.
 */
export function getHistory(homeClaudeDir: string, limit = 500): HistoryEntry[] {
  const filePath = path.join(homeClaudeDir, "history.jsonl");
  if (!fs.existsSync(filePath)) return [];

  // Read up to ~1MB from the tail. With ~200 bytes/line average that's ~5000 entries —
  // plenty for a default limit of 500.
  let result;
  try {
    result = readJsonlRange(filePath, 1_000_000, true);
  } catch {
    return [];
  }

  const entries: HistoryEntry[] = [];
  parseJsonLines(result.lines, (obj) => {
    if (typeof obj.display === "string" && typeof obj.timestamp === "number") {
      entries.push({
        display: obj.display,
        timestamp: obj.timestamp,
        project: typeof obj.project === "string" ? obj.project : "",
      });
    }
  });

  return entries.slice(-limit).reverse();
}
