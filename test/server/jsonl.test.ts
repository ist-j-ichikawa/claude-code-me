import { describe, it, expect } from "vitest";
import path from "node:path";
import { useTmpDir, writeFile } from "./helpers";
import {
  parseJsonLines,
  readJsonlRange,
  readJsonlHead,
  readJsonlTail,
} from "../../src/server/jsonl";

// --- parseJsonLines ---

describe("parseJsonLines", () => {
  it("空の配列を渡すと visitor は呼ばれない", () => {
    let called = false;
    parseJsonLines([], () => {
      called = true;
    });
    expect(called).toBe(false);
  });

  it("各行をJSONパースして visitor に渡す", () => {
    const lines = ['{"a":1}', '{"a":2}', '{"a":3}'];
    const collected: number[] = [];
    parseJsonLines(lines, (obj) => {
      collected.push(obj.a as number);
    });
    expect(collected).toEqual([1, 2, 3]);
  });

  it("不正なJSONの行は無視してスキップする", () => {
    const lines = ['{"ok":true}', "NOT JSON", '{"ok":true}'];
    const collected: unknown[] = [];
    parseJsonLines(lines, (obj) => {
      collected.push(obj);
    });
    expect(collected).toHaveLength(2);
  });

  it("visitor が true を返すと走査を中断する", () => {
    const lines = ['{"a":1}', '{"a":2}', '{"a":3}'];
    const collected: number[] = [];
    parseJsonLines(lines, (obj) => {
      collected.push(obj.a as number);
      return obj.a === 2;
    });
    expect(collected).toEqual([1, 2]);
  });

  it("reverse=true のとき末尾から先頭へ走査する", () => {
    const lines = ['{"a":1}', '{"a":2}', '{"a":3}'];
    const collected: number[] = [];
    parseJsonLines(
      lines,
      (obj) => {
        collected.push(obj.a as number);
      },
      true,
    );
    expect(collected).toEqual([3, 2, 1]);
  });

  it("reverse=true でも visitor が true を返すと中断する", () => {
    const lines = ['{"a":1}', '{"a":2}', '{"a":3}'];
    const collected: number[] = [];
    parseJsonLines(
      lines,
      (obj) => {
        collected.push(obj.a as number);
        return obj.a === 2;
      },
      true,
    );
    expect(collected).toEqual([3, 2]);
  });

  it("空文字列のみの行は無視される", () => {
    const lines = ["", '{"a":1}', ""];
    const collected: number[] = [];
    parseJsonLines(lines, (obj) => {
      collected.push(obj.a as number);
    });
    expect(collected).toEqual([1]);
  });
});

// --- readJsonlRange / readJsonlHead / readJsonlTail ---

describe("readJsonlRange", () => {
  const tmp = useTmpDir();

  it("先頭から指定バイト数を読み取る", () => {
    const filePath = writeFile(tmp.get(), "a.jsonl", '{"n":1}\n{"n":2}\n{"n":3}\n');
    const { lines } = readJsonlRange(filePath, 8192, false);
    expect(lines).toEqual(['{"n":1}', '{"n":2}', '{"n":3}']);
  });

  it("末尾から指定バイト数を読み取る", () => {
    const head = '{"padding":"' + "x".repeat(5000) + '"}\n';
    const tail = '{"type":"summary","summary":"hello"}\n';
    const filePath = writeFile(tmp.get(), "b.jsonl", head + tail);

    const { lines } = readJsonlRange(filePath, 100, true);
    expect(lines.some((l) => l.includes('"summary"'))).toBe(true);
  });

  it("ファイルサイズより大きいバイト数を指定しても全体を読める", () => {
    const filePath = writeFile(tmp.get(), "c.jsonl", '{"n":1}\n');
    const { lines } = readJsonlRange(filePath, 999999, false);
    expect(lines).toEqual(['{"n":1}']);
  });

  it("stat を返す", () => {
    const filePath = writeFile(tmp.get(), "d.jsonl", '{"n":1}\n');
    const { stat } = readJsonlRange(filePath, 8192, false);
    expect(stat.size).toBeGreaterThan(0);
    expect(stat.mtime).toBeInstanceOf(Date);
  });
});

describe("readJsonlHead", () => {
  const tmp = useTmpDir();

  it("先頭 8KB 以内の行を返す", () => {
    const filePath = writeFile(tmp.get(), "e.jsonl", '{"cwd":"/home"}\n{"type":"user"}\n');
    const lines = readJsonlHead(filePath);
    expect(lines.length).toBeGreaterThanOrEqual(2);
    expect(lines[0]).toContain("cwd");
  });
});

describe("readJsonlTail", () => {
  const tmp = useTmpDir();

  it("末尾 4KB 以内の行を返す", () => {
    const head = '{"padding":"' + "x".repeat(5000) + '"}\n';
    const tail = '{"type":"custom-title","customTitle":"My Session"}\n';
    const filePath = writeFile(tmp.get(), "f.jsonl", head + tail);

    const result = readJsonlTail(filePath);
    expect(result.lines.some((l) => l.includes("My Session"))).toBe(true);
    expect(result.stat).not.toBeNull();
  });

  it("存在しないファイルでは空配列と null を返す", () => {
    const result = readJsonlTail(path.join(tmp.get(), "nonexistent.jsonl"));
    expect(result.lines).toEqual([]);
    expect(result.stat).toBeNull();
  });
});
