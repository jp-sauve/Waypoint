/** One rendered output file, path relative to dist/<platform>/<global|project>/. */
export interface BuiltFile {
  path: string;
  content: string;
  /** See FileToInstall.merge — set for always-on files a consumer is likely to
   * already own (CLAUDE.md, copilot-instructions.md), so install/update merges a
   * marked block into the file instead of replacing it whole. */
  merge?: boolean;
}
