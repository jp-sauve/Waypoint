import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { install } from "../scripts/install.js";
import { copyFixture, freshTempDir } from "./helpers/fixture.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cleanup: string[] = [];

afterEach(() => {
  for (const dir of cleanup.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function setup(fixture: string) {
  const targetDir = copyFixture(fixture);
  const globalHome = freshTempDir("global-home");
  cleanup.push(targetDir, globalHome);
  return { targetDir, globalHome };
}

describe("install", () => {
  it("writes both platforms' project and global files into an empty project", () => {
    const { targetDir, globalHome } = setup("empty-project");

    const summary = install({ targetDir, platforms: ["claude", "copilot"], globalHome, toolkitRoot: repoRoot });

    expect(summary.project.conflicts).toEqual([]);
    expect(summary.global.conflicts).toEqual([]);

    for (const rel of [
      "CLAUDE.md",
      ".claude/commands/next-step.md",
      ".claude/skills/web-engineering-checklist/SKILL.md",
      ".github/copilot-instructions.md",
      ".github/prompts/next-step.prompt.md",
      ".waypoint/checklist/references/owasp-top10.md",
      ".waypoint/install-manifest.json",
    ]) {
      expect(existsSync(path.join(targetDir, rel)), rel).toBe(true);
    }

    for (const rel of ["skills/gather-requirements/SKILL.md", "skills/project-planner/SKILL.md", ".waypoint-meta.json"]) {
      expect(existsSync(path.join(globalHome, ".claude", rel)), rel).toBe(true);
    }

    const record = JSON.parse(readFileSync(path.join(targetDir, ".waypoint", "install-manifest.json"), "utf8"));
    expect(record.toolkitVersion).toBe("0.4.0");
    expect(Object.keys(record.artifacts).length).toBeGreaterThan(0);
  });

  it("never touches pre-existing, unrelated files in the target repo", () => {
    const { targetDir, globalHome } = setup("claude-only-project");
    const untouchedPath = path.join(targetDir, ".claude/skills/some-other-skill/SKILL.md");
    const before = readFileSync(untouchedPath, "utf8");

    install({ targetDir, platforms: ["claude", "copilot"], globalHome, toolkitRoot: repoRoot });

    expect(readFileSync(untouchedPath, "utf8")).toBe(before);
  });

  it("only installs the requested platform", () => {
    const { targetDir, globalHome } = setup("empty-project");

    install({ targetDir, platforms: ["claude"], globalHome, toolkitRoot: repoRoot });

    expect(existsSync(path.join(targetDir, "CLAUDE.md"))).toBe(true);
    expect(existsSync(path.join(targetDir, ".github"))).toBe(false);
  });
});
