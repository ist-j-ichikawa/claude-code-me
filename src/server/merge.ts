import type { TreeNode } from "./files";
import type { ScopeType } from "./types";

export interface ScopedTreeNode extends Omit<TreeNode, "children"> {
  scope: ScopeType;
  children?: ScopedTreeNode[];
}

export function tagTree(nodes: TreeNode[], scope: ScopeType): ScopedTreeNode[] {
  return nodes.map((n) => ({
    ...n,
    scope,
    children: n.children ? tagTree(n.children, scope) : undefined,
  }));
}

/**
 * Merge user + project trees. Project overrides user on same-path collision.
 * Same-path directories are merged recursively; same-path files keep project's entry.
 */
export function mergeTrees(user: TreeNode[], project: TreeNode[]): ScopedTreeNode[] {
  const userByPath = new Map(user.map((n) => [n.path, n]));
  const projectByPath = new Map(project.map((n) => [n.path, n]));
  const allPaths = new Set([...userByPath.keys(), ...projectByPath.keys()]);

  const out: ScopedTreeNode[] = [];
  for (const p of allPaths) {
    const u = userByPath.get(p);
    const pr = projectByPath.get(p);
    if (u && pr && u.type === "dir" && pr.type === "dir") {
      out.push({
        ...pr,
        scope: "project",
        children: mergeTrees(u.children ?? [], pr.children ?? []),
      });
    } else if (pr) {
      out.push({
        ...pr,
        scope: "project",
        children: pr.children ? tagTree(pr.children, "project") : undefined,
      });
    } else if (u) {
      out.push({
        ...u,
        scope: "user",
        children: u.children ? tagTree(u.children, "user") : undefined,
      });
    }
  }
  return out;
}

export interface SettingsMerge {
  effective: Record<string, unknown>;
  provenance: Record<string, ScopeType>;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge(base: unknown, overlay: unknown): unknown {
  if (!isPlainObject(base) || !isPlainObject(overlay)) return overlay;
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(overlay)) {
    out[k] = deepMerge(base[k], overlay[k]);
  }
  return out;
}

/**
 * Deep merge user + project settings, returning effective values + per-top-level-key scope.
 * Project overrides user on key collision. Arrays are replaced, not concatenated.
 * Provenance tracks only top-level keys; nested overrides aren't broken out.
 */
export function mergeSettings(
  user: Record<string, unknown> | null,
  project: Record<string, unknown> | null,
): SettingsMerge {
  const u = user ?? {};
  const p = project ?? {};
  const effective = deepMerge(u, p) as Record<string, unknown>;
  const provenance: Record<string, ScopeType> = {};
  for (const k of Object.keys(effective)) {
    provenance[k] = k in p ? "project" : "user";
  }
  return { effective, provenance };
}
