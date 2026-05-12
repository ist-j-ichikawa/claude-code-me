import { fetchEnv, fetchHistory, fetchSessions } from "$lib/api";

export async function load({ params }: { params: { scopeId: string } }) {
  const isUser = params.scopeId === "user";
  if (isUser) {
    const [env, history] = await Promise.all([fetchEnv(), fetchHistory()]);
    return { env, history, sessions: null };
  }
  const sessions = await fetchSessions(params.scopeId);
  return { env: null, history: null, sessions };
}
