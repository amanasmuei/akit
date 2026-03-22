import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "node:fs";
import { getKitPath, globalConfigExists } from "../lib/paths.js";

export function showCommand(): void {
  if (!globalConfigExists()) {
    p.intro(pc.bold("akit show"));
    p.log.info("No toolkit configured yet.");
    p.log.info(`Run ${pc.bold("akit add <tool>")} to get started.`);
    p.outro("");
    return;
  }

  const content = fs.readFileSync(getKitPath(), "utf-8");
  p.intro(pc.bold("akit") + " — your toolkit");
  console.log(content);
  p.outro("");
}
