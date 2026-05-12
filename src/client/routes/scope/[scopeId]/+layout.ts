import { fetchScopes, fetchConfig, fetchVersion } from "$lib/api";
import type { ScopeEntry } from "$lib/types";

export async function load({ params }: { params: { scopeId: string } }) {
  const [scopes, config, ccVersion] = await Promise.all([
    fetchScopes(),
    fetchConfig(params.scopeId),
    fetchVersion(),
  ]);

  const projectScopes = scopes.filter((s: ScopeEntry) => s.scope !== "user");

  return {
    scopes: projectScopes,
    config,
    scopeId: params.scopeId,
    isProject: params.scopeId !== "user",
    ccVersion,
  };
}
