import * as p from "@clack/prompts";
import pc from "picocolors";
import { findTool, REGISTRY } from "../lib/registry.js";
import { detectPlatform, isMcpPlatform, removeMcpServer, hasAmanAgent, removeMcpServerFromAmanAgent } from "../lib/platform.js";
import { removeInstalledTool, isToolInstalled, loadInstalledTools, generateKitMd, writeKitMd } from "../lib/kit.js";

export async function removeCommand(toolName: string): Promise<void> {
  p.intro(pc.bold("akit") + " — removing " + pc.cyan(toolName));

  if (!isToolInstalled(toolName)) {
    p.log.error(`Tool "${toolName}" is not installed.`);
    p.outro("");
    return;
  }

  const platform = detectPlatform();

  // Remove MCP config from IDE platform
  if (isMcpPlatform(platform)) {
    removeMcpServer(platform, toolName);
    p.log.success(`Removed MCP config from ${pc.bold(platform)}`);
  }

  // Remove from aman-agent config
  if (hasAmanAgent()) {
    removeMcpServerFromAmanAgent(toolName);
    p.log.success(`Removed MCP config from ${pc.bold("aman-agent")}`);
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
