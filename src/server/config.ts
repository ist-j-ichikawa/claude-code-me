import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { ScopeType, FileRef, ScopeConfig } from "./types";
import { readJsonFile, readDirRecursive, listJsonlFiles } from "./files";
import { resolveScope } from "./scopes";
import { mergeTrees, mergeSettings, tagTree } from "./merge";

export const HOME_CLAUDE_DIR = path.join(os.homedir(), ".claude");
const DOT_CLAUDE_JSON = path.join(os.homedir(), ".claude.json");

/**
 * Detect CLAUDE.md in the appropriate location.
 * Priority: project's .claude/ > project root (cwd) > user's ~/.claude/
 */
export function detectClaudeMd(
  scope: ScopeType,
  claudeDir: string,
  projectCwd: string | null,
  projectClaudeDir: string | null,
): FileRef | null {
  const candidates: Array<{ dir: string; scope: ScopeType }> = [];

  if (scope === "project") {
    if (projectClaudeDir) candidates.push({ dir: projectClaudeDir, scope: "project" });
    if (projectCwd) candidates.push({ dir: projectCwd, scope: "project" });
  }
  candidates.push({ dir: claudeDir, scope: "user" });

  for (const { dir, scope: s } of candidates) {
    if (fs.existsSync(path.join(dir, "CLAUDE.md"))) {
      return { scope: s, path: "CLAUDE.md" };
    }
  }
  return null;
}

/**
 * Detect .mcp.json configuration.
 * Project scope: reads from projectCwd/.mcp.json
 * User scope: reads mcpServers from ~/.claude.json
 */
export function detectMcpJson(
  scope: ScopeType,
  projectCwd: string | null,
): { content: Record<string, unknown> } | null {
  if (scope === "project" && projectCwd) {
    const content = readJsonFile(path.join(projectCwd, ".mcp.json"));
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
  const { scope, claudeDir, projectCwd, projectClaudeDir } = resolved;

  const contentDir =
    scope === "project" && projectClaudeDir && fs.existsSync(projectClaudeDir)
      ? projectClaudeDir
      : claudeDir;

  const userSettings = readJsonFile(path.join(homeClaudeDir, "settings.json"));
  const projectSettings =
    scope === "project" ? readJsonFile(path.join(contentDir, "settings.json")) : null;
  const settingsLocal = readJsonFile(path.join(contentDir, "settings.local.json"));

  const sessionCount = listJsonlFiles(claudeDir).length;

  if (scope === "user") {
    const userDir = (name: string) => tagTree(readDirRecursive(path.join(contentDir, name)), "user");
    return {
      scope,
      scopeId: scopeId || "user",
      claudeDir,
      projectCwd,
      projectClaudeDir,
      settings: userSettings,
      settingsLocal,
      claudeMd: detectClaudeMd(scope, claudeDir, projectCwd, projectClaudeDir),
      mcpJson: detectMcpJson(scope, projectCwd),
      hooks: userDir("hooks"),
      rules: userDir("rules"),
      skills: userDir("skills"),
      commands: userDir("commands"),
      agents: userDir("agents"),
      memory: tagTree(readDirRecursive(path.join(claudeDir, "memory")), "user"),
      sessionCount,
    };
  }

  const merged = mergeSettings(userSettings, projectSettings);
  const mergeDir = (name: string) =>
    mergeTrees(
      readDirRecursive(path.join(homeClaudeDir, name)),
      readDirRecursive(path.join(contentDir, name)),
    );

  return {
    scope,
    scopeId: scopeId || "user",
    claudeDir,
    projectCwd,
    projectClaudeDir,
    settings: merged.effective,
    settingsProvenance: merged.provenance,
    userSettings,
    settingsLocal,
    claudeMd: detectClaudeMd(scope, claudeDir, projectCwd, projectClaudeDir),
    // mcpJson is intentionally not merged: project `.mcp.json` is canonical for the
    // project; user `~/.claude.json` mcpServers don't auto-apply to projects.
    mcpJson: detectMcpJson(scope, projectCwd),
    hooks: mergeDir("hooks"),
    rules: mergeDir("rules"),
    skills: mergeDir("skills"),
    commands: mergeDir("commands"),
    agents: mergeDir("agents"),
    // memory is not merged: resolveScopeDir routes memory paths to the project
    // session dir, so surfacing user memory entries here would create dead links.
    // Tracked for a follow-up that distinguishes user vs project session memory.
    memory: tagTree(readDirRecursive(path.join(claudeDir, "memory")), "project"),
    sessionCount,
  };
}
