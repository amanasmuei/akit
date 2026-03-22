import * as p from "@clack/prompts";
import pc from "picocolors";
import { loadInstalledTools } from "../lib/kit.js";
import { findTool } from "../lib/registry.js";
import { detectPlatform, isMcpPlatform, getMcpConfigPath } from "../lib/platform.js";
import { globalConfigExists, acoreExists } from "../lib/paths.js";
import fs from "node:fs";

export function doctorCommand(): void {
  p.intro(pc.bold("akit doctor") + " — health check");

  let score = 10;
  const installed = loadInstalledTools();
  const platform = detectPlatform();

  // Check: tools installed
  if (installed.length === 0) {
    p.log.warning("No tools installed — run " + pc.bold("akit add <tool>"));
    score -= 2;
  } else {
    p.log.success(`${installed.length} tools installed`);
  }

  // Check: kit.md exists
  if (globalConfigExists()) {
    p.log.success("kit.md exists");
  } else {
    p.log.error("kit.md not found — run " + pc.bold("akit add <tool>") + " to create it");
    score -= 2;
  }

  // Check: platform detected
  if (isMcpPlatform(platform)) {
    p.log.success(`Platform: ${pc.bold(platform)} (MCP supported)`);
  } else {
    p.log.warning(`Platform: ${pc.dim(platform)} — tools will run in manual mode`);
    score -= 1;
  }

  // Check: MCP config exists (for MCP platforms)
  if (isMcpPlatform(platform)) {
    const configPath = getMcpConfigPath(platform);
    if (configPath && fs.existsSync(configPath)) {
      p.log.success("MCP config file exists");
    } else {
      p.log.warning("MCP config file not found — tools may not be connected");
      score -= 1;
    }
  }

  // Check: tools with missing env vars
  for (const tool of installed) {
    const entry = findTool(tool.name);
    if (entry?.mcp?.env) {
      for (const envVar of Object.keys(entry.mcp.env)) {
        if (!process.env[envVar]) {
          p.log.warning(`${pc.bold(tool.name)}: ${envVar} not set — ${entry.envHint || "set this environment variable"}`);
          score -= 1;
        }
      }
    }
  }

  // Check: acore integration
  if (acoreExists()) {
    p.log.success("acore detected — identity layer connected");
  } else {
    p.log.info("acore not found — run " + pc.bold("npx @aman_asmuei/acore") + " for AI identity");
  }

  // Score
  score = Math.max(0, score);
  const scoreColor = score >= 8 ? pc.green : score >= 5 ? pc.yellow : pc.red;
  p.log.message("");
  p.log.info(`Score: ${scoreColor(`${score}/10`)}`);

  p.outro("");
}
