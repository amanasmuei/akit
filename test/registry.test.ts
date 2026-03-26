import { describe, it, expect } from "vitest";
import { REGISTRY, findTool, searchTools } from "../src/lib/registry.js";

describe("REGISTRY", () => {
  it("contains tools", () => {
    expect(REGISTRY.length).toBeGreaterThan(0);
  });

  it("every entry has required fields", () => {
    for (const tool of REGISTRY) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.category).toBeTruthy();
      expect(tool.manual).toBeTruthy();
      expect(Array.isArray(tool.capabilities)).toBe(true);
      expect(tool.capabilities.length).toBeGreaterThan(0);
    }
  });

  it("has unique names", () => {
    const names = REGISTRY.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every category is valid", () => {
    const validCategories = ["search", "development", "data", "communication", "automation", "memory", "documents"];
    for (const tool of REGISTRY) {
      expect(validCategories).toContain(tool.category);
    }
  });

  it("mcp entries have package field", () => {
    for (const tool of REGISTRY) {
      if (tool.mcp) {
        expect(tool.mcp.package).toBeTruthy();
      }
    }
  });
});

describe("findTool", () => {
  it("finds a tool by exact name", () => {
    const tool = findTool("github");
    expect(tool).toBeDefined();
    expect(tool!.name).toBe("github");
    expect(tool!.category).toBe("development");
  });

  it("returns undefined for unknown name", () => {
    expect(findTool("nonexistent-tool")).toBeUndefined();
  });

  it("does not match partial names", () => {
    expect(findTool("git")).toBeDefined(); // "git" is an exact match
    expect(findTool("gith")).toBeUndefined(); // partial of "github" should not match
  });

  it("is case-sensitive", () => {
    expect(findTool("GitHub")).toBeUndefined();
  });
});

describe("searchTools", () => {
  it("matches by name", () => {
    const results = searchTools("slack");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((t) => t.name === "slack")).toBe(true);
  });

  it("matches by description", () => {
    const results = searchTools("browser");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((t) => t.name === "puppeteer")).toBe(true);
  });

  it("matches by category", () => {
    const results = searchTools("search");
    expect(results.some((t) => t.name === "web-search")).toBe(true);
    expect(results.some((t) => t.name === "brave-search")).toBe(true);
  });

  it("matches by capability", () => {
    const results = searchTools("scraping");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((t) => t.name === "puppeteer")).toBe(true);
  });

  it("is case-insensitive", () => {
    const lower = searchTools("github");
    const upper = searchTools("GITHUB");
    expect(lower.length).toBe(upper.length);
  });

  it("returns empty array for no matches", () => {
    const results = searchTools("zzz-no-match-zzz");
    expect(results).toEqual([]);
  });

  it("returns multiple results for broad queries", () => {
    const results = searchTools("development");
    expect(results.length).toBeGreaterThan(1);
  });
});
