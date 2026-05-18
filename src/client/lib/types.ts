/** Scope (Claude Code official term): user-global or project-specific. */
export type ScopeType = "user" | "project";

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
  /** Project scope: User+Project deep-merged effective values. */
  settings: Record<string, unknown> | null;
  /** Project scope only: per-top-level-key scope. */
  settingsProvenance?: Record<string, ScopeType>;
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
  /** Project scope only: raw user settings (pre-merge). */
  userSettings?: Record<string, unknown> | null;
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
