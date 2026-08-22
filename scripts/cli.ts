import { fileURLToPath } from "node:url";
import { build } from "./build.js";
import { install, report, type InstallOptions } from "./install.js";
import { update } from "./update.js";
import { uninstall } from "./uninstall.js";

const USAGE = `Usage:
  waypoint build
  waypoint install <targetDir> [--platform=claude,copilot] [--force] [--global-home=<dir>]
  waypoint update  <targetDir> [--platform=claude,copilot] [--force] [--global-home=<dir>]
  waypoint uninstall <targetDir> [--global] [--force] [--global-home=<dir>]`;

function flag(args: string[], name: string): string | undefined {
  return args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

export function main(argv: string[]): number {
  const [command, ...rest] = argv;

  if (command === "build") {
    build();
    console.log("Built dist/claude/** and dist/copilot/**");
    return 0;
  }

  if (command === "install" || command === "update") {
    const targetDir = rest.find((a) => !a.startsWith("--"));
    if (!targetDir) {
      console.error(USAGE);
      return 1;
    }
    const platforms = (flag(rest, "platform")?.split(",") ?? ["claude", "copilot"]) as InstallOptions["platforms"];
    const options: InstallOptions = {
      targetDir,
      platforms,
      force: rest.includes("--force"),
      globalHome: flag(rest, "global-home"),
    };
    try {
      report(command === "install" ? install(options) : update(options));
      return 0;
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      return 1;
    }
  }

  if (command === "uninstall") {
    const targetDir = rest.find((a) => !a.startsWith("--"));
    if (!targetDir) {
      console.error(USAGE);
      return 1;
    }
    const summary = uninstall({
      targetDir,
      includeGlobal: rest.includes("--global"),
      force: rest.includes("--force"),
      globalHome: flag(rest, "global-home"),
    });
    console.log(
      `[project] removed: ${summary.project.removed.length}, conflicts: ${summary.project.conflicts.length}`,
    );
    for (const conflict of summary.project.conflicts) {
      console.log(`  CONFLICT (${conflict.reason}): ${conflict.destPath} — left in place, rerun with --force to remove`);
    }
    if (summary.global) {
      console.log(`[global] removed: ${summary.global.removed.length}, conflicts: ${summary.global.conflicts.length}`);
    }
    return 0;
  }

  console.error(USAGE);
  return 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
