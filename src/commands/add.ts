import * as p from "@clack/prompts";
import pc from "picocolors";
import { findTool, type ToolEntry } from "../lib/registry.js";
import { detectPlatform, isMcpPlatform, addMcpServer, hasAmanAgent, addMcpServerToAmanAgent } from "../lib/platform.js";
import { addInstalledTool, isToolInstalled, loadInstalledTools, generateKitMd, writeKitMd } from "../lib/kit.js";

export async function addCommand(toolName: string, options?: { mcp?: string }): Promise<void> {
  // Custom MCP package: akit add <name> --mcp <package>
  const customMcp = options?.mcp;

  p.intro(pc.bold("akit") + " — adding " + pc.cyan(toolName));

  let tool: ToolEntry | undefined;
  let mcpConfig: { command: string; args: string[]; env?: Record<string, string> } | null = null;

  if (customMcp) {
    // Custom MCP server — not in registry
    mcpConfig = {
      command: "npx",
      args: ["-y", customMcp],
    };
    // Create a synthetic tool entry for kit.md
    tool = {
      name: toolName,
      description: `Custom MCP server: ${customMcp}`,
      category: "automation",
      mcp: { package: customMcp, command: "npx", args: ["-y", customMcp] },
      manual: `Run: npx ${customMcp}`,
      capabilities: ["custom"],
    };
    p.log.info(`Custom MCP: ${pc.bold(customMcp)}`);
  } else {
    tool = findTool(toolName);
    if (!tool) {
      p.log.error(`Tool "${toolName}" not found in registry.`);
      p.log.info(`Run ${pc.bold("akit search " + toolName)} to find similar tools.`);
      p.log.info(`Or add a custom MCP: ${pc.bold("akit add " + toolName + " --mcp <npm-package>")}`);
      p.outro("");
      return;
    }
    if (tool.mcp) {
      mcpConfig = {
        command: tool.mcp.command || "npx",
        args: tool.mcp.args || ["-y", tool.mcp.package],
        ...(tool.mcp.env && Object.keys(tool.mcp.env).length > 0 ? { env: tool.mcp.env } : {}),
      };
    }
  }

  if (isToolInstalled(toolName)) {
    p.log.warning(`${pc.bold(toolName)} is already installed.`);
    p.outro("");
    return;
  }

  p.log.info(`Tool: ${pc.bold(tool.description)}`);
  p.log.info(`Capabilities: ${tool.capabilities.join(", ")}`);

  // Configure for IDE platform (Claude Code, Cursor, Windsurf)
  const platform = detectPlatform();
  const hasMcp = isMcpPlatform(platform) && mcpConfig !== null;
  let mcpConfigured = false;

  if (hasMcp && mcpConfig) {
    p.log.info(`Platform: ${pc.green(platform)} (MCP supported)`);
    addMcpServer(platform, toolName, mcpConfig);
    p.log.success(`Added MCP config for ${pc.bold(platform)}`);
    mcpConfigured = true;
  } else if (!mcpConfig) {
    p.log.info(`Platform: ${pc.dim(platform)} (manual mode)`);
    p.log.info(`Fallback: ${tool.manual}`);
  }

  // Always configure for aman-agent if installed
  if (hasAmanAgent() && mcpConfig) {
    addMcpServerToAmanAgent(toolName, mcpConfig);
    p.log.success(`Added MCP config for ${pc.bold("aman-agent")}`);
    mcpConfigured = true;
  }

  if (tool.envHint) {
    p.log.warning(tool.envHint);
  }

  // Update installed tools and regenerate kit.md
  addInstalledTool(toolName, mcpConfigured);
  const installed = loadInstalledTools();
  const entries = installed
    .map((t) => findTool(t.name) ?? (t.name === toolName ? tool : undefined))
    .filter(Boolean) as ToolEntry[];
  const kitContent = generateKitMd(installed, entries);
  writeKitMd(kitContent);

  p.log.success(`Updated ${pc.dim("~/.akit/kit.md")}`);

  if (mcpConfigured && hasAmanAgent()) {
    p.log.info(pc.dim("Restart aman-agent to load the new tool."));
  }

  p.outro("Done.");
}
