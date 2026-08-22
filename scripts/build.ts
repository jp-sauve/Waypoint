import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildClaude } from "../adapters/claude/build.js";
import { buildCopilot } from "../adapters/copilot/build.js";
import { loadManifest } from "../adapters/lib/manifest.js";
import type { BuiltFile } from "../adapters/lib/types.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function build(root: string = repoRoot, distRoot: string = path.join(root, "dist")): void {
  const manifest = loadManifest(path.join(root, "manifest.yaml"));

  rmSync(distRoot, { recursive: true, force: true });

  writeAll(distRoot, "claude", buildClaude(manifest, root));
  writeAll(distRoot, "copilot", buildCopilot(manifest, root));
}

function writeAll(distRoot: string, platform: string, files: BuiltFile[]): void {
  for (const file of files) {
    const dest = path.join(distRoot, platform, file.path);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, file.content, "utf8");
  }
}

// Run directly (`pnpm build` / `tsx scripts/build.ts`), but stay importable for tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build();
  // eslint-disable-next-line no-console
  console.log("Built dist/claude/** and dist/copilot/**");
}
