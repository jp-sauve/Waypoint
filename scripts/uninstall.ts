import { existsSync, readdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { uninstallFiles, type UninstallResult } from "../adapters/lib/installer.js";
import { readRecord, writeRecord } from "../adapters/lib/installRecord.js";
import { PLATFORM_KEYS, loadManifest, type PlatformKey } from "../adapters/lib/manifest.js";
import { globalRecordDirectory, projectRecordPath } from "./install.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export interface UninstallOptions {
  targetDir: string;
  includeGlobal?: boolean;
  globalHome?: string;
  force?: boolean;
  toolkitRoot?: string;
}

export interface UninstallSummary {
  project: UninstallResult;
  global?: UninstallResult;
}

/** Removes exactly the files the project's (and optionally the global) install
 * record says Waypoint put there — never touches anything it didn't install. */
export function uninstall(options: UninstallOptions): UninstallSummary {
  const toolkitRoot = options.toolkitRoot ?? repoRoot;
  const globalHome = options.globalHome ?? homedir();

  const projPath = projectRecordPath(options.targetDir);
  const projRecord = readRecord(projPath);
  const projectResult: UninstallResult = projRecord
    ? uninstallFiles(projRecord, { force: options.force })
    : { removed: [], conflicts: [] };
  finalizeRecord(projPath, projRecord);

  let globalResult: UninstallResult | undefined;
  if (options.includeGlobal) {
    const manifest = loadManifest(path.join(toolkitRoot, "manifest.yaml"));
    globalResult = { removed: [], conflicts: [] };
    for (const platform of PLATFORM_KEYS as readonly PlatformKey[]) {
      if (!manifest.platforms[platform]?.globalInstallSupported) continue;
      const globPath = path.join(globalRecordDirectory(manifest, platform, globalHome), ".waypoint-meta.json");
      const globRecord = readRecord(globPath);
      const result = globRecord ? uninstallFiles(globRecord, { force: options.force }) : { removed: [], conflicts: [] };
      globalResult.removed.push(...result.removed);
      globalResult.conflicts.push(...result.conflicts);
      finalizeRecord(globPath, globRecord);
    }
  }

  return { project: projectResult, global: globalResult };
}

function finalizeRecord(recordPath: string, record: ReturnType<typeof readRecord>): void {
  if (!record) return;
  if (Object.keys(record.artifacts).length === 0) {
    rmSync(recordPath, { force: true });
    const dir = path.dirname(recordPath);
    if (existsSync(dir) && readdirSync(dir).length === 0) rmSync(dir, { recursive: true, force: true });
  } else {
    writeRecord(recordPath, record);
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const targetDir = args.find((a) => !a.startsWith("--"));
  const includeGlobal = args.includes("--global");
  const force = args.includes("--force");
  const globalHome = args.find((a) => a.startsWith("--global-home="))?.slice("--global-home=".length);

  if (!targetDir) {
    console.error("Usage: tsx scripts/uninstall.ts <targetDir> [--global] [--force]");
    process.exit(1);
  }

  const summary = uninstall({ targetDir, includeGlobal, force, globalHome });
  console.log(`[project] removed: ${summary.project.removed.length}, conflicts: ${summary.project.conflicts.length}`);
  for (const conflict of summary.project.conflicts) {
    console.log(`  CONFLICT (${conflict.reason}): ${conflict.destPath} — left in place, rerun with --force to remove`);
  }
  if (summary.global) {
    console.log(`[global] removed: ${summary.global.removed.length}, conflicts: ${summary.global.conflicts.length}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
