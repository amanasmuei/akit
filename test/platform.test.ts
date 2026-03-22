import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  detectPlatform,
  isMcpPlatform,
  getMcpConfigPath,
  addMcpServer,
  removeMcpServer,
} from "../src/lib/platform.js";
import type { Platform, McpServerConfig } from "../src/lib/platform.js";

describe("detectPlatform", () => {
  let tmpDir: string;
  let origCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "akit-platform-test-"));
    origCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns 'other' when no platform markers exist", () => {
    expect(detectPlatform()).toBe("other");
  });

  it("detects claude-code from CLAUDE.md", () => {
    fs.writeFileSync(path.join(tmpDir, "CLAUDE.md"), "# Claude");
    expect(detectPlatform()).toBe("claude-code");
  });

  it("detects cursor from .cursorrules", () => {
    fs.writeFileSync(path.join(tmpDir, ".cursorrules"), "rules");
    expect(detectPlatform()).toBe("cursor");
  });

  it("detects windsurf from .windsurfrules", () => {
    fs.writeFileSync(path.join(tmpDir, ".windsurfrules"), "rules");
    expect(detectPlatform()).toBe("windsurf");
  });

  it("prefers .acore/config.json over file detection", () => {
    fs.writeFileSync(path.join(tmpDir, "CLAUDE.md"), "# Claude");
    fs.mkdirSync(path.join(tmpDir, ".acore"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".acore", "config.json"),
      JSON.stringify({ platform: "cursor" })
    );
    expect(detectPlatform()).toBe("cursor");
  });

  it("falls through on invalid config.json", () => {
    fs.mkdirSync(path.join(tmpDir, ".acore"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".acore", "config.json"), "not-json");
    fs.writeFileSync(path.join(tmpDir, "CLAUDE.md"), "# Claude");
    expect(detectPlatform()).toBe("claude-code");
  });

  it("falls through on unrecognized platform in config", () => {
    fs.mkdirSync(path.join(tmpDir, ".acore"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".acore", "config.json"),
      JSON.stringify({ platform: "unknown-platform" })
    );
    expect(detectPlatform()).toBe("other");
  });
});

describe("isMcpPlatform", () => {
  it("returns true for claude-code", () => {
    expect(isMcpPlatform("claude-code")).toBe(true);
  });

  it("returns true for cursor", () => {
    expect(isMcpPlatform("cursor")).toBe(true);
  });

  it("returns true for windsurf", () => {
    expect(isMcpPlatform("windsurf")).toBe(true);
  });

  it("returns false for other", () => {
    expect(isMcpPlatform("other")).toBe(false);
  });
});

describe("getMcpConfigPath", () => {
  it("returns claude settings path for claude-code", () => {
    const result = getMcpConfigPath("claude-code");
    expect(result).toBe(path.join(os.homedir(), ".claude", "settings.json"));
  });

  it("returns .cursor/mcp.json for cursor", () => {
    const result = getMcpConfigPath("cursor");
    expect(result).toBe(path.join(process.cwd(), ".cursor", "mcp.json"));
  });

  it("returns windsurf path for windsurf", () => {
    const result = getMcpConfigPath("windsurf");
    expect(result).toBe(path.join(os.homedir(), ".windsurf", "mcp.json"));
  });

  it("returns null for other", () => {
    expect(getMcpConfigPath("other")).toBeNull();
  });
});

describe("addMcpServer", () => {
  let tmpDir: string;
  let origCwd: string;
  let origHomedir: typeof os.homedir;

  const serverConfig: McpServerConfig = {
    command: "npx",
    args: ["-y", "@test/server"],
    env: { TEST_KEY: "value" },
  };

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "akit-mcp-test-"));
    origCwd = process.cwd();
    process.chdir(tmpDir);
    // Override homedir for claude-code and windsurf paths
    origHomedir = os.homedir;
    vi.spyOn(os, "homedir").mockReturnValue(tmpDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates config file for claude-code", () => {
    addMcpServer("claude-code", "test-server", serverConfig);
    const configPath = path.join(tmpDir, ".claude", "settings.json");
    expect(fs.existsSync(configPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(content.mcpServers["test-server"]).toEqual(serverConfig);
  });

  it("creates config file for cursor", () => {
    addMcpServer("cursor", "test-server", serverConfig);
    const configPath = path.join(tmpDir, ".cursor", "mcp.json");
    expect(fs.existsSync(configPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(content.mcpServers["test-server"]).toEqual(serverConfig);
  });

  it("creates config file for windsurf", () => {
    addMcpServer("windsurf", "test-server", serverConfig);
    const configPath = path.join(tmpDir, ".windsurf", "mcp.json");
    expect(fs.existsSync(configPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(content.mcpServers["test-server"]).toEqual(serverConfig);
  });

  it("does nothing for other platform", () => {
    addMcpServer("other", "test-server", serverConfig);
    // No config file should be created for "other"
    expect(fs.readdirSync(tmpDir).filter((f) => f.startsWith("."))).toEqual([]);
  });

  it("merges with existing config", () => {
    const configDir = path.join(tmpDir, ".claude");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, "settings.json"),
      JSON.stringify({ mcpServers: { existing: { command: "echo" } }, otherKey: true })
    );
    addMcpServer("claude-code", "new-server", serverConfig);
    const content = JSON.parse(
      fs.readFileSync(path.join(configDir, "settings.json"), "utf-8")
    );
    expect(content.mcpServers["existing"]).toEqual({ command: "echo" });
    expect(content.mcpServers["new-server"]).toEqual(serverConfig);
    expect(content.otherKey).toBe(true);
  });

  it("handles corrupt existing config gracefully", () => {
    const configDir = path.join(tmpDir, ".claude");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(path.join(configDir, "settings.json"), "not-json");
    addMcpServer("claude-code", "test-server", serverConfig);
    const content = JSON.parse(
      fs.readFileSync(path.join(configDir, "settings.json"), "utf-8")
    );
    expect(content.mcpServers["test-server"]).toEqual(serverConfig);
  });
});

describe("removeMcpServer", () => {
  let tmpDir: string;
  let origCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "akit-mcp-rm-test-"));
    origCwd = process.cwd();
    process.chdir(tmpDir);
    vi.spyOn(os, "homedir").mockReturnValue(tmpDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("removes a server from config", () => {
    addMcpServer("claude-code", "server-a", { command: "a", args: [] });
    addMcpServer("claude-code", "server-b", { command: "b", args: [] });
    removeMcpServer("claude-code", "server-a");
    const configPath = path.join(tmpDir, ".claude", "settings.json");
    const content = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(content.mcpServers["server-a"]).toBeUndefined();
    expect(content.mcpServers["server-b"]).toBeDefined();
  });

  it("no-ops when config file does not exist", () => {
    // Should not throw
    removeMcpServer("claude-code", "nonexistent");
  });

  it("no-ops for other platform", () => {
    removeMcpServer("other", "test-server");
  });

  it("handles removing non-existent server from valid config", () => {
    addMcpServer("claude-code", "server-a", { command: "a", args: [] });
    removeMcpServer("claude-code", "nonexistent");
    const configPath = path.join(tmpDir, ".claude", "settings.json");
    const content = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(content.mcpServers["server-a"]).toBeDefined();
  });
});
