import { fetchSessions } from "$lib/api";

export async function load({ params }: { params: { scopeId: string } }) {
  const sessions = await fetchSessions(params.scopeId);
  return { sessions };
}
