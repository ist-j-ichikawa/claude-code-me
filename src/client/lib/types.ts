/** Scope type */
export type ScopeType = "user" | "project";

/** Zone type */
export type Zone = "claude" | "parent" | "projectClaude" | "memory";

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
  zone: Zone;
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
}

/** Full config from /api/config */
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
  hooks: TreeNode[];
  rules: TreeNode[];
  skills: TreeNode[];
  commands: TreeNode[];
  agents: TreeNode[];
  memory: TreeNode[];
  sessionCount: number;
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
