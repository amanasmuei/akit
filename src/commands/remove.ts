import * as p from "@clack/prompts";
import pc from "picocolors";
import { findTool, REGISTRY } from "../lib/registry.js";
import { detectPlatform, isMcpPlatform, removeMcpServer } from "../lib/platform.js";
import { removeInstalledTool, isToolInstalled, loadInstalledTools, generateKitMd, writeKitMd } from "../lib/kit.js";

export async function removeCommand(toolName: string): Promise<void> {
  p.intro(pc.bold("akit") + " — removing " + pc.cyan(toolName));

  if (!isToolInstalled(toolName)) {
    p.log.error(`Tool "${toolName}" is not installed.`);
    p.outro("");
    return;
  }

  const platform = detectPlatform();

  // Remove MCP config if applicable
  if (isMcpPlatform(platform)) {
    removeMcpServer(platform, toolName);
    p.log.success(`Removed MCP config for ${pc.bold(toolName)}`);
  }

  // Update installed tools and regenerate kit.md
  removeInstalledTool(toolName);
  const installed = loadInstalledTools();
  const entries = installed.map((t) => findTool(t.name)).filter(Boolean) as typeof REGISTRY;
  const kitContent = generateKitMd(installed, entries);
  writeKitMd(kitContent);

  p.log.success(`Updated ${pc.dim("~/.akit/kit.md")}`);
  p.outro("Done.");
}
