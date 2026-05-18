import { describe, it, expect } from "vitest";
import { mergeTrees, mergeSettings } from "../../src/server/merge";
import type { TreeNode } from "../../src/server/files";

describe("mergeTrees", () => {
  it("user のみ存在するノードは scope=user", () => {
    const user: TreeNode[] = [{ name: "a.md", path: "a.md", type: "file", size: 1 }];
    const result = mergeTrees(user, []);
    expect(result).toEqual([
      { name: "a.md", path: "a.md", type: "file", size: 1, scope: "user" },
    ]);
  });

  it("project のみ存在するノードは scope=project", () => {
    const project: TreeNode[] = [{ name: "b.md", path: "b.md", type: "file", size: 2 }];
    const result = mergeTrees([], project);
    expect(result).toEqual([
      { name: "b.md", path: "b.md", type: "file", size: 2, scope: "project" },
    ]);
  });

  it("同名ファイルは project が user を上書きする", () => {
    const user: TreeNode[] = [{ name: "a.md", path: "a.md", type: "file", size: 1 }];
    const project: TreeNode[] = [{ name: "a.md", path: "a.md", type: "file", size: 99 }];
    const result = mergeTrees(user, project);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ path: "a.md", size: 99, scope: "project" });
  });

  it("同名ディレクトリは再帰的にマージされる", () => {
    const user: TreeNode[] = [
      {
        name: "skills",
        path: "skills",
        type: "dir",
        children: [{ name: "u.md", path: "skills/u.md", type: "file", size: 1 }],
      },
    ];
    const project: TreeNode[] = [
      {
        name: "skills",
        path: "skills",
        type: "dir",
        children: [{ name: "p.md", path: "skills/p.md", type: "file", size: 2 }],
      },
    ];
    const result = mergeTrees(user, project);
    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(2);
    const u = result[0].children!.find((c) => c.path === "skills/u.md");
    const p = result[0].children!.find((c) => c.path === "skills/p.md");
    expect(u?.scope).toBe("user");
    expect(p?.scope).toBe("project");
  });

  it("両方空なら空配列", () => {
    expect(mergeTrees([], [])).toEqual([]);
  });

  it("ファイル名衝突時、ディレクトリとファイルは別ノードのまま保持される", () => {
    const user: TreeNode[] = [{ name: "x", path: "x", type: "file", size: 1 }];
    const project: TreeNode[] = [{ name: "x", path: "x", type: "dir", children: [] }];
    const result = mergeTrees(user, project);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("dir");
    expect(result[0].scope).toBe("project");
  });
});

describe("mergeSettings", () => {
  it("user 単独の key は scope=user", () => {
    const result = mergeSettings({ model: "opus" }, null);
    expect(result.effective).toEqual({ model: "opus" });
    expect(result.provenance).toEqual({ model: "user" });
  });

  it("project 単独の key は scope=project", () => {
    const result = mergeSettings(null, { model: "sonnet" });
    expect(result.effective).toEqual({ model: "sonnet" });
    expect(result.provenance).toEqual({ model: "project" });
  });

  it("両方にある top-level スカラーは project が勝つ", () => {
    const result = mergeSettings({ model: "opus" }, { model: "sonnet" });
    expect(result.effective.model).toBe("sonnet");
    expect(result.provenance.model).toBe("project");
  });

  it("ネストした object は deep merge される", () => {
    const user = { permissions: { defaultMode: "ask", allow: ["a", "b"] } };
    const project = { permissions: { allow: ["c"] } };
    const result = mergeSettings(user, project);
    expect(result.effective.permissions).toEqual({
      defaultMode: "ask",
      allow: ["c"],
    });
    expect(result.provenance.permissions).toBe("project");
  });

  it("配列は merge せず project が user を置換する (Claude Code default)", () => {
    const user = { allow: ["a", "b"] };
    const project = { allow: ["c"] };
    const result = mergeSettings(user, project);
    expect(result.effective.allow).toEqual(["c"]);
  });

  it("両方 null なら空オブジェクトを返す", () => {
    const result = mergeSettings(null, null);
    expect(result.effective).toEqual({});
    expect(result.provenance).toEqual({});
  });

  it("user に無く project に存在する key の provenance は project", () => {
    const user = { model: "opus" };
    const project = { effortLevel: "high" };
    const result = mergeSettings(user, project);
    expect(result.provenance).toEqual({ model: "user", effortLevel: "project" });
  });
});
