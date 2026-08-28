import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { install } from "../scripts/install.js";
import { update } from "../scripts/update.js";
import { copyFixture, freshTempDir } from "./helpers/fixture.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cleanup: string[] = [];

afterEach(() => {
  for (const dir of cleanup.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function setup() {
  const targetDir = copyFixture("empty-project");
  const globalHome = freshTempDir("global-home");
  cleanup.push(targetDir, globalHome);
  return { targetDir, globalHome };
}

describe("update", () => {
  it("refuses to run against a project with nothing installed", () => {
    const { targetDir, globalHome } = setup();
    expect(() => update({ targetDir, platforms: ["claude"], globalHome, toolkitRoot: repoRoot })).toThrow(/run install first/);
  });

  it("re-installs unchanged files and reports a conflict for a locally-edited one", () => {
    const { targetDir, globalHome } = setup();
    install({ targetDir, platforms: ["claude", "copilot"], globalHome, toolkitRoot: repoRoot });

    const editedPath = path.join(targetDir, "CLAUDE.md");
    writeFileSync(editedPath, "local edits the consumer made\n", "utf8");
    const untouchedContentBefore = readFileSync(path.join(targetDir, ".claude/commands/next-step.md"), "utf8");

    const summary = update({ targetDir, platforms: ["claude", "copilot"], globalHome, toolkitRoot: repoRoot });

    expect(summary.project.conflicts.map((c) => c.destPath)).toContain(editedPath);
    expect(readFileSync(editedPath, "utf8")).toBe("local edits the consumer made\n");
    // an untouched file should just be re-confirmed as unchanged, not conflicted
    expect(summary.project.conflicts.some((c) => c.destPath.endsWith("next-step.md"))).toBe(false);
    expect(readFileSync(path.join(targetDir, ".claude/commands/next-step.md"), "utf8")).toBe(untouchedContentBefore);
  });

  it("re-syncs only the merged block, leaving the consumer's own CLAUDE.md content in place", () => {
    const { targetDir, globalHome } = setup();
    // simulate a pre-existing, never-before-installed CLAUDE.md by writing one
    // before the first install, then merging Waypoint's block into it.
    const claudeMdPath = path.join(targetDir, "CLAUDE.md");
    writeFileSync(claudeMdPath, "# Consumer notes\n\nKeep this.\n", "utf8");
    install({ targetDir, platforms: ["claude"], globalHome, toolkitRoot: repoRoot });
    const merged = readFileSync(claudeMdPath, "utf8");
    expect(merged).toContain("# Consumer notes");

    const summary = update({ targetDir, platforms: ["claude"], globalHome, toolkitRoot: repoRoot });

    expect(summary.project.conflicts).toEqual([]);
    expect(readFileSync(claudeMdPath, "utf8")).toBe(merged);
  });

  it("--force overwrites a locally-edited file", () => {
    const { targetDir, globalHome } = setup();
    install({ targetDir, platforms: ["claude"], globalHome, toolkitRoot: repoRoot });
    const editedPath = path.join(targetDir, "CLAUDE.md");
    writeFileSync(editedPath, "local edits\n", "utf8");

    const summary = update({ targetDir, platforms: ["claude"], globalHome, force: true, toolkitRoot: repoRoot });

    expect(summary.project.conflicts).toEqual([]);
    expect(readFileSync(editedPath, "utf8")).not.toBe("local edits\n");
  });
});
