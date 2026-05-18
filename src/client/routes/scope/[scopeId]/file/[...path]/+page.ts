import { fetchFile } from "$lib/api";

export async function load({ params }: { params: { scopeId: string; path: string } }) {
  // path format: "scope:filepath" e.g. "user:rules/my-rule.md"
  const raw = params.path;
  const colonIdx = raw.indexOf(":");
  if (colonIdx === -1) {
    return { content: "Invalid file reference", scope: "", filePath: raw, error: true };
  }

  const scope = raw.slice(0, colonIdx);
  const filePath = raw.slice(colonIdx + 1);

  try {
    const content = await fetchFile(params.scopeId, scope, filePath);
    return { content, scope, filePath, error: false };
  } catch {
    return { content: "File not found", scope, filePath, error: true };
  }
}
