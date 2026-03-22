import * as p from "@clack/prompts";
import pc from "picocolors";
import { searchTools, REGISTRY } from "../lib/registry.js";
import { isToolInstalled } from "../lib/kit.js";

export function searchCommand(query: string): void {
  const results = searchTools(query);

  if (results.length === 0) {
    p.intro(pc.bold("akit search") + " — no results for " + pc.cyan(query));
    p.log.info(`${REGISTRY.length} tools in registry, none matched "${query}".`);
    p.outro("");
    return;
  }

  p.intro(pc.bold("akit search") + " — " + results.length + " results for " + pc.cyan(query));

  for (const tool of results) {
    const installed = isToolInstalled(tool.name);
    const status = installed ? pc.green(" [installed]") : "";
    const mcp = tool.mcp ? pc.dim(" (MCP)") : "";
    p.log.info(
      `${pc.bold(tool.name)}${status}${mcp} — ${tool.description}`
    );
    p.log.message(`  ${pc.dim(tool.capabilities.join(", "))}`);
  }

  p.outro("");
}
