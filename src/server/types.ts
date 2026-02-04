/** Scope type: user-global or project-specific */
export type ScopeType = "user" | "project";

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
  claudeDir: string;
  parentDir: string | null;
  projectClaudeDir: string | null;
}

/** Zone identifies where a file lives relative to a scope. */
export type Zone = "claude" | "parent" | "projectClaude" | "memory";

/** File reference in config (e.g., CLAUDE.md, hooks, rules) */
export interface FileRef {
  zone: Zone;
  path: string;
  name?: string;
  size?: number;
}

/** Full config for a scope, returned by /api/config */
export interface ScopeConfig {
  scope: ScopeType;
  scopeId: string;
  claudeDir: string;
  parentDir: string | null;
  projectClaudeDir: string | null;
  settings: Record<string, unknown> | null;
  settingsLocal: Record<string, unknown> | null;
  claudeMd: FileRef | null;
  mcpJson: { content: Record<string, unknown> } | null;
  hooks: FileRef[];
  rules: FileRef[];
  skills: FileRef[];
  plans: FileRef[];
  commands: FileRef[];
  agents: FileRef[];
  memory: FileRef[];
  sessionCount: number;
  userSettings?: Record<string, unknown> | null;
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
