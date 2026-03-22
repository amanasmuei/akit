export interface ToolEntry {
  name: string;
  description: string;
  category: "search" | "development" | "data" | "communication" | "automation" | "memory";
  mcp: {
    package: string;
    command?: string;
    args?: string[];
    env?: Record<string, string>;
  } | null;
  manual: string;
  capabilities: string[];
  envHint?: string;
}

export const REGISTRY: ToolEntry[] = [
  {
    name: "web-search",
    description: "Search the web for current information",
    category: "search",
    mcp: {
      package: "@anthropic/web-search",
      command: "npx",
      args: ["-y", "@anthropic/web-search"],
    },
    manual: "Ask user to search and paste results",
    capabilities: ["research", "fact-checking", "current events"],
  },
  {
    name: "brave-search",
    description: "Private web search via Brave",
    category: "search",
    mcp: {
      package: "@modelcontextprotocol/server-brave-search",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-brave-search"],
      env: { BRAVE_API_KEY: "" },
    },
    manual: "Ask user to search Brave and paste results",
    capabilities: ["research", "private search"],
    envHint: "Set BRAVE_API_KEY from https://brave.com/search/api/",
  },
  {
    name: "github",
    description: "Manage GitHub repos, PRs, issues, and code review",
    category: "development",
    mcp: {
      package: "@modelcontextprotocol/server-github",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: { GITHUB_TOKEN: "" },
    },
    manual: "Suggest gh CLI commands for user to run",
    capabilities: ["PRs", "issues", "repos", "code review"],
    envHint: "Set GITHUB_TOKEN from https://github.com/settings/tokens",
  },
  {
    name: "git",
    description: "Git operations — log, diff, blame, branch management",
    category: "development",
    mcp: {
      package: "@modelcontextprotocol/server-git",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-git"],
    },
    manual: "Suggest git commands for user to run",
    capabilities: ["log", "diff", "blame", "branch", "commit history"],
  },
  {
    name: "filesystem",
    description: "Read, write, and search project files",
    category: "development",
    mcp: {
      package: "@modelcontextprotocol/server-filesystem",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
    },
    manual: "Ask user to share file contents or run commands",
    capabilities: ["read files", "write files", "search", "directory listing"],
  },
  {
    name: "memory",
    description: "Persistent AI memory via amem",
    category: "memory",
    mcp: {
      package: "@aman_asmuei/amem",
      command: "npx",
      args: ["-y", "@aman_asmuei/amem"],
    },
    manual: "Use acore's built-in memory lifecycle rules",
    capabilities: ["store observations", "recall context", "semantic search"],
  },
  {
    name: "postgres",
    description: "Query and manage PostgreSQL databases",
    category: "data",
    mcp: {
      package: "@modelcontextprotocol/server-postgres",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres"],
      env: { DATABASE_URL: "" },
    },
    manual: "Ask user to run SQL queries and paste results",
    capabilities: ["query", "schema inspection", "data analysis"],
    envHint: "Set DATABASE_URL (e.g., postgresql://user:pass@localhost/db)",
  },
  {
    name: "sqlite",
    description: "Query local SQLite databases",
    category: "data",
    mcp: {
      package: "@modelcontextprotocol/server-sqlite",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-sqlite"],
    },
    manual: "Ask user to run sqlite3 commands and paste results",
    capabilities: ["query", "schema inspection", "local data"],
  },
  {
    name: "fetch",
    description: "Make HTTP requests to APIs and websites",
    category: "automation",
    mcp: {
      package: "@modelcontextprotocol/server-fetch",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-fetch"],
    },
    manual: "Ask user to run curl commands and paste results",
    capabilities: ["GET", "POST", "API calls", "web scraping"],
  },
  {
    name: "puppeteer",
    description: "Browser automation — screenshots, scraping, testing",
    category: "automation",
    mcp: {
      package: "@modelcontextprotocol/server-puppeteer",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-puppeteer"],
    },
    manual: "Ask user to take screenshots or run browser scripts",
    capabilities: ["screenshots", "form filling", "scraping", "testing"],
  },
  {
    name: "slack",
    description: "Send and read Slack messages",
    category: "communication",
    mcp: {
      package: "@modelcontextprotocol/server-slack",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-slack"],
      env: { SLACK_BOT_TOKEN: "" },
    },
    manual: "Ask user to check Slack and paste relevant messages",
    capabilities: ["send messages", "read channels", "search"],
    envHint: "Set SLACK_BOT_TOKEN from your Slack app settings",
  },
  {
    name: "notion",
    description: "Read and write Notion pages and databases",
    category: "communication",
    mcp: {
      package: "@notionhq/notion-mcp-server",
      command: "npx",
      args: ["-y", "@notionhq/notion-mcp-server"],
      env: { NOTION_API_KEY: "" },
    },
    manual: "Ask user to paste Notion content or share links",
    capabilities: ["read pages", "create pages", "query databases"],
    envHint: "Set NOTION_API_KEY from https://www.notion.so/my-integrations",
  },
  {
    name: "linear",
    description: "Manage Linear issues, projects, and cycles",
    category: "development",
    mcp: {
      package: "@linear/mcp-server",
      command: "npx",
      args: ["-y", "@linear/mcp-server"],
      env: { LINEAR_API_KEY: "" },
    },
    manual: "Ask user to check Linear and paste issue details",
    capabilities: ["issues", "projects", "cycles", "search"],
    envHint: "Set LINEAR_API_KEY from Linear settings → API",
  },
  {
    name: "sentry",
    description: "Monitor and triage application errors",
    category: "development",
    mcp: {
      package: "@sentry/mcp-server",
      command: "npx",
      args: ["-y", "@sentry/mcp-server"],
      env: { SENTRY_AUTH_TOKEN: "" },
    },
    manual: "Ask user to paste Sentry error details",
    capabilities: ["error monitoring", "issue triage", "stack traces"],
    envHint: "Set SENTRY_AUTH_TOKEN from Sentry settings → API keys",
  },
  {
    name: "docker",
    description: "Manage Docker containers and images",
    category: "automation",
    mcp: {
      package: "@modelcontextprotocol/server-docker",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-docker"],
    },
    manual: "Suggest docker commands for user to run",
    capabilities: ["containers", "images", "compose", "logs"],
  },
];

export function findTool(name: string): ToolEntry | undefined {
  return REGISTRY.find((t) => t.name === name);
}

export function searchTools(query: string): ToolEntry[] {
  const q = query.toLowerCase();
  return REGISTRY.filter(
    (t) =>
      t.name.includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.includes(q) ||
      t.capabilities.some((c) => c.toLowerCase().includes(q))
  );
}
