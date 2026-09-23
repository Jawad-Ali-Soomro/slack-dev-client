/**
 * Decode base64url-encoded JSON from the Chrome extension `meta` query param.
 */
export function decodeExtensionMeta(encoded) {
  if (!encoded || typeof encoded !== "string") return null;
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (padded.length % 4)) % 4;
    const base64 = padded + "=".repeat(padLength);
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function hasCaptureMetadata(meta) {
  return Boolean(meta && (meta.website || meta.browser || meta.device));
}
