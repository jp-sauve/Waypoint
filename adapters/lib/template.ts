import type { Manifest, PlatformKey } from "./manifest.js";

const TOKEN_RE = /\{\{([a-zA-Z0-9:_-]+)\}\}/g;

/**
 * Replaces every {{artifact:...}} / {{command:...}} token in canonical prose with
 * its platform-specific resolution from manifest.yaml's `tokens` map. Throws on an
 * unresolvable token rather than emitting it verbatim — a stray token in installed
 * output is a build bug, not something a consumer should ever see.
 */
export function resolveTokens(body: string, platform: PlatformKey, tokens: Manifest["tokens"]): string {
  return body.replace(TOKEN_RE, (match, key: string) => {
    const entry = tokens[key];
    if (!entry) {
      throw new Error(`Unresolvable token ${match} — add it to manifest.yaml's "tokens" map.`);
    }
    return entry[platform];
  });
}

/** Strips the trailing "Applies to files matching: ..." line some methodology
 * fragments carry for human readers — the applyTo glob is authoritative in
 * manifest.yaml and is re-emitted as real frontmatter (Copilot) or omitted
 * (Claude, which has no path-scoped mechanism), so the prose line would be
 * either redundant or a source of drift if left in installed output. */
export function stripAppliesToLine(body: string): string {
  return body.replace(/\n+Applies to files matching:.*\s*$/s, "\n");
}

export function frontmatter(fields: Record<string, string>): string {
  const lines = Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
  return `---\n${lines.join("\n")}\n---\n\n`;
}

export interface ParsedFile {
  fields: Record<string, string>;
  body: string;
}

/** Splits a canonical file's leading `---\nkey: value\n---\n` block (if any) from
 * its body. Values may be a bare scalar or a JSON/YAML double-quoted string. */
export function parseFrontmatter(raw: string): ParsedFile {
  if (!raw.startsWith("---\n")) {
    return { fields: {}, body: raw };
  }
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) {
    return { fields: {}, body: raw };
  }
  const block = raw.slice(4, end);
  const body = raw.slice(end + 5).replace(/^\s+/, "");
  const fields: Record<string, string> = {};
  for (const line of block.split("\n")) {
    if (!line.trim()) continue;
    const sep = line.indexOf(": ");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 2).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = JSON.parse(value);
    }
    fields[key] = value;
  }
  return { fields, body };
}
