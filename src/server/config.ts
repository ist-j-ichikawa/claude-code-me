import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { ScopeType, FileRef, ScopeConfig, Zone } from "./types";
import { readJsonFile, readDirRecursive, listJsonlFiles } from "./files";
import { resolveScope } from "./scopes";

export const HOME_CLAUDE_DIR = path.join(os.homedir(), ".claude");
const DOT_CLAUDE_JSON = path.join(os.homedir(), ".claude.json");

/**
 * Detect CLAUDE.md in the appropriate location.
 * Priority: projectClaudeDir > parentDir > claudeDir
 */
export function detectClaudeMd(
  scope: ScopeType,
  claudeDir: string,
  parentDir: string | null,
  projectClaudeDir: string | null,
): FileRef | null {
  const candidates: Array<{ dir: string; zone: Zone }> = [];

  if (scope === "project") {
    if (projectClaudeDir) candidates.push({ dir: projectClaudeDir, zone: "projectClaude" });
    if (parentDir) candidates.push({ dir: parentDir, zone: "parent" });
  }
  candidates.push({ dir: claudeDir, zone: "claude" });

  for (const { dir, zone } of candidates) {
    if (fs.existsSync(path.join(dir, "CLAUDE.md"))) {
      return { zone, path: "CLAUDE.md" };
    }
  }
  return null;
}

/**
 * Detect .mcp.json configuration.
 * Project scope: reads from parentDir/.mcp.json
 * User scope: reads mcpServers from ~/.claude.json
 */
export function detectMcpJson(
  scope: ScopeType,
  parentDir: string | null,
): { content: Record<string, unknown> } | null {
  if (scope === "project" && parentDir) {
    const content = readJsonFile(path.join(parentDir, ".mcp.json"));
    return content ? { content } : null;
  }
  const dotClaude = readJsonFile(DOT_CLAUDE_JSON);
  const servers = dotClaude?.mcpServers as Record<string, unknown> | undefined;
  if (servers && Object.keys(servers).length > 0) {
    return { content: { mcpServers: servers } };
  }
  return null;
}

/**
 * Build full config for a scope.
 * @param scopeId - 'user' or project directory name
 * @param homeClaudeDir - Override for ~/.claude/ (for testing). Defaults to ~/.claude/
 */
export function buildConfig(scopeId: string, homeClaudeDir = HOME_CLAUDE_DIR): ScopeConfig | null {
  const resolved = resolveScope(scopeId, homeClaudeDir);
  if (!resolved) return null;
  const { scope, claudeDir, parentDir, projectClaudeDir } = resolved;

  const contentDir =
    scope === "project" && projectClaudeDir && fs.existsSync(projectClaudeDir)
      ? projectClaudeDir
      : claudeDir;

  const userSettings = readJsonFile(path.join(homeClaudeDir, "settings.json"));
  const settings =
    scope === "user" ? userSettings : readJsonFile(path.join(contentDir, "settings.json"));
  const settingsLocal = readJsonFile(path.join(contentDir, "settings.local.json"));

  const sessionCount = listJsonlFiles(claudeDir).length;

  return {
    scope,
    scopeId: scopeId || "user",
    claudeDir,
    parentDir,
    projectClaudeDir,
    settings,
    userSettings: scope === "project" ? userSettings : null,
    settingsLocal,
    claudeMd: detectClaudeMd(scope, claudeDir, parentDir, projectClaudeDir),
    mcpJson: detectMcpJson(scope, parentDir),
    hooks: readDirRecursive(path.join(contentDir, "hooks")),
    rules: readDirRecursive(path.join(contentDir, "rules")),
    skills: readDirRecursive(path.join(contentDir, "skills")),
    plans: readDirRecursive(path.join(homeClaudeDir, "plans")),
    commands: readDirRecursive(path.join(contentDir, "commands")),
    agents: readDirRecursive(path.join(contentDir, "agents")),
    memory: readDirRecursive(path.join(claudeDir, "memory")),
    sessionCount,
  };
}
