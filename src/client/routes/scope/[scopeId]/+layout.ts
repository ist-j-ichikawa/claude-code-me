import { fetchScopes, fetchConfig } from "$lib/api";
import type { ScopeEntry } from "$lib/types";

export async function load({ params }: { params: { scopeId: string } }) {
  const isUser = params.scopeId === "user";

  // Parallel fetch: scopes + config + userConfig (if project)
  const [scopes, config, userConfigOrNull] = await Promise.all([
    fetchScopes(),
    fetchConfig(params.scopeId),
    isUser ? Promise.resolve(null) : fetchConfig("user"),
  ]);

  const userConfig = userConfigOrNull ?? config;
  const projectScopes = scopes.filter((s: ScopeEntry) => s.scope !== "user");

  return {
    scopes: projectScopes,
    config,
    userConfig,
    scopeId: params.scopeId,
    isProject: !isUser,
  };
}
