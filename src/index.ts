import { Command } from "commander";
import { addCommand } from "./commands/add.js";
import { removeCommand } from "./commands/remove.js";
import { listCommand } from "./commands/list.js";
import { searchCommand } from "./commands/search.js";
import { showCommand } from "./commands/show.js";
import { doctorCommand } from "./commands/doctor.js";
import { globalConfigExists } from "./lib/paths.js";

declare const __VERSION__: string;

const program = new Command();

program
  .name("akit")
  .description("The portable capability layer for AI companions")
  .version(__VERSION__)
  .action(() => {
    if (globalConfigExists()) {
      showCommand();
    } else {
      listCommand();
    }
  });

program
  .command("add <tool>")
  .description("Add a tool to your AI toolkit")
  .option("--mcp <package>", "Custom MCP server npm package")
  .action((tool, opts) => addCommand(tool, opts));

program
  .command("remove <tool>")
  .description("Remove a tool from your toolkit")
  .action((tool) => removeCommand(tool));

program
  .command("list")
  .description("List installed tools")
  .action(() => listCommand());

program
  .command("search <query>")
  .description("Search available tools in the registry")
  .action((query) => searchCommand(query));

program
  .command("show")
  .description("View your current kit.md")
  .action(() => showCommand());

program
  .command("doctor")
  .description("Health check your toolkit configuration")
  .action(() => doctorCommand());

program.parse();
