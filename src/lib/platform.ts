import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export type Platform = "claude-code" | "cursor" | "windsurf" | "other";

export function detectPlatform(): Platform {
  const cwd = process.cwd();

  // Check .acore/config.json first (if acore is installed)
  const acoreConfig = path.join(cwd, ".acore", "config.json");
  if (fs.existsSync(acoreConfig)) {
    try {
      const raw = fs.readFileSync(acoreConfig, "utf-8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (typeof parsed.platform === "string") {
        const p = parsed.platform as string;
        if (p === "claude-code" || p === "cursor" || p === "windsurf") return p;
      }
    } catch { /* fall through */ }
  }

  // File-based detection
  if (fs.existsSync(path.join(cwd, "CLAUDE.md"))) return "claude-code";
  if (fs.existsSync(path.join(cwd, ".cursorrules"))) return "cursor";
  if (fs.existsSync(path.join(cwd, ".windsurfrules"))) return "windsurf";

  return "other";
}

export function isMcpPlatform(platform: Platform): boolean {
  return platform === "claude-code" || platform === "cursor" || platform === "windsurf";
}

export function hasAmanAgent(): boolean {
  const configPath = path.join(os.homedir(), ".aman-agent", "config.json");
  return fs.existsSync(configPath);
}

export interface McpServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export function getMcpConfigPath(platform: Platform): string | null {
  switch (platform) {
    case "claude-code":
      return path.join(os.homedir(), ".claude", "settings.json");
    case "cursor":
      return path.join(process.cwd(), ".cursor", "mcp.json");
    case "windsurf":
      return path.join(os.homedir(), ".windsurf", "mcp.json");
    default:
      return null;
  }
}

function getAmanAgentConfigPath(): string {
  return path.join(os.homedir(), ".aman-agent", "config.json");
}

export function addMcpServer(
  platform: Platform,
  name: string,
  config: McpServerConfig
): void {
  const configPath = getMcpConfigPath(platform);
  if (!configPath) return;

  fs.mkdirSync(path.dirname(configPath), { recursive: true });

  let existing: Record<string, unknown> = {};
  if (fs.existsSync(configPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch { /* start fresh */ }
  }

  const mcpServers = (existing.mcpServers ?? {}) as Record<string, unknown>;
  mcpServers[name] = config;
  existing.mcpServers = mcpServers;

  fs.writeFileSync(configPath, JSON.stringify(existing, null, 2) + "\n", "utf-8");
}

export function addMcpServerToAmanAgent(
  name: string,
  config: McpServerConfig
): void {
  const configPath = getAmanAgentConfigPath();
  if (!fs.existsSync(configPath)) return;

  try {
    const existing = JSON.parse(fs.readFileSync(configPath, "utf-8")) as Record<string, unknown>;
    const mcpServers = (existing.mcpServers ?? {}) as Record<string, unknown>;
    mcpServers[name] = config;
    existing.mcpServers = mcpServers;
    fs.writeFileSync(configPath, JSON.stringify(existing, null, 2) + "\n", "utf-8");
  } catch { /* ignore */ }
}

export function removeMcpServer(platform: Platform, name: string): void {
  const configPath = getMcpConfigPath(platform);
  if (!configPath || !fs.existsSync(configPath)) return;

  try {
    const existing = JSON.parse(fs.readFileSync(configPath, "utf-8")) as Record<string, unknown>;
    const mcpServers = (existing.mcpServers ?? {}) as Record<string, unknown>;
    delete mcpServers[name];
    existing.mcpServers = mcpServers;
    fs.writeFileSync(configPath, JSON.stringify(existing, null, 2) + "\n", "utf-8");
  } catch { /* ignore */ }
}

export function removeMcpServerFromAmanAgent(name: string): void {
  const configPath = getAmanAgentConfigPath();
  if (!fs.existsSync(configPath)) return;

  try {
    const existing = JSON.parse(fs.readFileSync(configPath, "utf-8")) as Record<string, unknown>;
    const mcpServers = (existing.mcpServers ?? {}) as Record<string, unknown>;
    delete mcpServers[name];
    existing.mcpServers = mcpServers;
    fs.writeFileSync(configPath, JSON.stringify(existing, null, 2) + "\n", "utf-8");
  } catch { /* ignore */ }
}
