import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { install } from "../scripts/install.js";
import { uninstall } from "../scripts/uninstall.js";
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

describe("uninstall", () => {
  it("removes every file it installed and the install-manifest itself", () => {
    const { targetDir, globalHome } = setup("empty-project");
    install({ targetDir, platforms: ["claude", "copilot"], globalHome, toolkitRoot: repoRoot });

    const summary = uninstall({ targetDir, globalHome, toolkitRoot: repoRoot });

    expect(summary.project.conflicts).toEqual([]);
    expect(existsSync(path.join(targetDir, "CLAUDE.md"))).toBe(false);
    expect(existsSync(path.join(targetDir, ".github/copilot-instructions.md"))).toBe(false);
    expect(existsSync(path.join(targetDir, ".waypoint"))).toBe(false);
  });

  it("leaves pre-existing, unrelated files alone", () => {
    const { targetDir, globalHome } = setup("copilot-only-project");
    const untouchedPath = path.join(targetDir, ".github/some-other-file.md");
    const before = readFileSync(untouchedPath, "utf8");
    install({ targetDir, platforms: ["copilot"], globalHome, toolkitRoot: repoRoot });

    uninstall({ targetDir, globalHome, toolkitRoot: repoRoot });

    expect(readFileSync(untouchedPath, "utf8")).toBe(before);
  });

  it("leaves a locally-edited file in place and reports a conflict, unless forced", () => {
    const { targetDir, globalHome } = setup("empty-project");
    install({ targetDir, platforms: ["claude"], globalHome, toolkitRoot: repoRoot });
    const editedPath = path.join(targetDir, "CLAUDE.md");
    writeFileSync(editedPath, "local edits\n", "utf8");

    const summary = uninstall({ targetDir, globalHome, toolkitRoot: repoRoot });
    expect(summary.project.conflicts.map((c) => c.destPath)).toContain(editedPath);
    expect(existsSync(editedPath)).toBe(true);

    const forced = uninstall({ targetDir, globalHome, force: true, toolkitRoot: repoRoot });
    expect(forced.project.conflicts).toEqual([]);
    expect(existsSync(editedPath)).toBe(false);
  });

  it("strips only the merged block from CLAUDE.md, keeping the consumer's own content", () => {
    const { targetDir, globalHome } = setup("empty-project");
    const claudeMdPath = path.join(targetDir, "CLAUDE.md");
    writeFileSync(claudeMdPath, "# Consumer notes\n\nKeep this.\n", "utf8");
    install({ targetDir, platforms: ["claude"], globalHome, toolkitRoot: repoRoot });

    const summary = uninstall({ targetDir, globalHome, toolkitRoot: repoRoot });

    expect(summary.project.conflicts).toEqual([]);
    expect(existsSync(claudeMdPath)).toBe(true);
    const after = readFileSync(claudeMdPath, "utf8");
    expect(after).toBe("# Consumer notes\n\nKeep this.\n");
    expect(after).not.toContain("waypoint:begin");
  });

  it("removes global artifacts only when includeGlobal is set", () => {
    const { targetDir, globalHome } = setup("empty-project");
    install({ targetDir, platforms: ["claude"], globalHome, toolkitRoot: repoRoot });
    const globalSkillPath = path.join(globalHome, ".claude/skills/start-project/SKILL.md");
    expect(existsSync(globalSkillPath)).toBe(true);

    uninstall({ targetDir, globalHome, toolkitRoot: repoRoot });
    expect(existsSync(globalSkillPath)).toBe(true); // not touched without includeGlobal

    uninstall({ targetDir, globalHome, includeGlobal: true, toolkitRoot: repoRoot });
    expect(existsSync(globalSkillPath)).toBe(false);
  });
});
