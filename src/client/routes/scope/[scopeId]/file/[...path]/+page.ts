import { fetchFile } from "$lib/api";

export async function load({ params }: { params: { scopeId: string; path: string } }) {
  // path format: "zone:filepath" e.g. "claude:rules/my-rule.md"
  const raw = params.path;
  const colonIdx = raw.indexOf(":");
  if (colonIdx === -1) {
    return { content: "Invalid file reference", zone: "", filePath: raw, error: true };
  }

  const zone = raw.slice(0, colonIdx);
  const filePath = raw.slice(colonIdx + 1);

  try {
    const content = await fetchFile(params.scopeId, zone, filePath);
    return { content, zone, filePath, error: false };
  } catch {
    return { content: "File not found", zone, filePath, error: true };
  }
}
