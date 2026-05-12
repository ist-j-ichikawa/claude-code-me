import fs from "node:fs";

/** JSONL visitor callback. Return true to stop iteration. */
export type JsonlVisitor = (obj: Record<string, unknown>) => boolean | void;

/** Result of reading a range from a JSONL file. */
export interface JsonlRangeResult {
  lines: string[];
  stat: fs.Stats;
}

/** Result of readJsonlTail (stat may be null if file missing). */
export interface JsonlTailResult {
  lines: string[];
  stat: fs.Stats | null;
}

/**
 * Parse JSONL lines, calling visitor for each valid JSON object.
 * Invalid JSON lines are silently skipped.
 * If visitor returns true, iteration stops early.
 */
export function parseJsonLines(lines: string[], visitor: JsonlVisitor, reverse = false): void {
  const len = lines.length;
  for (let i = reverse ? len - 1 : 0; reverse ? i >= 0 : i < len; reverse ? i-- : i++) {
    try {
      const obj = JSON.parse(lines[i]);
      if (visitor(obj)) break;
    } catch {
      /* partial or invalid line — skip */
    }
  }
}

/**
 * Read a byte range from a JSONL file (head or tail).
 * Uses fd-based reading with try/finally for safe cleanup.
 */
export function readJsonlRange(
  filePath: string,
  bytes: number,
  fromEnd: boolean,
): JsonlRangeResult {
  const fd = fs.openSync(filePath, "r");
  try {
    const stat = fs.fstatSync(fd);
    const readSize = Math.min(bytes, stat.size);
    const position = fromEnd ? stat.size - readSize : 0;
    const buf = Buffer.alloc(readSize);
    fs.readSync(fd, buf, 0, readSize, position);
    return {
      lines: buf.toString("utf-8").split("\n").filter(Boolean),
      stat,
    };
  } finally {
    fs.closeSync(fd);
  }
}

/** Read first 8KB of a JSONL file, return lines. */
export function readJsonlHead(filePath: string): string[] {
  return readJsonlRange(filePath, 8192, false).lines;
}

/** Read last 4KB of a JSONL file. Returns empty on missing file. */
export function readJsonlTail(filePath: string): JsonlTailResult {
  try {
    return readJsonlRange(filePath, 4096, true);
  } catch {
    return { lines: [], stat: null };
  }
}
