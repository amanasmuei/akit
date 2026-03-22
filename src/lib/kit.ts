import fs from "node:fs";
import path from "node:path";
import { getGlobalDir, getKitPath, getInstalledToolsPath } from "./paths.js";
import type { ToolEntry } from "./registry.js";

export interface InstalledTool {
  name: string;
  installedAt: string;
  mcpConfigured: boolean;
}

export function loadInstalledTools(): InstalledTool[] {
  const filePath = getInstalledToolsPath();
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

export function saveInstalledTools(tools: InstalledTool[]): void {
  const dir = getGlobalDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getInstalledToolsPath(), JSON.stringify(tools, null, 2) + "\n", "utf-8");
}

export function addInstalledTool(name: string, mcpConfigured: boolean): void {
  const tools = loadInstalledTools();
  const existing = tools.findIndex((t) => t.name === name);
  const entry: InstalledTool = {
    name,
    installedAt: new Date().toISOString().split("T")[0],
    mcpConfigured,
  };
  if (existing >= 0) {
    tools[existing] = entry;
  } else {
    tools.push(entry);
  }
  saveInstalledTools(tools);
}

export function removeInstalledTool(name: string): void {
  const tools = loadInstalledTools().filter((t) => t.name !== name);
  saveInstalledTools(tools);
}

export function isToolInstalled(name: string): boolean {
  return loadInstalledTools().some((t) => t.name === name);
}

export function generateKitMd(tools: InstalledTool[], entries: ToolEntry[]): string {
  const lines: string[] = ["# My AI Toolkit", ""];

  if (tools.length === 0) {
    lines.push("No tools installed yet. Run `akit add <tool>` to get started.");
    lines.push("");
    return lines.join("\n");
  }

  for (const tool of tools) {
    const entry = entries.find((e) => e.name === tool.name);
    if (!entry) continue;

    lines.push(`## ${entry.name}`);
    lines.push(`- Do: ${entry.description}`);
    lines.push(`- When: ${entry.capabilities.join(", ")}`);

    if (tool.mcpConfigured && entry.mcp) {
      lines.push(`- How: MCP → ${entry.mcp.package}`);
    } else {
      lines.push(`- How: ${entry.manual}`);
    }

    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## Permissions");
  lines.push("- Never delete data without confirmation");
  lines.push("- Never push to main without approval");
  lines.push("- Ask before making external API calls that modify state");
  lines.push("");

  return lines.join("\n");
}

export function writeKitMd(content: string): void {
  const dir = getGlobalDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getKitPath(), content, "utf-8");
}
