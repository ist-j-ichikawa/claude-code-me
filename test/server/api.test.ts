import { describe, it, expect } from "vitest";
import { app } from "../../src/server/index";

describe("API E2E (app.request)", () => {
  it("GET /api/scopes がスコープ一覧を返すこと", async () => {
    const res = await app.request("/api/scopes");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].scope).toBe("user");
    expect(data[0].id).toBe("user");
  });

  it("GET /api/config がユーザー設定を返すこと", async () => {
    const res = await app.request("/api/config?scopeId=user");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.scope).toBe("user");
    expect(data.scopeId).toBe("user");
    expect(data).toHaveProperty("settings");
    expect(data).toHaveProperty("hooks");
    expect(data).toHaveProperty("sessionCount");
  });

  it("GET /api/config で存在しないスコープは 404 を返すこと", async () => {
    const res = await app.request("/api/config?scopeId=nonexistent-scope-xyz");
    expect(res.status).toBe(404);
  });

  it("GET /api/sessions がセッション一覧を返すこと", async () => {
    const res = await app.request("/api/sessions?scopeId=user");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("GET /api/sessions で存在しないスコープは 404 を返すこと", async () => {
    const res = await app.request("/api/sessions?scopeId=nonexistent-scope-xyz");
    expect(res.status).toBe(404);
  });

  it("GET /api/file でゾーンとパスが必要なこと", async () => {
    const res = await app.request("/api/file?scopeId=user");
    expect(res.status).toBe(400);
  });

  it("GET /api/file でパストラバーサルを拒否すること", async () => {
    const res = await app.request("/api/file?scopeId=user&scope=user&path=../../etc/passwd");
    expect(res.status).toBe(403);
  });

  it("GET /api/file で scope が空の場合 Zod が 400 を返すこと", async () => {
    const res = await app.request("/api/file?scopeId=user&scope=&path=test");
    expect(res.status).toBe(400);
  });

  it("GET /api/config で scopeId 省略時にデフォルト user が使われること", async () => {
    const res = await app.request("/api/config");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.scopeId).toBe("user");
  });

  it("GET /api/tree がツリーを返すこと", async () => {
    const res = await app.request("/api/tree?scopeId=user");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("GET /api/version が version または null を返すこと", async () => {
    const res = await app.request("/api/version");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("version");
    // upstream-version が存在すれば string、なければ null
    expect(data.version === null || typeof data.version === "string").toBe(true);
  });

  it("GET /api/insights が report.html または 404 を返すこと", async () => {
    const res = await app.request("/api/insights");
    // 環境に応じて 200 (ファイルあり) または 404 (なし) のどちらか
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get("content-type")).toMatch(/text\/html/);
      const body = await res.text();
      expect(body.length).toBeGreaterThan(0);
    }
  });
});
