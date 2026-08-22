import { readFileSync } from "node:fs";
import { load as parseYaml } from "js-yaml";
import { z } from "zod";

const platformKey = z.enum(["claude", "copilot"]);

const artifactPlatformConfig = z.object({
  type: z.enum(["skill", "prompt", "always-on", "scoped", "command", "references"]),
  installPath: z.string().nullable().optional(),
  bundledFilesInstallPath: z.string().optional(),
  includes: z.array(z.string()).optional(),
});

const artifactSchema = z.object({
  id: z.string(),
  kind: z.enum(["skill", "instructions", "scoped-instructions", "command"]),
  name: z.string().optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  applyTo: z.string().optional(),
  bundledFiles: z.array(z.string()).optional(),
  installScope: z.enum(["global", "project"]),
  platforms: z.object({
    claude: artifactPlatformConfig.optional(),
    copilot: artifactPlatformConfig.optional(),
  }),
});

const manifestSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  platforms: z.object({
    claude: z.object({
      displayName: z.string(),
      globalInstallSupported: z.boolean(),
      globalInstallRoot: z.string().optional(),
    }),
    copilot: z.object({
      displayName: z.string(),
      globalInstallSupported: z.boolean(),
      globalInstallRoot: z.string().optional(),
    }),
  }),
  tokens: z.record(z.string(), z.object({ claude: z.string(), copilot: z.string() })),
  artifacts: z.array(artifactSchema),
});

export type PlatformKey = z.infer<typeof platformKey>;
export type Artifact = z.infer<typeof artifactSchema>;
export type Manifest = z.infer<typeof manifestSchema>;

export function loadManifest(manifestPath: string): Manifest {
  const raw = readFileSync(manifestPath, "utf8");
  const parsed = parseYaml(raw);
  return manifestSchema.parse(parsed);
}
