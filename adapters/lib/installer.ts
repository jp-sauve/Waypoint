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
  /**
   * When true, `content` is merged into the destination as a marked block instead
   * of replacing the whole file: a pre-existing, never-before-tracked file gets the
   * block appended (never overwritten, never blocked as a conflict), and everything
   * outside the block — on either side — is left exactly as the consumer wrote it.
   * For files a consumer is likely to already own and extend, e.g. CLAUDE.md and
   * copilot-instructions.md.
   */
  merge?: boolean;
}

const BLOCK_BEGIN = "<!-- waypoint:begin — managed by `waypoint update`; edits outside this block are kept -->";
const BLOCK_END = "<!-- waypoint:end -->";

function renderBlock(content: string): string {
  return `${BLOCK_BEGIN}\n${content}\n${BLOCK_END}\n`;
}

/** Returns the exact text between the markers, or undefined if either is missing. */
function extractBlock(existing: string): string | undefined {
  const start = existing.indexOf(BLOCK_BEGIN);
  const end = existing.indexOf(BLOCK_END);
  if (start === -1 || end === -1 || end < start) return undefined;
  return existing.slice(start + BLOCK_BEGIN.length + 1, end - 1);
}

function appendBlock(existing: string, content: string): string {
  const sep = existing.endsWith("\n\n") ? "" : existing.endsWith("\n") ? "\n" : "\n\n";
  return `${existing}${sep}${renderBlock(content)}`;
}

/** Replaces the marked block in place, assuming `extractBlock(existing)` is defined. */
function replaceBlock(existing: string, content: string): string {
  const start = existing.indexOf(BLOCK_BEGIN);
  const end = existing.indexOf(BLOCK_END) + BLOCK_END.length;
  const before = existing.slice(0, start);
  const after = existing.slice(end).replace(/^\n/, "");
  return `${before}${renderBlock(content)}${after}`;
}

/** Strips the marked block (and the seam it leaves behind), assuming
 * `extractBlock(existing)` is defined. Returns "" if nothing else was in the file. */
function removeBlock(existing: string): string {
  const start = existing.indexOf(BLOCK_BEGIN);
  const end = existing.indexOf(BLOCK_END) + BLOCK_END.length;
  const before = existing.slice(0, start).trimEnd();
  const after = existing.slice(end).trimStart();
  if (!before && !after) return "";
  if (!after) return `${before}\n`;
  if (!before) return `${after}\n`;
  return `${before}\n\n${after}\n`;
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
    if (file.merge) {
      applyMergeFile(file, record, result, opts);
      continue;
    }

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

/**
 * Handles one `merge: true` file: appends/replaces only the marked block, never the
 * whole file. A pre-existing file with no markers and no prior record is always safe
 * to append to (nothing of the consumer's is touched), so that case is never a
 * conflict — this is what makes CLAUDE.md-style files mergeable instead of blocking
 * on "unmanaged-existing-file". A prior record with the markers now missing, or a
 * markers-present block whose content changed, still requires `force` like any other
 * locally-modified file.
 */
function applyMergeFile(file: FileToInstall, record: InstallRecord, result: ApplyResult, opts: { force?: boolean }): void {
  const newChecksum = checksum(file.content);
  const previous = record.artifacts[file.recordKey];

  if (!existsSync(file.destPath)) {
    write(file.destPath, renderBlock(file.content));
    record.artifacts[file.recordKey] = { path: file.destPath, checksum: newChecksum, merge: true };
    result.written.push(file.recordKey);
    return;
  }

  const onDisk = readFileSync(file.destPath, "utf8");
  const existingBlock = extractBlock(onDisk);

  if (existingBlock === undefined) {
    if (!previous) {
      write(file.destPath, appendBlock(onDisk, file.content));
      record.artifacts[file.recordKey] = { path: file.destPath, checksum: newChecksum, merge: true };
      result.written.push(file.recordKey);
      return;
    }
    if (!opts.force) {
      result.conflicts.push({ recordKey: file.recordKey, destPath: file.destPath, reason: "locally-modified-since-install" });
      return;
    }
    write(file.destPath, renderBlock(file.content));
    record.artifacts[file.recordKey] = { path: file.destPath, checksum: newChecksum, merge: true };
    result.written.push(file.recordKey);
    return;
  }

  if (existingBlock === file.content) {
    record.artifacts[file.recordKey] = { path: file.destPath, checksum: newChecksum, merge: true };
    result.unchanged.push(file.recordKey);
    return;
  }

  const modifiedSinceInstall = !previous || previous.checksum !== checksum(existingBlock);
  if (modifiedSinceInstall && !opts.force) {
    result.conflicts.push({
      recordKey: file.recordKey,
      destPath: file.destPath,
      reason: previous ? "locally-modified-since-install" : "unmanaged-existing-file",
    });
    return;
  }

  write(file.destPath, replaceBlock(onDisk, file.content));
  record.artifacts[file.recordKey] = { path: file.destPath, checksum: newChecksum, merge: true };
  result.written.push(file.recordKey);
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
    if (entry.merge) {
      const onDisk = readFileSync(entry.path, "utf8");
      const existingBlock = extractBlock(onDisk);

      if (existingBlock === undefined || checksum(existingBlock) !== entry.checksum) {
        if (!opts.force) {
          result.conflicts.push({ recordKey, destPath: entry.path, reason: "locally-modified-since-install" });
          continue;
        }
        if (existingBlock === undefined) {
          rmSync(entry.path, { force: true });
          removeEmptyDirsUpwards(path.dirname(entry.path));
          result.removed.push(recordKey);
          continue;
        }
      }

      const stripped = removeBlock(onDisk);
      if (stripped === "") {
        rmSync(entry.path, { force: true });
        removeEmptyDirsUpwards(path.dirname(entry.path));
      } else {
        writeFileSync(entry.path, stripped, "utf8");
      }
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
