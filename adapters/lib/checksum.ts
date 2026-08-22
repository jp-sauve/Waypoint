import { createHash } from "node:crypto";

export function checksum(content: string): string {
  return `sha256:${createHash("sha256").update(content, "utf8").digest("hex")}`;
}
