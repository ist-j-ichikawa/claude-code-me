/** Scope (Claude Code official term): user-global or project-specific. */
export type ScopeType = "user" | "project";

/** File serving zone. `project` is retained as the legacy project .claude zone. */
export type FileZone = ScopeType | "parent" | "projectClaude" | "memory";

/** Scope entry returned by /api/scopes */
export interface Scope {
  scopeId: string;
  scope: ScopeType;
  label: string;
  lastModified: string | null;
  sessionCount: number;
}

/** Resolved scope paths */
export interface ResolvedScope {
  scope: ScopeType;
  /** Always ~/.claude. The "user" file zone resolves here regardless of the active scope. */
  homeClaudeDir: string;
  /** For a project scope this is the session dir (~/.claude/projects/<id>), NOT ~/.claude. */
  claudeDir: string;
  projectCwd: string | null;
  projectClaudeDir: string | null;
}

/** File reference in config (e.g., CLAUDE.md, hooks, rules) */
export interface FileRef {
  scope: ScopeType;
  zone?: FileZone;
  path: string;
  name?: string;
  size?: number;
}

/** Tree node for directory listing (matches `files.ts` TreeNode). */
export interface ConfigEntry {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  children?: ConfigEntry[];
  /** Which scope contributed this entry. Always set on /api/config responses. */
  scope: ScopeType;
}

/** Full config for a scope, returned by /api/config */
export interface ScopeConfig {
  scope: ScopeType;
  scopeId: string;
  claudeDir: string;
  projectCwd: string | null;
  projectClaudeDir: string | null;
  /**
   * For project scope, the project's OWN settings.json only (user settings still
   * apply at runtime but are not shown here). For user scope, the user settings.
   */
  settings: Record<string, unknown> | null;
  settingsLocal: Record<string, unknown> | null;
  claudeMd: FileRef | null;
  mcpJson: { content: Record<string, unknown> } | null;
  hooks: ConfigEntry[];
  rules: ConfigEntry[];
  skills: ConfigEntry[];
  commands: ConfigEntry[];
  agents: ConfigEntry[];
  memory: ConfigEntry[];
  sessionCount: number;
}

/** Session entry returned by /api/sessions */
export interface Session {
  sessionId: string;
  name: string;
  customTitle: string | null;
  slug: string | null;
  summary: string | null;
  lastModified: string | null;
}
