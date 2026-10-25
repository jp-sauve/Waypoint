import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { globalRecordPaths, install, projectRecordPath, report, type InstallOptions, type InstallSummary } from "./install.js";
import { DEFAULT_PLATFORMS } from "../adapters/lib/manifest.js";
import { readRecord } from "../adapters/lib/installRecord.js";
import { loadManifest } from "../adapters/lib/manifest.js";
import path from "node:path";

/**
 * Re-runs install against whatever is already tracked. Distinct from `install` only
 * in that it refuses to proceed if nothing is tracked yet — "update" implies a prior
 * install, and running it on a bare project would silently behave like a first
 * install, which is confusing given the two commands mean different things to a user.
 */
export function update(options: InstallOptions): InstallSummary {
  const toolkitRoot = options.toolkitRoot;
  const globalHome = options.globalHome ?? homedir();
  const manifestPath = path.join(toolkitRoot ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), "manifest.yaml");
  const manifest = loadManifest(manifestPath);

  const hasProjectRecord = Boolean(readRecord(projectRecordPath(options.targetDir)));
  const hasGlobalRecord = globalRecordPaths(manifest, globalHome).some((recordPath) => readRecord(recordPath));

  if (!hasProjectRecord && !hasGlobalRecord) {
    throw new Error(
      `Nothing installed yet at ${options.targetDir} (or globally) — run install first, not update.`,
    );
  }

  return install(options);
}

function main(): void {
  const args = process.argv.slice(2);
  const targetDir = args.find((a) => !a.startsWith("--"));
  const platformArg = args.find((a) => a.startsWith("--platform="))?.slice("--platform=".length);
  const force = args.includes("--force");
  const globalHome = args.find((a) => a.startsWith("--global-home="))?.slice("--global-home=".length);

  if (!targetDir) {
    console.error("Usage: tsx scripts/update.ts <targetDir> [--platform=claude,copilot,augure] [--force]");
    process.exit(1);
  }

  const platforms = (platformArg?.split(",") ?? DEFAULT_PLATFORMS) as InstallOptions["platforms"];
  report(update({ targetDir, platforms, force, globalHome }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
