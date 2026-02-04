import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { useTmpDir, writeFile } from "./helpers";
import {
  resolveCwdFromJsonl,
  discoverScopes,
  resolveScope,
  newestMtime,
} from "../../src/server/scopes";

describe("newestMtime", () => {
  const tmp = useTmpDir();

  it("ファイル群の中で最も新しい mtime を返すこと", () => {
    writeFile(tmp.get(), "a.jsonl", "{}");
    writeFile(tmp.get(), "b.jsonl", "{}");
    const result = newestMtime(tmp.get(), ["a.jsonl", "b.jsonl"]);
    expect(result).toBeGreaterThan(0);
  });

  it("ファイルが0件なら null を返すこと", () => {
    expect(newestMtime(tmp.get(), [])).toBeNull();
  });

  it("存在しないファイルはスキップすること", () => {
    writeFile(tmp.get(), "a.jsonl", "{}");
    const result = newestMtime(tmp.get(), ["a.jsonl", "nonexistent.jsonl"]);
    expect(result).toBeGreaterThan(0);
  });
});

describe("resolveCwdFromJsonl", () => {
  const tmp = useTmpDir();

  it("JSONL の cwd フィールドを抽出すること", () => {
    writeFile(tmp.get(), "session.jsonl", '{"cwd":"/home/user/project"}\n{"type":"user"}\n');
    const { cwd } = resolveCwdFromJsonl(tmp.get());
    expect(cwd).toBe("/home/user/project");
  });

  it("newestMtimeMs も返すこと", () => {
    writeFile(tmp.get(), "session.jsonl", '{"cwd":"/home"}\n');
    const { newestMtimeMs } = resolveCwdFromJsonl(tmp.get());
    expect(newestMtimeMs).toBeGreaterThan(0);
  });

  it("JSONL がない場合は cwd=null を返すこと", () => {
    const { cwd } = resolveCwdFromJsonl(tmp.get());
    expect(cwd).toBeNull();
  });

  it("cwd フィールドがない JSONL では cwd=null を返すこと", () => {
    writeFile(tmp.get(), "session.jsonl", '{"type":"user"}\n');
    const { cwd } = resolveCwdFromJsonl(tmp.get());
    expect(cwd).toBeNull();
  });

  it("キャッシュが効くこと（2回目の呼び出しで同じ結果）", () => {
    writeFile(tmp.get(), "session.jsonl", '{"cwd":"/cached"}\n');
    const first = resolveCwdFromJsonl(tmp.get());
    const second = resolveCwdFromJsonl(tmp.get());
    expect(first).toBe(second);
    expect(first.cwd).toBe("/cached");
  });
});

describe("discoverScopes", () => {
  const tmp = useTmpDir();

  it("User スコープを常に含むこと", () => {
    // tmp を claudeDir として使用
    const scopes = discoverScopes(tmp.get());
    expect(scopes[0].scope).toBe("user");
    expect(scopes[0].id).toBe("user");
  });

  it("projects/ 配下のディレクトリをプロジェクトスコープとして発見すること", () => {
    const projectsDir = path.join(tmp.get(), "projects");
    const projDir = path.join(projectsDir, "-Users-user-myproj");
    fs.mkdirSync(projDir, { recursive: true });
    writeFile(projDir, "session.jsonl", '{"cwd":"/Users/user/myproj"}\n');

    const scopes = discoverScopes(tmp.get());
    const proj = scopes.find((s) => s.id === "-Users-user-myproj");
    expect(proj).toBeDefined();
    expect(proj!.scope).toBe("project");
    expect(proj!.projectPath).toBe("/Users/user/myproj");
    expect(proj!.sessionCount).toBe(1);
  });

  it("cwd がないプロジェクトは decodeDirName でホームプレフィックスを除去すること", () => {
    const projectsDir = path.join(tmp.get(), "projects");
    const homeEncoded = os.homedir().replaceAll("/", "-");
    const projDir = path.join(projectsDir, homeEncoded + "-my-app");
    fs.mkdirSync(projDir, { recursive: true });
    // cwd フィールドなしの JSONL
    writeFile(projDir, "session.jsonl", '{"type":"user"}\n');

    const scopes = discoverScopes(tmp.get());
    const proj = scopes.find((s) => s.id === homeEncoded + "-my-app");
    expect(proj).toBeDefined();
    // ハイフン入りディレクトリ名が破壊されず、~/my-app として表示されること
    expect(proj!.displayName).toBe("~/my-app");
  });

  it("セッション 0 件のプロジェクトを除外すること", () => {
    const projectsDir = path.join(tmp.get(), "projects");
    const emptyDir = path.join(projectsDir, "empty-proj");
    fs.mkdirSync(emptyDir, { recursive: true });

    const scopes = discoverScopes(tmp.get());
    expect(scopes.find((s) => s.id === "empty-proj")).toBeUndefined();
  });

  it("プロジェクトスコープを lastModified 降順でソートすること", () => {
    const projectsDir = path.join(tmp.get(), "projects");
    const projA = path.join(projectsDir, "proj-a");
    const projB = path.join(projectsDir, "proj-b");
    fs.mkdirSync(projA, { recursive: true });
    fs.mkdirSync(projB, { recursive: true });
    writeFile(projA, "old.jsonl", '{"cwd":"/a"}\n');
    // projB が新しくなるように少し待つ
    writeFile(projB, "new.jsonl", '{"cwd":"/b"}\n');

    const scopes = discoverScopes(tmp.get());
    // User が先頭、その後プロジェクト
    expect(scopes[0].scope).toBe("user");
    const projects = scopes.filter((s) => s.scope === "project");
    expect(projects.length).toBe(2);
  });
});

describe("resolveScope", () => {
  const tmp = useTmpDir();

  it("user スコープを解決すること", () => {
    const result = resolveScope("user", tmp.get());
    expect(result).not.toBeNull();
    expect(result!.scope).toBe("user");
    expect(result!.claudeDir).toBe(tmp.get());
    expect(result!.parentDir).toBeNull();
  });

  it("存在するプロジェクトスコープを解決すること", () => {
    const projectsDir = path.join(tmp.get(), "projects");
    const projDir = path.join(projectsDir, "test-proj");
    fs.mkdirSync(projDir, { recursive: true });
    writeFile(projDir, "session.jsonl", '{"cwd":"/Users/user/test"}\n');

    const result = resolveScope("test-proj", tmp.get());
    expect(result).not.toBeNull();
    expect(result!.scope).toBe("project");
    expect(result!.parentDir).toBe("/Users/user/test");
    expect(result!.projectClaudeDir).toBe("/Users/user/test/.claude");
  });

  it("存在しないスコープは null を返すこと", () => {
    const result = resolveScope("nonexistent", tmp.get());
    expect(result).toBeNull();
  });
});
