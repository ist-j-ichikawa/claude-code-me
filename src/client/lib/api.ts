import { hc } from "hono/client";
import type { ApiType } from "../../server/routes";

const client = hc<ApiType>("/api");

export async function fetchScopes() {
  const res = await client.scopes.$get();
  if (!res.ok) throw new Error(`/api/scopes failed: ${res.status}`);
  return res.json();
}

export async function fetchConfig(scopeId: string) {
  const res = await client.config.$get({ query: { scopeId } });
  if (!res.ok) throw new Error(`/api/config failed: ${res.status}`);
  return res.json();
}

export async function fetchSessions(scopeId: string) {
  const res = await client.sessions.$get({ query: { scopeId } });
  if (!res.ok) throw new Error(`/api/sessions failed: ${res.status}`);
  return res.json();
}

export async function fetchEnv() {
  const res = await client.env.$get();
  if (!res.ok) throw new Error(`/api/env failed: ${res.status}`);
  return res.json();
}

export async function fetchHistory(limit = 500) {
  const res = await client.history.$get({ query: { limit: String(limit) } });
  if (!res.ok) throw new Error(`/api/history failed: ${res.status}`);
  return res.json();
}

export async function fetchVersion() {
  const res = await client.version.$get();
  if (!res.ok) return null;
  const data = await res.json();
  return data.version;
}

export async function fetchFile(scopeId: string, scope: string, path: string) {
  const res = await client.file.$get({ query: { scopeId, scope, path } });
  if (!res.ok) throw new Error(`/api/file failed: ${res.status}`);
  return res.text();
}
