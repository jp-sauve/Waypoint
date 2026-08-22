import { cpSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/** Copies a tests/fixtures/<name> tree into a fresh temp dir and returns its path,
 * so install/update/uninstall tests never mutate the checked-in fixture itself. */
export function copyFixture(name: string): string {
  const src = path.resolve(import.meta.dirname, "..", "fixtures", name);
  const dest = mkdtempSync(path.join(tmpdir(), `waypoint-fixture-${name}-`));
  cpSync(src, dest, { recursive: true });
  return dest;
}

export function freshTempDir(prefix: string): string {
  return mkdtempSync(path.join(tmpdir(), `waypoint-${prefix}-`));
}
