import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { readJsonFile } from "./files";
import { resolveCwdFromJsonl } from "./scopes";

/** A single task within a task group. */
export interface Task {
  id: string;
  subject: string;
  description?: string;
  activeForm?: string;
  status: "completed" | "pending" | "in_progress";
  blocks?: string[];
  blockedBy?: string[];
}

/** A task group (one directory under ~/.claude/tasks/). */
export interface TaskGroup {
  id: string;
  project: string | null;
  tasks: Task[];
  completed: number;
  total: number;
}

/**
 * Build a session-to-project lookup map from all sessions-index.json files.
 * Called once per /api/tasks request, not per task group.
 */
function buildProjectMap(projectsDir: string): Map<string, string> {
  const map = new Map<string, string>();
  let dirs: string[];
  try {
    dirs = fs.readdirSync(projectsDir);
  } catch {
    return map;
  }

  for (const dir of dirs) {
    const index = readJsonFile(path.join(projectsDir, dir, "sessions-index.json"));
    if (index?.entries && Array.isArray(index.entries)) {
      for (const e of index.entries as Array<Record<string, unknown>>) {
        if (e.sessionId && e.projectPath) {
          map.set(e.sessionId as string, (e.projectPath as string).replace(os.homedir(), "~"));
        }
      }
    }
  }
  return map;
}

/**
 * Resolve a task group UUID to a project display name.
 * Uses pre-built index map first, falls back to JSONL head read.
 */
function resolveTaskProject(
  sessionId: string,
  projectsDir: string,
  indexMap: Map<string, string>,
): string | null {
  // Strategy 1: index map (already built, O(1) lookup)
  const fromIndex = indexMap.get(sessionId);
  if (fromIndex) return fromIndex;

  // Strategy 2: JSONL fallback — find {sessionId}.jsonl in project dirs
  let dirs: string[];
  try {
    dirs = fs.readdirSync(projectsDir);
  } catch {
    return null;
  }

  for (const dir of dirs) {
    const dirPath = path.join(projectsDir, dir);
    try {
      const { cwd } = resolveCwdFromJsonl(dirPath, [`${sessionId}.jsonl`]);
      if (cwd) return cwd.replace(os.homedir(), "~");
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Read all task groups from the tasks directory.
 * Each subdirectory is a group containing numbered JSON task files.
 * Empty groups are excluded.
 */
export function getTasks(tasksDir: string, projectsDir?: string): TaskGroup[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(tasksDir, { withFileTypes: true });
  } catch {
    return [];
  }

  // Build index map once for all groups
  const indexMap = projectsDir ? buildProjectMap(projectsDir) : new Map<string, string>();

  const groups: TaskGroup[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const groupDir = path.join(tasksDir, entry.name);
    let files: string[];
    try {
      files = fs.readdirSync(groupDir).filter((f) => f.endsWith(".json"));
    } catch {
      continue;
    }

    if (files.length === 0) continue;

    const tasks: Task[] = [];
    for (const file of files) {
      const data = readJsonFile(path.join(groupDir, file));
      if (data?.id && data?.subject) {
        tasks.push({
          id: String(data.id),
          subject: String(data.subject),
          description: data.description ? String(data.description) : undefined,
          activeForm: data.activeForm ? String(data.activeForm) : undefined,
          status: (data.status as Task["status"]) ?? "pending",
          blocks: (data.blocks as string[]) ?? [],
          blockedBy: (data.blockedBy as string[]) ?? [],
        });
      }
    }

    if (tasks.length === 0) continue;

    tasks.sort((a, b) => Number(a.id) - Number(b.id));

    const project = projectsDir ? resolveTaskProject(entry.name, projectsDir, indexMap) : null;

    groups.push({
      id: entry.name,
      project,
      tasks,
      completed: tasks.filter((t) => t.status === "completed").length,
      total: tasks.length,
    });
  }

  return groups;
}
