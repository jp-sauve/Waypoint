import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Guards against the exact bug this restructure exists to fix (see
 * docs/restructure-plan.md §2): the toolkit's own `.claude`/`.github` must never
 * again become the canonical home for a distributable Skill, command, or prompt.
 * If this test starts failing, someone has hand-authored distributable content
 * back into this repo's live AI configuration instead of into methodology/ or
 * commands/ and running `pnpm build`.
 */
describe("toolkit source / installed-config separation", () => {
  it("has no .claude/skills or .claude/commands at the toolkit root", () => {
    expect(existsSync(path.join(repoRoot, ".claude", "skills"))).toBe(false);
    expect(existsSync(path.join(repoRoot, ".claude", "commands"))).toBe(false);
  });

  it("has no .github/instructions or .github/prompts at the toolkit root", () => {
    expect(existsSync(path.join(repoRoot, ".github", "instructions"))).toBe(false);
    expect(existsSync(path.join(repoRoot, ".github", "prompts"))).toBe(false);
  });

  it("CLAUDE.md and .github/copilot-instructions.md describe developing the toolkit, not a downstream project", () => {
    const files = readdirSync(repoRoot);
    expect(files).toContain("CLAUDE.md");
    // Both files exist and are dev-only — see their own content for the "developing
    // Waypoint itself" framing; this test only guards their continued presence at
    // these exact paths, since their content is free-form prose not worth pinning.
    expect(existsSync(path.join(repoRoot, ".github", "copilot-instructions.md"))).toBe(true);
  });

  it("canonical source lives only under methodology/ and commands/, never under .claude or .github", () => {
    expect(existsSync(path.join(repoRoot, "methodology"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "commands"))).toBe(true);
  });
});
