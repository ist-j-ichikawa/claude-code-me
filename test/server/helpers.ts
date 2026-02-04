import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { beforeEach, afterEach } from "vitest";

/** Create a temporary directory per test, auto-cleaned after each test. */
export function useTmpDir(): { get: () => string } {
  let tmpDir = "";
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ccme-test-"));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
  return { get: () => tmpDir };
}

/** Write a file into a directory, returning the full path. */
export function writeFile(dir: string, name: string, content: string): string {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content);
  return p;
}
