import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  loadInstalledTools,
  saveInstalledTools,
  addInstalledTool,
  removeInstalledTool,
  isToolInstalled,
  generateKitMd,
} from "../src/lib/kit.js";
import type { InstalledTool } from "../src/lib/kit.js";
import type { ToolEntry } from "../src/lib/registry.js";

// Mock paths to use a temp directory
vi.mock("../src/lib/paths.js", () => {
  let _tmpDir = "";
  return {
    getGlobalDir: () => _tmpDir,
    getKitPath: () => path.join(_tmpDir, "kit.md"),
    getInstalledToolsPath: () => path.join(_tmpDir, "installed.json"),
    __setTmpDir: (dir: string) => { _tmpDir = dir; },
  };
});

// Access the setter to change tmpDir per test
import * as pathsMock from "../src/lib/paths.js";
const setTmpDir = (pathsMock as unknown as { __setTmpDir: (dir: string) => void }).__setTmpDir;

describe("kit", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "akit-kit-test-"));
    setTmpDir(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("loadInstalledTools", () => {
    it("returns empty array when file does not exist", () => {
      expect(loadInstalledTools()).toEqual([]);
    });

    it("returns parsed tools from file", () => {
      const tools: InstalledTool[] = [
        { name: "github", installedAt: "2025-01-01", mcpConfigured: true },
      ];
      fs.writeFileSync(path.join(tmpDir, "installed.json"), JSON.stringify(tools));
      expect(loadInstalledTools()).toEqual(tools);
    });

    it("returns empty array on invalid JSON", () => {
      fs.writeFileSync(path.join(tmpDir, "installed.json"), "not-json");
      expect(loadInstalledTools()).toEqual([]);
    });
  });

  describe("saveInstalledTools", () => {
    it("creates directory and writes file", () => {
      const nested = path.join(tmpDir, "sub");
      setTmpDir(nested);
      const tools: InstalledTool[] = [
        { name: "git", installedAt: "2025-02-01", mcpConfigured: false },
      ];
      saveInstalledTools(tools);
      const content = fs.readFileSync(path.join(nested, "installed.json"), "utf-8");
      expect(JSON.parse(content)).toEqual(tools);
      setTmpDir(tmpDir); // restore
    });

    it("overwrites existing file", () => {
      const tools1: InstalledTool[] = [
        { name: "git", installedAt: "2025-01-01", mcpConfigured: false },
      ];
      const tools2: InstalledTool[] = [
        { name: "slack", installedAt: "2025-02-01", mcpConfigured: true },
      ];
      saveInstalledTools(tools1);
      saveInstalledTools(tools2);
      expect(loadInstalledTools()).toEqual(tools2);
    });
  });

  describe("addInstalledTool", () => {
    it("adds a new tool", () => {
      addInstalledTool("github", true);
      const tools = loadInstalledTools();
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe("github");
      expect(tools[0].mcpConfigured).toBe(true);
      expect(tools[0].installedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("updates an existing tool instead of duplicating", () => {
      addInstalledTool("github", false);
      addInstalledTool("github", true);
      const tools = loadInstalledTools();
      expect(tools.length).toBe(1);
      expect(tools[0].mcpConfigured).toBe(true);
    });

    it("adds multiple different tools", () => {
      addInstalledTool("github", true);
      addInstalledTool("slack", false);
      const tools = loadInstalledTools();
      expect(tools.length).toBe(2);
    });
  });

  describe("removeInstalledTool", () => {
    it("removes an existing tool", () => {
      addInstalledTool("github", true);
      addInstalledTool("slack", false);
      removeInstalledTool("github");
      const tools = loadInstalledTools();
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe("slack");
    });

    it("no-ops when tool does not exist", () => {
      addInstalledTool("github", true);
      removeInstalledTool("nonexistent");
      expect(loadInstalledTools().length).toBe(1);
    });
  });

  describe("isToolInstalled", () => {
    it("returns true for installed tool", () => {
      addInstalledTool("github", true);
      expect(isToolInstalled("github")).toBe(true);
    });

    it("returns false for uninstalled tool", () => {
      expect(isToolInstalled("github")).toBe(false);
    });
  });
});

describe("generateKitMd", () => {
  const sampleEntries: ToolEntry[] = [
    {
      name: "github",
      description: "Manage GitHub repos, PRs, issues",
      category: "development",
      mcp: {
        package: "@modelcontextprotocol/server-github",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: { GITHUB_TOKEN: "" },
      },
      manual: "Suggest gh CLI commands for user to run",
      capabilities: ["PRs", "issues", "repos"],
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
      capabilities: ["send messages", "read channels"],
    },
  ];

  it("returns empty-state message when no tools installed", () => {
    const md = generateKitMd([], sampleEntries);
    expect(md).toContain("No tools installed yet");
    expect(md).toContain("akit add");
  });

  it("generates markdown for installed tools with MCP", () => {
    const tools: InstalledTool[] = [
      { name: "github", installedAt: "2025-01-01", mcpConfigured: true },
    ];
    const md = generateKitMd(tools, sampleEntries);
    expect(md).toContain("## github");
    expect(md).toContain("Manage GitHub repos, PRs, issues");
    expect(md).toContain("PRs, issues, repos");
    expect(md).toContain("MCP");
    expect(md).toContain("@modelcontextprotocol/server-github");
  });

  it("uses manual fallback when MCP not configured", () => {
    const tools: InstalledTool[] = [
      { name: "slack", installedAt: "2025-01-01", mcpConfigured: false },
    ];
    const md = generateKitMd(tools, sampleEntries);
    expect(md).toContain("## slack");
    expect(md).toContain("Ask user to check Slack");
    expect(md).not.toContain("MCP");
  });

  it("includes permissions section for non-empty toolkit", () => {
    const tools: InstalledTool[] = [
      { name: "github", installedAt: "2025-01-01", mcpConfigured: true },
    ];
    const md = generateKitMd(tools, sampleEntries);
    expect(md).toContain("## Permissions");
    expect(md).toContain("Never delete data without confirmation");
    expect(md).toContain("Never push to main without approval");
  });

  it("skips tools not found in registry entries", () => {
    const tools: InstalledTool[] = [
      { name: "unknown-tool", installedAt: "2025-01-01", mcpConfigured: false },
    ];
    const md = generateKitMd(tools, sampleEntries);
    expect(md).not.toContain("## unknown-tool");
  });

  it("generates multiple tool sections", () => {
    const tools: InstalledTool[] = [
      { name: "github", installedAt: "2025-01-01", mcpConfigured: true },
      { name: "slack", installedAt: "2025-01-02", mcpConfigured: false },
    ];
    const md = generateKitMd(tools, sampleEntries);
    expect(md).toContain("## github");
    expect(md).toContain("## slack");
  });
});
