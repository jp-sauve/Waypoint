import { readFileSync } from "node:fs";
import path from "node:path";
import type { Manifest } from "../lib/manifest.js";
import { frontmatter, resolveTokens, stripAppliesToLine } from "../lib/template.js";
import type { BuiltFile } from "../lib/types.js";

/** Renders manifest.yaml's artifacts into the Claude Code shape: Skills, Commands,
 * and one always-on CLAUDE.md. Pure transform — no methodology content originates
 * here, it all comes from methodology/**\/*.md and commands/**\/*.md. */
export function buildClaude(manifest: Manifest, canonicalRoot: string): BuiltFile[] {
  const files: BuiltFile[] = [];
  const read = (rel: string) => readFileSync(path.join(canonicalRoot, rel), "utf8");
  const scopeDirOf = (installScope: "global" | "project") =>
    installScope === "global" ? "global" : "project";

  for (const artifact of manifest.artifacts) {
    const cfg = artifact.platforms.claude;
    if (!cfg) continue;
    const scopeDir = scopeDirOf(artifact.installScope);

    if (cfg.type === "skill") {
      const body = resolveTokens(read(artifact.source!), "claude", manifest.tokens);
      const fm = frontmatter({ name: artifact.name!, description: artifact.description! });
      files.push({ path: `${scopeDir}/${cfg.installPath}/SKILL.md`, content: fm + body });

      for (const bundled of artifact.bundledFiles ?? []) {
        const base = path.basename(bundled);
        const destDir = cfg.bundledFilesInstallPath ?? `${cfg.installPath}/templates`;
        files.push({ path: `${scopeDir}/${destDir}/${base}`, content: read(bundled) });
      }
    } else if (cfg.type === "command") {
      // commands/*.md already carry `description:` frontmatter in the exact shape
      // Claude Code commands expect — only the body's tokens need resolving.
      const raw = read(artifact.source!);
      const resolved = resolveTokensPreservingFrontmatter(raw, "claude", manifest.tokens);
      files.push({ path: `${scopeDir}/${cfg.installPath}`, content: resolved });
    } else if (cfg.type === "always-on") {
      const sections = (cfg.includes ?? []).map((fragment) => {
        const body = read(`methodology/implementer/${fragment}.md`);
        return stripAppliesToLine(resolveTokens(body, "claude", manifest.tokens)).trimEnd();
      });
      files.push({ path: `${scopeDir}/${cfg.installPath}`, content: sections.join("\n\n---\n\n") + "\n" });
    }
  }

  return files;
}

function resolveTokensPreservingFrontmatter(raw: string, platform: "claude", tokens: Manifest["tokens"]): string {
  if (!raw.startsWith("---\n")) return resolveTokens(raw, platform, tokens);
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return resolveTokens(raw, platform, tokens);
  const fm = raw.slice(0, end + 5);
  const body = raw.slice(end + 5);
  return fm + resolveTokens(body, platform, tokens);
}
