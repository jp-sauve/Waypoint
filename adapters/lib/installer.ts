import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { checksum } from "./checksum.js";
import type { InstallRecord } from "./installRecord.js";

export interface FileToInstall {
  /** Absolute destination path on disk. */
  destPath: string;
  content: string;
  /** Key this file is tracked under in the install record (stable across rebuilds). */
  recordKey: string;
}

export interface Conflict {
  recordKey: string;
  destPath: string;
  reason: "unmanaged-existing-file" | "locally-modified-since-install";
}

export interface ApplyResult {
  written: string[];
  unchanged: string[];
  conflicts: Conflict[];
}

/**
 * Writes `files` to disk, using `record` (the previous install's checksums, if any)
 * to tell "unchanged since install — safe to overwrite" apart from "the consumer
 * edited this — leave it alone." Mutates `record.artifacts` in place for every file
 * that was written or already matched, so the caller can persist it afterward.
 * Conflicts are never overwritten unless `force` is set.
 */
export function applyFiles(files: FileToInstall[], record: InstallRecord, opts: { force?: boolean } = {}): ApplyResult {
  const result: ApplyResult = { written: [], unchanged: [], conflicts: [] };

  for (const file of files) {
    const newChecksum = checksum(file.content);
    const exists = existsSync(file.destPath);
    const previous = record.artifacts[file.recordKey];

    if (!exists) {
      write(file.destPath, file.content);
      record.artifacts[file.recordKey] = { path: file.destPath, checksum: newChecksum };
      result.written.push(file.recordKey);
      continue;
    }

    const onDiskChecksum = checksum(readFileSync(file.destPath, "utf8"));

    if (onDiskChecksum === newChecksum) {
      record.artifacts[file.recordKey] = { path: file.destPath, checksum: newChecksum };
      result.unchanged.push(file.recordKey);
      continue;
    }

    const modifiedSinceInstall = !previous || previous.checksum !== onDiskChecksum;

    if (modifiedSinceInstall && !opts.force) {
      result.conflicts.push({
        recordKey: file.recordKey,
        destPath: file.destPath,
        reason: previous ? "locally-modified-since-install" : "unmanaged-existing-file",
      });
      continue;
    }

    write(file.destPath, file.content);
    record.artifacts[file.recordKey] = { path: file.destPath, checksum: newChecksum };
    result.written.push(file.recordKey);
  }

  return result;
}

export interface UninstallResult {
  removed: string[];
  conflicts: Conflict[];
}

/** Removes exactly the files `record` says Waypoint installed — nothing else in the
 * target tree is touched. A file whose on-disk checksum no longer matches the
 * record is left in place (the consumer edited it) unless `force` is set. */
export function uninstallFiles(record: InstallRecord, opts: { force?: boolean } = {}): UninstallResult {
  const result: UninstallResult = { removed: [], conflicts: [] };

  for (const [recordKey, entry] of Object.entries(record.artifacts)) {
    if (!existsSync(entry.path)) {
      // Already gone — e.g. two record entries (one per platform) can share the
      // same physical path for a file installed once but tracked twice (see
      // engineering-checklist's shared .waypoint/checklist/references/*). The
      // first entry's removal makes the second entry's file vanish too; treat
      // that as removed rather than leaving a phantom record entry behind.
      result.removed.push(recordKey);
      continue;
    }
    const onDiskChecksum = checksum(readFileSync(entry.path, "utf8"));
    if (onDiskChecksum !== entry.checksum && !opts.force) {
      result.conflicts.push({ recordKey, destPath: entry.path, reason: "locally-modified-since-install" });
      continue;
    }
    rmSync(entry.path, { force: true });
    removeEmptyDirsUpwards(path.dirname(entry.path));
    result.removed.push(recordKey);
  }

  for (const key of result.removed) delete record.artifacts[key];
  return result;
}

function write(destPath: string, content: string): void {
  mkdirSync(path.dirname(destPath), { recursive: true });
  writeFileSync(destPath, content, "utf8");
}

/** Removes `dir` and each ancestor above it as long as it's empty, stopping at the
 * first non-empty one. Safe by construction: `rmdirSync` throws on a non-empty
 * directory, so this can never remove anything that still has content — it only
 * ever clears the now-empty install-path "skeleton" a file's removal left behind
 * (e.g. `.waypoint/checklist/references/` after its last reference file is gone). */
function removeEmptyDirsUpwards(dir: string): void {
  for (let current = dir; ; current = path.dirname(current)) {
    try {
      if (readdirSync(current).length > 0) return;
      rmdirSync(current);
    } catch {
      return;
    }
  }
}
