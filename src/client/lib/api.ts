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

export async function fetchTasks() {
  const res = await client.tasks.$get();
  if (!res.ok) throw new Error(`/api/tasks failed: ${res.status}`);
  return res.json();
}

export async function fetchFile(scopeId: string, zone: string, path: string) {
  const res = await client.file.$get({ query: { scopeId, zone, path } });
  if (!res.ok) throw new Error(`/api/file failed: ${res.status}`);
  return res.text();
}
