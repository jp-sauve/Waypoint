#!/usr/bin/env node
// Published npm `bin` entry point. Waypoint's CLI is TypeScript
// (scripts/cli.ts) with no separate compile step — this wrapper runs it
// through `tsx`, which is a regular (non-dev) dependency specifically so this
// works once installed from the npm registry, not just from a clone of this repo.
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Resolved via Node's own module resolution (not a guessed node_modules/.bin
// path), so this works regardless of how the package manager laid out
// node_modules (hoisted or not).
const tsxCli = require.resolve("tsx/cli");
const cliEntry = path.join(here, "..", "scripts", "cli.ts");

const result = spawnSync(process.execPath, [tsxCli, cliEntry, ...process.argv.slice(2)], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
