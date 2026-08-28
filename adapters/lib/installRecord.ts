import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Tracks what Waypoint has installed and with what checksum, so a later
 * install/update/uninstall can tell "unchanged since install, safe to touch" apart
 * from "the consumer edited this file, leave it alone." One record lives per
 * project install (`.waypoint/install-manifest.json`) and one per global install
 * (`<globalInstallRoot>/.waypoint-meta.json`), since global artifacts aren't scoped
 * to any single project.
 */
export interface InstallRecord {
  toolkitVersion: string;
  installedAt: string;
  platforms: string[];
  artifacts: Record<string, { path: string; checksum: string; merge?: boolean }>;
}

export function emptyRecord(toolkitVersion: string): InstallRecord {
  return { toolkitVersion, installedAt: new Date().toISOString(), platforms: [], artifacts: {} };
}

export function readRecord(recordPath: string): InstallRecord | undefined {
  if (!existsSync(recordPath)) return undefined;
  return JSON.parse(readFileSync(recordPath, "utf8")) as InstallRecord;
}

export function writeRecord(recordPath: string, record: InstallRecord): void {
  mkdirSync(path.dirname(recordPath), { recursive: true });
  writeFileSync(recordPath, JSON.stringify(record, null, 2) + "\n", "utf8");
}
