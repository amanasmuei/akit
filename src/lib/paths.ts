import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export function getGlobalDir(): string {
  return path.join(os.homedir(), ".akit");
}

export function getLocalDir(): string {
  return path.join(process.cwd(), ".akit");
}

export function globalConfigExists(): boolean {
  return fs.existsSync(path.join(getGlobalDir(), "kit.md"));
}

export function getKitPath(): string {
  return path.join(getGlobalDir(), "kit.md");
}

export function getInstalledToolsPath(): string {
  return path.join(getGlobalDir(), "installed.json");
}

export function acoreExists(): boolean {
  const acoreDir = path.join(os.homedir(), ".acore");
  return fs.existsSync(path.join(acoreDir, "core.md"));
}
