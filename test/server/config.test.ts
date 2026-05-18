import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { useTmpDir } from "./helpers";
import { detectClaudeMd, buildConfig } from "../../src/server/config";

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

  it("user scope: claudeDir に CLAUDE.md があれば scope=user を返す", () => {
    const claudeDir = mkDir("claude");
    touch(claudeDir, "CLAUDE.md");

    const result = detectClaudeMd("user", claudeDir, null, null);
    expect(result).toEqual({ scope: "user", path: "CLAUDE.md" });
  });

  it("user scope: CLAUDE.md がなければ null を返す", () => {
    const claudeDir = mkDir("claude");
    const result = detectClaudeMd("user", claudeDir, null, null);
    expect(result).toBeNull();
  });

  it("project scope: projectClaudeDir を最優先で検索する", () => {
    const claudeDir = mkDir("claude");
    const projectCwd = mkDir("parent");
    const projectClaudeDir = mkDir("parent/.claude");

    touch(projectClaudeDir, "CLAUDE.md");
    touch(projectCwd, "CLAUDE.md");

    const result = detectClaudeMd("project", claudeDir, projectCwd, projectClaudeDir);
    expect(result!.scope).toBe("project");
  });

  it("project scope: projectClaudeDir になければ projectCwd を検索する", () => {
    const claudeDir = mkDir("claude");
    const projectCwd = mkDir("parent");
    const projectClaudeDir = mkDir("parent/.claude");

    touch(projectCwd, "CLAUDE.md");

    const result = detectClaudeMd("project", claudeDir, projectCwd, projectClaudeDir);
    expect(result!.scope).toBe("project");
  });

  it("project scope: projectCwd にもなければ user (claudeDir) にフォールバックする", () => {
    const claudeDir = mkDir("claude");
    const projectCwd = mkDir("parent");

    touch(claudeDir, "CLAUDE.md");

    const result = detectClaudeMd("project", claudeDir, projectCwd, null);
    expect(result!.scope).toBe("user");
  });

  it("project scope: どこにもなければ null を返す", () => {
    const claudeDir = mkDir("claude");
    const projectCwd = mkDir("parent");

    const result = detectClaudeMd("project", claudeDir, projectCwd, null);
    expect(result).toBeNull();
  });
});

describe("buildConfig (project scope inheritance)", () => {
  const tmp = useTmpDir();

  function setup(): { homeClaudeDir: string; projectId: string; projectCwd: string } {
    const homeClaudeDir = path.join(tmp.get(), ".claude");
    fs.mkdirSync(homeClaudeDir, { recursive: true });

    const projectCwd = path.join(tmp.get(), "work", "my-proj");
    fs.mkdirSync(path.join(projectCwd, ".claude"), { recursive: true });

    const projectId = projectCwd.replaceAll("/", "-").replace(/^-/, "-");
    const projectSessionDir = path.join(homeClaudeDir, "projects", projectId);
    fs.mkdirSync(projectSessionDir, { recursive: true });

    fs.writeFileSync(
      path.join(projectSessionDir, "session.jsonl"),
      JSON.stringify({ cwd: projectCwd, sessionId: "abc" }) + "\n",
    );

    return { homeClaudeDir, projectId, projectCwd };
  }

  it("user の skill と project の skill を union 表示する", () => {
    const { homeClaudeDir, projectId, projectCwd } = setup();
    fs.mkdirSync(path.join(homeClaudeDir, "skills", "user-skill"), { recursive: true });
    fs.writeFileSync(path.join(homeClaudeDir, "skills", "user-skill", "SKILL.md"), "u");
    fs.mkdirSync(path.join(projectCwd, ".claude", "skills", "proj-skill"), { recursive: true });
    fs.writeFileSync(path.join(projectCwd, ".claude", "skills", "proj-skill", "SKILL.md"), "p");

    const cfg = buildConfig(projectId, homeClaudeDir);
    expect(cfg).not.toBeNull();
    const names = cfg!.skills.map((s) => ({ name: s.name, scope: s.scope }));
    expect(names).toContainEqual({ name: "user-skill", scope: "user" });
    expect(names).toContainEqual({ name: "proj-skill", scope: "project" });
  });

  it("同名 skill は project が user を上書き、scope=project になる", () => {
    const { homeClaudeDir, projectId, projectCwd } = setup();
    fs.mkdirSync(path.join(homeClaudeDir, "skills", "same"), { recursive: true });
    fs.writeFileSync(path.join(homeClaudeDir, "skills", "same", "SKILL.md"), "user");
    fs.mkdirSync(path.join(projectCwd, ".claude", "skills", "same"), { recursive: true });
    fs.writeFileSync(path.join(projectCwd, ".claude", "skills", "same", "SKILL.md"), "project");

    const cfg = buildConfig(projectId, homeClaudeDir);
    const same = cfg!.skills.find((s) => s.name === "same");
    expect(same?.scope).toBe("project");
  });

  it("settings は deep merge され、provenance に top-level key の scope を載せる", () => {
    const { homeClaudeDir, projectId, projectCwd } = setup();
    fs.writeFileSync(
      path.join(homeClaudeDir, "settings.json"),
      JSON.stringify({ model: "opus", permissions: { defaultMode: "ask" } }),
    );
    fs.writeFileSync(
      path.join(projectCwd, ".claude", "settings.json"),
      JSON.stringify({ effortLevel: "high", permissions: { allow: ["Bash"] } }),
    );

    const cfg = buildConfig(projectId, homeClaudeDir);
    expect(cfg!.settings).toMatchObject({
      model: "opus",
      effortLevel: "high",
      permissions: { defaultMode: "ask", allow: ["Bash"] },
    });
    expect(cfg!.settingsProvenance).toEqual({
      model: "user",
      effortLevel: "project",
      permissions: "project",
    });
  });

  it("user scope では settingsProvenance を返さない", () => {
    const { homeClaudeDir } = setup();
    fs.writeFileSync(path.join(homeClaudeDir, "settings.json"), JSON.stringify({ model: "opus" }));
    const cfg = buildConfig("user", homeClaudeDir);
    expect(cfg!.settingsProvenance).toBeUndefined();
  });
});
