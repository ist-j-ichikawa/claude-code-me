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

  it("GET /api/tasks がタスクグループを返すこと", async () => {
    const res = await app.request("/api/tasks");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty("tasks");
      expect(data[0]).toHaveProperty("completed");
      expect(data[0]).toHaveProperty("total");
    }
  });

  it("GET /api/file でゾーンとパスが必要なこと", async () => {
    const res = await app.request("/api/file?scopeId=user");
    expect(res.status).toBe(400);
  });

  it("GET /api/file でパストラバーサルを拒否すること", async () => {
    const res = await app.request("/api/file?scopeId=user&zone=claude&path=../../etc/passwd");
    expect(res.status).toBe(403);
  });

  it("GET /api/file で zone が空の場合 Zod が 400 を返すこと", async () => {
    const res = await app.request("/api/file?scopeId=user&zone=&path=test");
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
});
