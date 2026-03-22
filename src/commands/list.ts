import * as p from "@clack/prompts";
import pc from "picocolors";
import { loadInstalledTools } from "../lib/kit.js";
import { findTool } from "../lib/registry.js";

export function listCommand(): void {
  const installed = loadInstalledTools();

  if (installed.length === 0) {
    p.intro(pc.bold("akit") + " — your AI toolkit");
    p.log.info("No tools installed yet.");
    p.log.info(`Run ${pc.bold("akit search <query>")} to find tools.`);
    p.log.info(`Run ${pc.bold("akit add <tool>")} to install one.`);
    p.outro("");
    return;
  }

  p.intro(pc.bold("akit") + " — " + installed.length + " tools installed");

  for (const tool of installed) {
    const entry = findTool(tool.name);
    const desc = entry ? entry.description : "Unknown tool";
    const mode = tool.mcpConfigured ? pc.green("MCP") : pc.dim("manual");
    p.log.info(`${pc.bold(tool.name)} — ${desc} [${mode}]`);
  }

  p.outro("");
}
