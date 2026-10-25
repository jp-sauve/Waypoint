import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { main } from "../scripts/cli.js";
import { copyFixture, freshTempDir } from "./helpers/fixture.js";

const cleanup: string[] = [];

afterEach(() => {
  for (const dir of cleanup.splice(0)) rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("cli dispatcher", () => {
  it("prints usage and exits non-zero for an unknown command", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(main(["frobnicate"])).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage:"));
  });

  it("prints usage and exits non-zero when install is missing a targetDir", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(main(["install"])).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage:"));
  });

  it("dispatches install and writes files for an explicitly requested platform", () => {
    const targetDir = copyFixture("empty-project");
    const globalHome = freshTempDir("global-home");
    cleanup.push(targetDir, globalHome);
    vi.spyOn(console, "log").mockImplementation(() => {});

    const code = main(["install", targetDir, "--platform=claude", `--global-home=${globalHome}`]);

    expect(code).toBe(0);
    expect(existsSync(path.join(targetDir, "CLAUDE.md"))).toBe(true);
  });

  it("defaults to installing Claude, Copilot, and Augure", () => {
    const targetDir = copyFixture("empty-project");
    const globalHome = freshTempDir("global-home");
    cleanup.push(targetDir, globalHome);
    vi.spyOn(console, "log").mockImplementation(() => {});

    const code = main(["install", targetDir, `--global-home=${globalHome}`]);

    expect(code).toBe(0);
    expect(existsSync(path.join(targetDir, "CLAUDE.md"))).toBe(true);
    expect(existsSync(path.join(targetDir, ".github/copilot-instructions.md"))).toBe(true);
    expect(existsSync(path.join(targetDir, "AGENTS.md"))).toBe(true);
    expect(existsSync(path.join(globalHome, ".augure/skills/start-project/SKILL.md"))).toBe(true);
  });

  it("dispatches update and reports the 'nothing installed' error via exit code 1", () => {
    const targetDir = copyFixture("empty-project");
    const globalHome = freshTempDir("global-home");
    cleanup.push(targetDir, globalHome);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const code = main(["update", targetDir, `--global-home=${globalHome}`]);

    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("run install first"));
  });

  it("dispatches uninstall and removes what install put there", () => {
    const targetDir = copyFixture("empty-project");
    const globalHome = freshTempDir("global-home");
    cleanup.push(targetDir, globalHome);
    vi.spyOn(console, "log").mockImplementation(() => {});

    main(["install", targetDir, "--platform=claude", `--global-home=${globalHome}`]);
    const code = main(["uninstall", targetDir, `--global-home=${globalHome}`]);

    expect(code).toBe(0);
    expect(existsSync(path.join(targetDir, "CLAUDE.md"))).toBe(false);
  });
});
