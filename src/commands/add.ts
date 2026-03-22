import * as p from "@clack/prompts";
import pc from "picocolors";
import { findTool, REGISTRY } from "../lib/registry.js";
import { detectPlatform, isMcpPlatform, addMcpServer } from "../lib/platform.js";
import { addInstalledTool, isToolInstalled, loadInstalledTools, generateKitMd, writeKitMd } from "../lib/kit.js";

export async function addCommand(toolName: string): Promise<void> {
  p.intro(pc.bold("akit") + " — adding " + pc.cyan(toolName));

  const tool = findTool(toolName);
  if (!tool) {
    p.log.error(`Tool "${toolName}" not found in registry.`);
    p.log.info(`Run ${pc.bold("akit search " + toolName)} to find similar tools.`);
    p.outro("");
    return;
  }

  if (isToolInstalled(toolName)) {
    p.log.warning(`${pc.bold(toolName)} is already installed.`);
    p.outro("");
    return;
  }

  const platform = detectPlatform();
  const hasMcp = isMcpPlatform(platform) && tool.mcp !== null;

  p.log.info(`Tool: ${pc.bold(tool.description)}`);
  p.log.info(`Capabilities: ${tool.capabilities.join(", ")}`);

  if (hasMcp) {
    p.log.info(`Platform: ${pc.green(platform)} (MCP supported)`);

    // Configure MCP server
    const mcp = tool.mcp!;
    addMcpServer(platform, toolName, {
      command: mcp.command || "npx",
      args: mcp.args || ["-y", mcp.package],
      ...(mcp.env && Object.keys(mcp.env).length > 0 ? { env: mcp.env } : {}),
    });

    p.log.success(`Added MCP config for ${pc.bold(toolName)}`);

    if (tool.envHint) {
      p.log.warning(tool.envHint);
    }
  } else {
    p.log.info(`Platform: ${pc.dim(platform)} (manual mode)`);
    p.log.info(`Fallback: ${tool.manual}`);
  }

  // Update installed tools and regenerate kit.md
  addInstalledTool(toolName, hasMcp);
  const installed = loadInstalledTools();
  const entries = installed.map((t) => findTool(t.name)).filter(Boolean) as typeof REGISTRY;
  const kitContent = generateKitMd(installed, entries);
  writeKitMd(kitContent);

  p.log.success(`Updated ${pc.dim("~/.akit/kit.md")}`);
  p.outro("Done.");
}
