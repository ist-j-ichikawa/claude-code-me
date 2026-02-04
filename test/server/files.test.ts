import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { useTmpDir } from "./helpers";
import {
  listJsonlFiles,
  readDirRecursive,
  readJsonFile,
  resolveZoneDir,
  PARENT_ALLOWLIST,
} from "../../src/server/files";

// --- listJsonlFiles ---

describe("listJsonlFiles", () => {
  const tmp = useTmpDir();

  it(".jsonl ファイルだけを返す", () => {
    fs.writeFileSync(path.join(tmp.get(), "a.jsonl"), "{}");
    fs.writeFileSync(path.join(tmp.get(), "b.jsonl"), "{}");
    fs.writeFileSync(path.join(tmp.get(), "c.json"), "{}");
    fs.writeFileSync(path.join(tmp.get(), "readme.md"), "");

    const result = listJsonlFiles(tmp.get());
    expect(result).toHaveLength(2);
    expect(result.every((f) => f.endsWith(".jsonl"))).toBe(true);
  });

  it("存在しないディレクトリでは空配列を返す", () => {
    const result = listJsonlFiles(path.join(tmp.get(), "nonexistent"));
    expect(result).toEqual([]);
  });

  it("JSONL が 0 件のディレクトリでは空配列を返す", () => {
    fs.writeFileSync(path.join(tmp.get(), "settings.json"), "{}");
    const result = listJsonlFiles(tmp.get());
    expect(result).toEqual([]);
  });
});

// --- readDirRecursive ---

describe("readDirRecursive", () => {
  const tmp = useTmpDir();

  it("存在しないディレクトリでは空配列を返す", () => {
    const result = readDirRecursive(path.join(tmp.get(), "nonexistent"));
    expect(result).toEqual([]);
  });

  it("空のディレクトリでは空配列を返す", () => {
    const result = readDirRecursive(tmp.get());
    expect(result).toEqual([]);
  });

  it("ファイルを type=file で返す", () => {
    fs.writeFileSync(path.join(tmp.get(), "a.md"), "# hello");

    const result = readDirRecursive(tmp.get());
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("a.md");
    expect(result[0].type).toBe("file");
    expect(result[0].size).toBeGreaterThan(0);
  });

  it("サブディレクトリを type=dir + children で再帰的に返す", () => {
    const sub = path.join(tmp.get(), "sub");
    fs.mkdirSync(sub);
    fs.writeFileSync(path.join(sub, "b.md"), "content");

    const result = readDirRecursive(tmp.get());
    const dir = result.find((r) => r.type === "dir");
    expect(dir).toBeDefined();
    expect(dir!.name).toBe("sub");
    expect(dir!.children).toHaveLength(1);
    expect(dir!.children![0].name).toBe("b.md");
    expect(dir!.children![0].path).toBe(path.join("sub", "b.md"));
  });

  it("ネストしたパスが相対パスとして正しく構築される", () => {
    fs.mkdirSync(path.join(tmp.get(), "a", "b"), { recursive: true });
    fs.writeFileSync(path.join(tmp.get(), "a", "b", "c.txt"), "deep");

    const result = readDirRecursive(tmp.get());
    const a = result.find((r) => r.name === "a");
    const b = a!.children!.find((r) => r.name === "b");
    const c = b!.children!.find((r) => r.name === "c.txt");
    expect(c!.path).toBe(path.join("a", "b", "c.txt"));
  });
});

// --- readJsonFile ---

describe("readJsonFile", () => {
  const tmp = useTmpDir();

  it("有効な JSON ファイルをパースして返す", () => {
    const filePath = path.join(tmp.get(), "test.json");
    fs.writeFileSync(filePath, '{"key": "value"}');
    const result = readJsonFile(filePath);
    expect(result).toEqual({ key: "value" });
  });

  it("存在しないファイルでは null を返す", () => {
    const result = readJsonFile(path.join(tmp.get(), "nope.json"));
    expect(result).toBeNull();
  });

  it("不正な JSON では null を返す", () => {
    const filePath = path.join(tmp.get(), "bad.json");
    fs.writeFileSync(filePath, "not json");
    const result = readJsonFile(filePath);
    expect(result).toBeNull();
  });
});

// --- resolveZoneDir ---

describe("resolveZoneDir", () => {
  const resolved = {
    scope: "project" as const,
    claudeDir: "/home/.claude/projects/foo",
    parentDir: "/home/projects/foo",
    projectClaudeDir: "/home/projects/foo/.claude",
  };

  it("zone=claude は claudeDir を返す", () => {
    expect(resolveZoneDir(resolved, "claude", "any-file")).toBe(resolved.claudeDir);
  });

  it("zone=projectClaude は projectClaudeDir を返す", () => {
    expect(resolveZoneDir(resolved, "projectClaude", "any-file")).toBe(resolved.projectClaudeDir);
  });

  it("zone=memory は claudeDir/memory を返す", () => {
    expect(resolveZoneDir(resolved, "memory", "any-file")).toBe(
      path.join(resolved.claudeDir, "memory"),
    );
  });

  it("zone=parent でホワイトリストのファイルは parentDir を返す", () => {
    for (const allowed of PARENT_ALLOWLIST) {
      expect(resolveZoneDir(resolved, "parent", allowed)).toBe(resolved.parentDir);
    }
  });

  it("zone=parent でホワイトリスト外のファイルは null を返す", () => {
    expect(resolveZoneDir(resolved, "parent", "package.json")).toBeNull();
  });

  it("parentDir が null のとき zone=parent は null を返す", () => {
    const noParent = { ...resolved, parentDir: null };
    expect(resolveZoneDir(noParent, "parent", "CLAUDE.md")).toBeNull();
  });

  it("projectClaudeDir が null のとき zone=projectClaude は null を返す", () => {
    const noProject = { ...resolved, projectClaudeDir: null };
    expect(resolveZoneDir(noProject, "projectClaude", "any")).toBeNull();
  });

  it("不明な zone は null を返す", () => {
    expect(resolveZoneDir(resolved, "unknown", "any")).toBeNull();
  });

  it("パストラバーサル (../) を含むパスは null を返すこと", () => {
    expect(resolveZoneDir(resolved, "claude", "../../etc/passwd")).toBeNull();
    expect(resolveZoneDir(resolved, "memory", "../secret")).toBeNull();
    expect(resolveZoneDir(resolved, "projectClaude", "../../.env")).toBeNull();
  });

  it("絶対パスは null を返すこと", () => {
    expect(resolveZoneDir(resolved, "claude", "/etc/passwd")).toBeNull();
  });
});
