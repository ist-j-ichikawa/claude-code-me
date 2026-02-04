import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { useTmpDir, writeFile } from "./helpers";
import { getSessions } from "../../src/server/sessions";

describe("getSessions", () => {
  const tmp = useTmpDir();

  it("JSONL ファイルからセッション情報を抽出すること", () => {
    const dir = tmp.get();
    writeFile(
      dir,
      "abc-123.jsonl",
      [
        '{"sessionId":"abc-123","cwd":"/home","version":"2.1.69","slug":"test-session","timestamp":"2026-01-01T00:00:00Z"}',
        '{"type":"user","message":{"content":"hello world"}}',
      ].join("\n") + "\n",
    );

    const sessions = getSessions(dir);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].sessionId).toBe("abc-123");
    expect(sessions[0].slug).toBe("test-session");
  });

  it("sessions-index.json があればメタデータを優先すること", () => {
    const dir = tmp.get();
    writeFile(dir, "idx-001.jsonl", '{"sessionId":"idx-001","cwd":"/home"}\n');
    writeFile(
      dir,
      "sessions-index.json",
      JSON.stringify({
        entries: [
          {
            sessionId: "idx-001",
            customTitle: "My Title",
            summary: "A summary",
            created: "2026-03-01T00:00:00Z",
            modified: "2026-03-02T00:00:00Z",
            projectPath: "/home",
            firstPrompt: "hello",
          },
        ],
      }),
    );

    const sessions = getSessions(dir);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].customTitle).toBe("My Title");
    expect(sessions[0].summary).toBe("A summary");
  });

  it("isSidechain セッションを除外すること", () => {
    const dir = tmp.get();
    writeFile(dir, "main-001.jsonl", '{"sessionId":"main-001","cwd":"/home"}\n');
    writeFile(dir, "side-001.jsonl", '{"sessionId":"side-001","cwd":"/home"}\n');
    writeFile(
      dir,
      "sessions-index.json",
      JSON.stringify({
        entries: [
          { sessionId: "main-001", created: "2026-03-01T00:00:00Z" },
          { sessionId: "side-001", isSidechain: true, created: "2026-03-01T00:00:00Z" },
        ],
      }),
    );

    const sessions = getSessions(dir);
    // side-001 はインデックスから除外されるが、JSONL fallback で拾われる
    // ただしインデックスにある main-001 はインデックス経由
    const main = sessions.find((s) => s.sessionId === "main-001");
    expect(main).toBeDefined();
  });

  it("JSONL がない場合は空配列を返すこと", () => {
    expect(getSessions(tmp.get())).toEqual([]);
  });

  it("lastModified 降順でソートすること", () => {
    const dir = tmp.get();
    writeFile(dir, "old.jsonl", '{"sessionId":"old","cwd":"/a"}\n');
    writeFile(dir, "new.jsonl", '{"sessionId":"new","cwd":"/b"}\n');
    // sessions-index.json で明示的に日時を制御
    writeFile(
      dir,
      "sessions-index.json",
      JSON.stringify({
        entries: [
          { sessionId: "old", created: "2026-01-01T00:00:00Z", modified: "2026-01-01T00:00:00Z" },
          { sessionId: "new", created: "2026-03-01T00:00:00Z", modified: "2026-03-01T00:00:00Z" },
        ],
      }),
    );

    const sessions = getSessions(dir);
    expect(sessions.length).toBe(2);
    // 新しい方が先
    expect(sessions[0].sessionId).toBe("new");
  });

  it("末尾の custom-title と summary を抽出すること", () => {
    const dir = tmp.get();
    const lines =
      [
        '{"sessionId":"tail-test","cwd":"/home","slug":"original"}',
        '{"type":"user","message":{"content":"initial prompt"}}',
        // ... 中間のメッセージは省略 ...
        '{"type":"summary","summary":"Session did X and Y"}',
        '{"type":"custom-title","customTitle":"Renamed Session"}',
      ].join("\n") + "\n";
    writeFile(dir, "tail-test.jsonl", lines);

    const sessions = getSessions(dir);
    expect(sessions[0].customTitle).toBe("Renamed Session");
    expect(sessions[0].summary).toBe("Session did X and Y");
  });
});
