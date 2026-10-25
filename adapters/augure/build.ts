import { readFileSync } from "node:fs";
import path from "node:path";
import type { Manifest } from "../lib/manifest.js";
import { frontmatter, resolveTokens, stripAppliesToLine } from "../lib/template.js";
import type { BuiltFile } from "../lib/types.js";

/** Renders manifest.yaml's artifacts into the Augure shape: SKILL.md skills,
 * Markdown commands, and one mergeable AGENTS.md. Pure transform — all methodology
 * content comes from methodology/**\/*.md and commands/**\/*.md. */
export function buildAugure(manifest: Manifest, canonicalRoot: string): BuiltFile[] {
  const files: BuiltFile[] = [];
  const read = (rel: string) => readFileSync(path.join(canonicalRoot, rel), "utf8");
  const scopeDirOf = (installScope: "global" | "project") => installScope === "global" ? "global" : "project";

  for (const artifact of manifest.artifacts) {
    const cfg = artifact.platforms.augure;
    if (!cfg) continue;
    const scopeDir = scopeDirOf(artifact.installScope);

    if (cfg.type === "skill") {
      const body = resolveTokens(read(artifact.source!), "augure", manifest.tokens);
      const fm = frontmatter({ name: artifact.name!, description: artifact.description! });
      files.push({ path: `${scopeDir}/${cfg.installPath}/SKILL.md`, content: fm + body });

      for (const bundled of artifact.bundledFiles ?? []) {
        const base = path.basename(bundled);
        const destDir = cfg.bundledFilesInstallPath ?? `${cfg.installPath}/templates`;
        files.push({ path: `${scopeDir}/${destDir}/${base}`, content: read(bundled) });
      }
    } else if (cfg.type === "command") {
      const resolved = resolveTokensPreservingFrontmatter(read(artifact.source!), manifest.tokens);
      files.push({ path: `${scopeDir}/${cfg.installPath}`, content: resolved });
    } else if (cfg.type === "always-on") {
      const sections = (cfg.includes ?? []).map((fragment) => {
        const body = read(`methodology/implementer/${fragment}.md`);
        return stripAppliesToLine(resolveTokens(body, "augure", manifest.tokens)).trimEnd();
      });
      files.push({ path: `${scopeDir}/${cfg.installPath}`, content: sections.join("\n\n---\n\n") + "\n", merge: true });
    } else if (cfg.type === "references") {
      for (const bundled of artifact.bundledFiles ?? []) {
        const base = path.basename(bundled);
        if (!cfg.bundledFilesInstallPath) continue;
        files.push({ path: `${scopeDir}/${cfg.bundledFilesInstallPath}/${base}`, content: read(bundled) });
      }
    }
  }

  return files;
}

function resolveTokensPreservingFrontmatter(raw: string, tokens: Manifest["tokens"]): string {
  if (!raw.startsWith("---\n")) return resolveTokens(raw, "augure", tokens);
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return resolveTokens(raw, "augure", tokens);
  const fm = raw.slice(0, end + 5);
  const body = raw.slice(end + 5);
  return fm + resolveTokens(body, "augure", tokens);
}
