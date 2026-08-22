/** One rendered output file, path relative to dist/<platform>/<global|project>/. */
export interface BuiltFile {
  path: string;
  content: string;
}
