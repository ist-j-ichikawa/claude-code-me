import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { useTmpDir } from "./helpers";
import {
  listJsonlFiles,
  readDirRecursive,
  readJsonFile,
  resolveScopeDir,
  PROJECT_ROOT_ALLOWLIST,
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

// --- resolveScopeDir ---

describe("resolveScopeDir", () => {
  const resolved = {
    scope: "project" as const,
    claudeDir: "/home/.claude/projects/foo",
    projectCwd: "/home/projects/foo",
    projectClaudeDir: "/home/projects/foo/.claude",
  };

  it("scope=user は claudeDir を返す", () => {
    expect(resolveScopeDir(resolved, "user", "any-file")).toBe(resolved.claudeDir);
  });

  it("scope=project は projectClaudeDir を返す", () => {
    expect(resolveScopeDir(resolved, "project", "settings.json")).toBe(resolved.projectClaudeDir);
  });

  it("scope=project + path=memory/... は session memory (claudeDir) を返す", () => {
    expect(resolveScopeDir(resolved, "project", "memory/foo.md")).toBe(resolved.claudeDir);
    expect(resolveScopeDir(resolved, "project", "memory")).toBe(resolved.claudeDir);
  });

  it("scope=project + PROJECT_ROOT_ALLOWLIST のファイルは projectCwd を返す", () => {
    for (const allowed of PROJECT_ROOT_ALLOWLIST) {
      expect(resolveScopeDir(resolved, "project", allowed)).toBe(resolved.projectCwd);
    }
  });

  it("scope=project + allowlist 外でも projectClaudeDir にフォールバック", () => {
    expect(resolveScopeDir(resolved, "project", "package.json")).toBe(resolved.projectClaudeDir);
  });

  it("projectCwd が null のとき scope=project + CLAUDE.md は projectClaudeDir を返す", () => {
    const noParent = { ...resolved, projectCwd: null };
    expect(resolveScopeDir(noParent, "project", "CLAUDE.md")).toBe(resolved.projectClaudeDir);
  });

  it("projectClaudeDir が null のとき scope=project は null を返す", () => {
    const noProject = { ...resolved, projectClaudeDir: null };
    expect(resolveScopeDir(noProject, "project", "any")).toBeNull();
  });

  it("不明な scope は null を返す", () => {
    expect(resolveScopeDir(resolved, "unknown", "any")).toBeNull();
  });

  it("パストラバーサル (../) を含むパスは null を返すこと", () => {
    expect(resolveScopeDir(resolved, "user", "../../etc/passwd")).toBeNull();
    expect(resolveScopeDir(resolved, "project", "../secret")).toBeNull();
    expect(resolveScopeDir(resolved, "project", "../../.env")).toBeNull();
  });

  it("絶対パスは null を返すこと", () => {
    expect(resolveScopeDir(resolved, "user", "/etc/passwd")).toBeNull();
  });
});
