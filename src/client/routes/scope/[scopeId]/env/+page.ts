import { fetchEnv } from "$lib/api";

export async function load() {
  const entries = await fetchEnv();
  return { entries };
}
