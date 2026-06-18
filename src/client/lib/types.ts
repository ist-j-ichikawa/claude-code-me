/** Scope (Claude Code official term): user-global or project-specific. */
export type ScopeType = "user" | "project";

/** File serving zone. `project` is retained as the legacy project .claude zone. */
export type FileZone = ScopeType | "parent" | "projectClaude" | "memory";

/** Scope entry from /api/scopes */
export interface ScopeEntry {
  id: string;
  scope: ScopeType;
  displayName: string;
  projectPath: string | null;
  claudeDir: string;
  sessionCount: number;
  lastModified: string | null;
}

/** File reference */
export interface FileRef {
  scope: ScopeType;
  zone?: FileZone;
  path: string;
  name?: string;
  size?: number;
}

/** Tree node */
export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  children?: TreeNode[];
  /** Which scope contributed this entry. Always set on /api/config responses. */
  scope: ScopeType;
}

/** Full config from /api/config */
export interface ScopeConfig {
  scope: ScopeType;
  scopeId: string;
  claudeDir: string;
  projectCwd: string | null;
  projectClaudeDir: string | null;
  /** Project scope: the project's own settings.json only (not merged with user). */
  settings: Record<string, unknown> | null;
  settingsLocal: Record<string, unknown> | null;
  claudeMd: FileRef | null;
  mcpJson: { content: Record<string, unknown> } | null;
  hooks: TreeNode[];
  rules: TreeNode[];
  skills: TreeNode[];
  commands: TreeNode[];
  agents: TreeNode[];
  memory: TreeNode[];
  sessionCount: number;
}

/** Session entry from /api/sessions */
export interface Session {
  sessionId: string;
  name: string;
  customTitle: string | null;
  slug: string | null;
  summary: string | null;
  lastModified: string | null;
}
