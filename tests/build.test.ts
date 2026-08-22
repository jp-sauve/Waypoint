import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { build } from "../scripts/build.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let distRoot: string;

function walk(dir: string, base = dir): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full, base) : [path.relative(base, full)];
  });
}

beforeAll(() => {
  distRoot = mkdtempSync(path.join(tmpdir(), "waypoint-build-"));
  build(repoRoot, distRoot);
});

afterAll(() => {
  rmSync(distRoot, { recursive: true, force: true });
});

describe("build", () => {
  it("produces the expected Claude file tree", () => {
    const files = walk(path.join(distRoot, "claude")).sort();
    expect(files).toEqual(
      [
        "global/skills/gather-requirements/SKILL.md",
        "global/skills/project-planner/SKILL.md",
        "global/skills/project-planner/templates/review-checklist.md",
        "global/skills/project-planner/templates/status-template.md",
        "global/skills/project-planner/templates/step-format.md",
        "project/.claude/commands/next-step.md",
        "project/.claude/commands/review-step.md",
        "project/.claude/commands/small-change.md",
        "project/.claude/skills/layout-pattern-references/SKILL.md",
        "project/.claude/skills/ui-component-references/SKILL.md",
        "project/.claude/skills/web-engineering-checklist/SKILL.md",
        "project/.waypoint/checklist/references/owasp-top10.md",
        "project/.waypoint/checklist/references/privacy-checklist.md",
        "project/.waypoint/checklist/references/wcag-checklist.md",
        "project/.waypoint/layout-patterns/references/asymmetric.md",
        "project/.waypoint/layout-patterns/references/bento.md",
        "project/.waypoint/layout-patterns/references/canvas.md",
        "project/.waypoint/layout-patterns/references/document-flow.md",
        "project/.waypoint/layout-patterns/references/feed.md",
        "project/.waypoint/layout-patterns/references/grid-masonry.md",
        "project/.waypoint/layout-patterns/references/grid-normal.md",
        "project/.waypoint/layout-patterns/references/grid-offset.md",
        "project/.waypoint/layout-patterns/references/layered.md",
        "project/.waypoint/layout-patterns/references/multi-column.md",
        "project/.waypoint/layout-patterns/references/paged-slides.md",
        "project/.waypoint/layout-patterns/references/sidebar-content.md",
        "project/.waypoint/layout-patterns/references/single-column.md",
        "project/.waypoint/layout-patterns/references/spa-shell.md",
        "project/.waypoint/layout-patterns/references/sticky-split-scroll.md",
        "project/.waypoint/layout-patterns/references/uniform-flex-row.md",
        "project/.waypoint/layout-patterns/references/viewport-sections-hard-snap.md",
        "project/.waypoint/layout-patterns/references/viewport-sections-overlapping.md",
        "project/.waypoint/layout-patterns/references/viewport-sections-soft-snap.md",
        "project/.waypoint/ui-components/references/dropdown-menu-vanilla.md",
        "project/.waypoint/ui-components/references/dropdown-menu.md",
        "project/.waypoint/ui-components/references/header-fixed.md",
        "project/.waypoint/ui-components/references/header-shrinking.md",
        "project/.waypoint/ui-components/references/header-static.md",
        "project/.waypoint/ui-components/references/modal-vanilla.md",
        "project/.waypoint/ui-components/references/modal.md",
        "project/.waypoint/ui-components/references/toast-vanilla.md",
        "project/.waypoint/ui-components/references/toast.md",
        "project/CLAUDE.md",
      ].sort(),
    );
  });

  it("produces the expected Copilot file tree, entirely project-scoped", () => {
    const files = walk(path.join(distRoot, "copilot")).sort();
    expect(files.every((f) => f.startsWith("project/"))).toBe(true);
    expect(files).toEqual(
      [
        "project/.github/copilot-instructions.md",
        "project/.github/instructions/api-routes.instructions.md",
        "project/.github/instructions/react-components.instructions.md",
        "project/.github/instructions/tests.instructions.md",
        "project/.github/prompts/gather-requirements.prompt.md",
        "project/.github/prompts/next-step.prompt.md",
        "project/.github/prompts/project-planner.prompt.md",
        "project/.github/prompts/review-step.prompt.md",
        "project/.github/prompts/small-change.prompt.md",
        "project/.waypoint/checklist/references/owasp-top10.md",
        "project/.waypoint/checklist/references/privacy-checklist.md",
        "project/.waypoint/checklist/references/wcag-checklist.md",
        "project/.waypoint/layout-patterns/references/asymmetric.md",
        "project/.waypoint/layout-patterns/references/bento.md",
        "project/.waypoint/layout-patterns/references/canvas.md",
        "project/.waypoint/layout-patterns/references/document-flow.md",
        "project/.waypoint/layout-patterns/references/feed.md",
        "project/.waypoint/layout-patterns/references/grid-masonry.md",
        "project/.waypoint/layout-patterns/references/grid-normal.md",
        "project/.waypoint/layout-patterns/references/grid-offset.md",
        "project/.waypoint/layout-patterns/references/layered.md",
        "project/.waypoint/layout-patterns/references/multi-column.md",
        "project/.waypoint/layout-patterns/references/paged-slides.md",
        "project/.waypoint/layout-patterns/references/sidebar-content.md",
        "project/.waypoint/layout-patterns/references/single-column.md",
        "project/.waypoint/layout-patterns/references/spa-shell.md",
        "project/.waypoint/layout-patterns/references/sticky-split-scroll.md",
        "project/.waypoint/layout-patterns/references/uniform-flex-row.md",
        "project/.waypoint/layout-patterns/references/viewport-sections-hard-snap.md",
        "project/.waypoint/layout-patterns/references/viewport-sections-overlapping.md",
        "project/.waypoint/layout-patterns/references/viewport-sections-soft-snap.md",
        "project/.waypoint/planning-templates/review-checklist.md",
        "project/.waypoint/planning-templates/status-template.md",
        "project/.waypoint/planning-templates/step-format.md",
        "project/.waypoint/ui-components/references/dropdown-menu-vanilla.md",
        "project/.waypoint/ui-components/references/dropdown-menu.md",
        "project/.waypoint/ui-components/references/header-fixed.md",
        "project/.waypoint/ui-components/references/header-shrinking.md",
        "project/.waypoint/ui-components/references/header-static.md",
        "project/.waypoint/ui-components/references/modal-vanilla.md",
        "project/.waypoint/ui-components/references/modal.md",
        "project/.waypoint/ui-components/references/toast-vanilla.md",
        "project/.waypoint/ui-components/references/toast.md",
      ].sort(),
    );
  });

  it("never leaks canonical source paths into dist", () => {
    const all = [...walk(path.join(distRoot, "claude")), ...walk(path.join(distRoot, "copilot"))];
    for (const rel of all) {
      expect(rel).not.toMatch(/^(global|project)\/methodology\//);
      expect(rel).not.toMatch(/^(global|project)\/commands\//);
      expect(rel).not.toMatch(/^(global|project)\/adapters\//);
      expect(rel).not.toMatch(/^(global|project)\/scripts\//);
    }
  });

  it("leaves no unresolved {{token}} placeholders in any installed file", () => {
    for (const platform of ["claude", "copilot"] as const) {
      for (const rel of walk(path.join(distRoot, platform))) {
        const content = readFileSync(path.join(distRoot, platform, rel), "utf8");
        expect(content, `${platform}/${rel} has an unresolved token`).not.toMatch(/\{\{[a-zA-Z0-9:_-]+\}\}/);
      }
    }
  });

  it("never emits the stripped 'Applies to files matching' trailer line", () => {
    for (const platform of ["claude", "copilot"] as const) {
      for (const rel of walk(path.join(distRoot, platform))) {
        const content = readFileSync(path.join(distRoot, platform, rel), "utf8");
        expect(content, `${platform}/${rel}`).not.toMatch(/Applies to files matching/);
      }
    }
  });

  it("gives Copilot's scoped instructions real applyTo frontmatter, and Claude none", () => {
    const copilotApiRoutes = readFileSync(
      path.join(distRoot, "copilot/project/.github/instructions/api-routes.instructions.md"),
      "utf8",
    );
    expect(copilotApiRoutes).toMatch(/^---\napplyTo: /);
    expect(existsSync(path.join(distRoot, "claude/project/.claude/instructions"))).toBe(false);
  });

  it("folds api-routes/react-components/tests into CLAUDE.md, since Claude has no path-scoped mechanism", () => {
    const claudeMd = readFileSync(path.join(distRoot, "claude/project/CLAUDE.md"), "utf8");
    expect(claudeMd).toMatch(/API Route Conventions/);
    expect(claudeMd).toMatch(/React \/ Next\.js Component Conventions/);
    expect(claudeMd).toMatch(/Test Conventions/);
  });

  it("gives Copilot prompt files agent:agent frontmatter, and Claude commands only description", () => {
    const copilotPrompt = readFileSync(
      path.join(distRoot, "copilot/project/.github/prompts/next-step.prompt.md"),
      "utf8",
    );
    expect(copilotPrompt).toMatch(/^---\nagent: "agent"\n/);

    const claudeCommand = readFileSync(path.join(distRoot, "claude/project/.claude/commands/next-step.md"), "utf8");
    expect(claudeCommand).toMatch(/^---\ndescription: /);
    expect(claudeCommand).not.toMatch(/agent:/);
  });
});
