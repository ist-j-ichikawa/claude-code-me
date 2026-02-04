import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { useTmpDir } from "./helpers";
import { detectClaudeMd } from "../../src/server/config";

describe("detectClaudeMd", () => {
  const tmp = useTmpDir();

  function mkDir(rel: string): string {
    const d = path.join(tmp.get(), rel);
    fs.mkdirSync(d, { recursive: true });
    return d;
  }

  function touch(dir: string, name: string): void {
    fs.writeFileSync(path.join(dir, name), "# test");
  }

  it("user scope: claudeDir に CLAUDE.md があれば zone=claude を返す", () => {
    const claudeDir = mkDir("claude");
    touch(claudeDir, "CLAUDE.md");

    const result = detectClaudeMd("user", claudeDir, null, null);
    expect(result).toEqual({ zone: "claude", path: "CLAUDE.md" });
  });

  it("user scope: CLAUDE.md がなければ null を返す", () => {
    const claudeDir = mkDir("claude");
    const result = detectClaudeMd("user", claudeDir, null, null);
    expect(result).toBeNull();
  });

  it("project scope: projectClaudeDir を最優先で検索する", () => {
    const claudeDir = mkDir("claude");
    const parentDir = mkDir("parent");
    const projectClaudeDir = mkDir("parent/.claude");

    touch(projectClaudeDir, "CLAUDE.md");
    touch(parentDir, "CLAUDE.md");

    const result = detectClaudeMd("project", claudeDir, parentDir, projectClaudeDir);
    expect(result!.zone).toBe("projectClaude");
  });

  it("project scope: projectClaudeDir になければ parentDir を検索する", () => {
    const claudeDir = mkDir("claude");
    const parentDir = mkDir("parent");
    const projectClaudeDir = mkDir("parent/.claude");

    touch(parentDir, "CLAUDE.md");

    const result = detectClaudeMd("project", claudeDir, parentDir, projectClaudeDir);
    expect(result!.zone).toBe("parent");
  });

  it("project scope: parentDir にもなければ claudeDir にフォールバックする", () => {
    const claudeDir = mkDir("claude");
    const parentDir = mkDir("parent");

    touch(claudeDir, "CLAUDE.md");

    const result = detectClaudeMd("project", claudeDir, parentDir, null);
    expect(result!.zone).toBe("claude");
  });

  it("project scope: どこにもなければ null を返す", () => {
    const claudeDir = mkDir("claude");
    const parentDir = mkDir("parent");

    const result = detectClaudeMd("project", claudeDir, parentDir, null);
    expect(result).toBeNull();
  });
});
