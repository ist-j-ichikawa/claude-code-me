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

