import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { useTmpDir, writeFile } from "./helpers";
import { getTasks } from "../../src/server/tasks";

describe("getTasks", () => {
  const tmp = useTmpDir();

  it("タスクグループからタスク一覧を取得すること", () => {
    const tasksDir = path.join(tmp.get(), "tasks");
    const groupDir = path.join(tasksDir, "group-001");
    fs.mkdirSync(groupDir, { recursive: true });
    writeFile(
      groupDir,
      "1.json",
      JSON.stringify({
        id: "1",
        subject: "調査",
        description: "現状を確認する",
        status: "completed",
        blocks: [],
        blockedBy: [],
      }),
    );
    writeFile(
      groupDir,
      "2.json",
      JSON.stringify({
        id: "2",
        subject: "実装",
        description: "コードを書く",
        status: "pending",
        blocks: [],
        blockedBy: [],
      }),
    );

    const groups = getTasks(tasksDir);
    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe("group-001");
    expect(groups[0].tasks).toHaveLength(2);
    expect(groups[0].tasks[0].subject).toBe("調査");
  });

  it("空のタスクグループを除外すること", () => {
    const tasksDir = path.join(tmp.get(), "tasks");
    const emptyDir = path.join(tasksDir, "empty-group");
    fs.mkdirSync(emptyDir, { recursive: true });

    const groups = getTasks(tasksDir);
    expect(groups).toHaveLength(0);
  });

  it("存在しないディレクトリでは空配列を返すこと", () => {
    expect(getTasks(path.join(tmp.get(), "nonexistent"))).toEqual([]);
  });

  it("タスクグループ内のタスクを id 順でソートすること", () => {
    const tasksDir = path.join(tmp.get(), "tasks");
    const groupDir = path.join(tasksDir, "group-002");
    fs.mkdirSync(groupDir, { recursive: true });
    writeFile(groupDir, "3.json", JSON.stringify({ id: "3", subject: "C", status: "pending" }));
    writeFile(groupDir, "1.json", JSON.stringify({ id: "1", subject: "A", status: "completed" }));
    writeFile(groupDir, "2.json", JSON.stringify({ id: "2", subject: "B", status: "in_progress" }));

    const groups = getTasks(tasksDir);
    expect(groups[0].tasks.map((t) => t.id)).toEqual(["1", "2", "3"]);
  });

  it("completed/pending/in_progress のカウントを返すこと", () => {
    const tasksDir = path.join(tmp.get(), "tasks");
    const groupDir = path.join(tasksDir, "group-003");
    fs.mkdirSync(groupDir, { recursive: true });
    writeFile(groupDir, "1.json", JSON.stringify({ id: "1", subject: "A", status: "completed" }));
    writeFile(groupDir, "2.json", JSON.stringify({ id: "2", subject: "B", status: "completed" }));
    writeFile(groupDir, "3.json", JSON.stringify({ id: "3", subject: "C", status: "pending" }));

    const groups = getTasks(tasksDir);
    expect(groups[0].completed).toBe(2);
    expect(groups[0].total).toBe(3);
  });

  it("セッション ID からプロジェクトを紐付けること", () => {
    const tasksDir = path.join(tmp.get(), "tasks");
    const projectsDir = path.join(tmp.get(), "projects");

    // タスクグループ（UUID = セッション ID）
    const sessionId = "abc-session-001";
    const groupDir = path.join(tasksDir, sessionId);
    fs.mkdirSync(groupDir, { recursive: true });
    writeFile(groupDir, "1.json", JSON.stringify({ id: "1", subject: "Task A", status: "pending" }));

    // プロジェクトに対応する JSONL
    const projDir = path.join(projectsDir, "my-project");
    fs.mkdirSync(projDir, { recursive: true });
    writeFile(projDir, `${sessionId}.jsonl`, '{"cwd":"/Users/test/my-project"}\n');

    const groups = getTasks(tasksDir, projectsDir);
    expect(groups[0].project).toContain("my-project");
  });

  it("projectsDir 未指定なら project は null になること", () => {
    const tasksDir = path.join(tmp.get(), "tasks");
    const groupDir = path.join(tasksDir, "no-project");
    fs.mkdirSync(groupDir, { recursive: true });
    writeFile(groupDir, "1.json", JSON.stringify({ id: "1", subject: "X", status: "pending" }));

    const groups = getTasks(tasksDir);
    expect(groups[0].project).toBeNull();
  });
});
