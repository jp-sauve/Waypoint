import { readFileSync } from "node:fs";
import path from "node:path";
import type { Manifest } from "../lib/manifest.js";
import { frontmatter, parseFrontmatter, resolveTokens, stripAppliesToLine } from "../lib/template.js";
import type { BuiltFile } from "../lib/types.js";

/** Renders manifest.yaml's artifacts into the Copilot shape: prompt files, path-scoped
 * `.instructions.md` files, one always-on copilot-instructions.md, and (for the
 * checklist, which has no Copilot-native skill mechanism) a shared references
 * directory. Pure transform — same canonical source as the Claude adapter. */
export function buildCopilot(manifest: Manifest, canonicalRoot: string): BuiltFile[] {
  const files: BuiltFile[] = [];
  const read = (rel: string) => readFileSync(path.join(canonicalRoot, rel), "utf8");
  // Copilot has no global/user-level install mechanism at all (see manifest.yaml's
  // platforms.copilot.globalInstallSupported: false) — every artifact installs
  // per-project for Copilot, regardless of what installScope says for Claude.
  const copilotSupportsGlobal = manifest.platforms.copilot.globalInstallSupported;
  const scopeDirOf = (installScope: "global" | "project") =>
    installScope === "global" && copilotSupportsGlobal ? "global" : "project";

  for (const artifact of manifest.artifacts) {
    const cfg = artifact.platforms.copilot;
    if (!cfg) continue;
    const scopeDir = scopeDirOf(artifact.installScope);

    if (cfg.type === "prompt") {
      const { fields: existing, body: rawBody } = parseFrontmatter(read(artifact.source!));
      const body = resolveTokens(rawBody, "copilot", manifest.tokens);
      const description = existing.description ?? artifact.description!;
      const fm = frontmatter({ agent: "agent", description });
      files.push({ path: `${scopeDir}/${cfg.installPath}`, content: fm + body });

      for (const bundled of artifact.bundledFiles ?? []) {
        const base = path.basename(bundled);
        if (!cfg.bundledFilesInstallPath) continue;
        files.push({ path: `${scopeDir}/${cfg.bundledFilesInstallPath}/${base}`, content: read(bundled) });
      }
    } else if (cfg.type === "always-on") {
      const sections = (cfg.includes ?? []).map((fragment) => {
        const body = read(`methodology/implementer/${fragment}.md`);
        return stripAppliesToLine(resolveTokens(body, "copilot", manifest.tokens)).trimEnd();
      });
      files.push({ path: `${scopeDir}/${cfg.installPath}`, content: sections.join("\n\n---\n\n") + "\n" });
    } else if (cfg.type === "scoped") {
      const body = stripAppliesToLine(resolveTokens(read(artifact.source!), "copilot", manifest.tokens));
      const fm = frontmatter({ applyTo: artifact.applyTo! });
      files.push({ path: `${scopeDir}/${cfg.installPath}`, content: fm + body });
    } else if (cfg.type === "references") {
      for (const bundled of artifact.bundledFiles ?? []) {
        const base = path.basename(bundled);
        files.push({ path: `${scopeDir}/${cfg.bundledFilesInstallPath}/${base}`, content: read(bundled) });
      }
    }
  }

  return files;
}
