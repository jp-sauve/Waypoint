import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildClaude } from "../adapters/claude/build.js";
import { buildCopilot } from "../adapters/copilot/build.js";
import { applyFiles, type ApplyResult, type FileToInstall } from "../adapters/lib/installer.js";
import { emptyRecord, readRecord, writeRecord } from "../adapters/lib/installRecord.js";
import { loadManifest, type Manifest, type PlatformKey } from "../adapters/lib/manifest.js";
import type { BuiltFile } from "../adapters/lib/types.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export interface InstallOptions {
  targetDir: string;
  platforms: PlatformKey[];
  /** Override for `~`, so tests never touch the real home directory. */
  globalHome?: string;
  force?: boolean;
  toolkitRoot?: string;
}

export interface InstallSummary {
  project: ApplyResult;
  global: ApplyResult;
}

export function projectRecordPath(targetDir: string): string {
  return path.join(targetDir, ".waypoint", "install-manifest.json");
}

export function globalRecordPath(manifest: Manifest, globalHome: string): string {
  return path.join(expandHome(manifest.platforms.claude.globalInstallRoot ?? "~/.claude", globalHome), ".waypoint-meta.json");
}

export function install(options: InstallOptions): InstallSummary {
  const toolkitRoot = options.toolkitRoot ?? repoRoot;
  const globalHome = options.globalHome ?? homedir();
  const manifest = loadManifest(path.join(toolkitRoot, "manifest.yaml"));

  const projectFiles: FileToInstall[] = [];
  const globalFiles: FileToInstall[] = [];

  for (const platform of options.platforms) {
    const built: BuiltFile[] = platform === "claude" ? buildClaude(manifest, toolkitRoot) : buildCopilot(manifest, toolkitRoot);
    for (const file of built) {
      const { scope, rest } = splitScope(file.path);
      const recordKey = `${platform}:${rest}`;
      if (scope === "global") {
        const root = expandHome(manifest.platforms[platform].globalInstallRoot ?? "~/.claude", globalHome);
        globalFiles.push({ destPath: path.join(root, rest), content: file.content, recordKey });
      } else {
        projectFiles.push({ destPath: path.join(options.targetDir, rest), content: file.content, recordKey });
      }
    }
  }

  const projRecordPath = projectRecordPath(options.targetDir);
  const projRecord = readRecord(projRecordPath) ?? emptyRecord(manifest.version);
  const projectResult = applyFiles(projectFiles, projRecord, { force: options.force });
  if (projectFiles.length > 0) {
    projRecord.toolkitVersion = manifest.version;
    projRecord.installedAt = new Date().toISOString();
    projRecord.platforms = Array.from(new Set([...projRecord.platforms, ...options.platforms]));
    writeRecord(projRecordPath, projRecord);
  }

  const globRecordPath = globalRecordPath(manifest, globalHome);
  const globRecord = readRecord(globRecordPath) ?? emptyRecord(manifest.version);
  const globalResult = applyFiles(globalFiles, globRecord, { force: options.force });
  if (globalFiles.length > 0) {
    globRecord.toolkitVersion = manifest.version;
    globRecord.installedAt = new Date().toISOString();
    globRecord.platforms = Array.from(new Set([...globRecord.platforms, ...options.platforms]));
    writeRecord(globRecordPath, globRecord);
  }

  return { project: projectResult, global: globalResult };
}

export function expandHome(p: string, home: string): string {
  return p.startsWith("~") ? path.join(home, p.slice(1)) : p;
}

export function splitScope(filePath: string): { scope: "global" | "project"; rest: string } {
  const sep = filePath.indexOf("/");
  const scope = filePath.slice(0, sep) as "global" | "project";
  return { scope, rest: filePath.slice(sep + 1) };
}

function main(): void {
  const args = process.argv.slice(2);
  const targetDir = args.find((a) => !a.startsWith("--"));
  const platformArg = args.find((a) => a.startsWith("--platform="))?.slice("--platform=".length);
  const force = args.includes("--force");
  const globalHome = args.find((a) => a.startsWith("--global-home="))?.slice("--global-home=".length);

  if (!targetDir) {
    console.error("Usage: tsx scripts/install.ts <targetDir> [--platform=claude,copilot] [--force]");
    process.exit(1);
  }

  const platforms = (platformArg?.split(",") ?? ["claude", "copilot"]) as PlatformKey[];
  const summary = install({ targetDir, platforms, force, globalHome });
  report(summary);
}

export function report(summary: InstallSummary): void {
  for (const [scope, result] of [
    ["project", summary.project],
    ["global", summary.global],
  ] as const) {
    if (result.written.length === 0 && result.unchanged.length === 0 && result.conflicts.length === 0) continue;
    console.log(`[${scope}] written: ${result.written.length}, unchanged: ${result.unchanged.length}, conflicts: ${result.conflicts.length}`);
    for (const conflict of result.conflicts) {
      console.log(`  CONFLICT (${conflict.reason}): ${conflict.destPath} — left untouched, rerun with --force to overwrite`);
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
