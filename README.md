<div align="center">

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/akit-capability_layer-white?style=for-the-badge&labelColor=0d1117&color=58a6ff">
  <img alt="akit" src="https://img.shields.io/badge/akit-capability_layer-black?style=for-the-badge&labelColor=f6f8fa&color=24292f">
</picture>

### The portable capability layer for AI companions.

Give any AI tools that work everywhere — MCP on dev platforms, manual fallback everywhere else.

<br>

[![npm](https://img.shields.io/npm/v/@aman_asmuei/akit?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@aman_asmuei/akit)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![acore](https://img.shields.io/badge/part_of-acore_ecosystem-58a6ff.svg?style=flat-square)](https://github.com/amanasmuei/acore)

</div>

---

## The Problem

AI tools are platform-locked. MCP tools only work on MCP platforms. Function calling schemas differ between OpenAI, Anthropic, and Google. You can't take your AI's capabilities with you.

## The Solution

**akit** gives any AI a portable toolkit. One command to add tools. Works everywhere.

```bash
npx @aman_asmuei/akit add github
```

On **Claude Code / Cursor / Windsurf**: installs the real MCP server. Your AI gets actual tool access.

On **ChatGPT / Gemini / other**: updates your `kit.md` capability manifest. Your AI knows what tools exist and guides you through manual steps.

Same command. Same file. Different capabilities based on platform.

---

## The Ecosystem

```
aman
├── acore   →  identity     →  who your AI IS
├── amem    →  memory       →  what your AI KNOWS
├── akit    →  tools        →  what your AI CAN DO
├── aflow   →  workflows    →  HOW your AI works
├── arules  →  guardrails   →  what your AI WON'T do
└── aeval   →  evaluation   →  how GOOD your AI is
```

| Layer | Package | What it does |
|:------|:--------|:-------------|
| Identity | [acore](https://github.com/amanasmuei/acore) | Personality, values, relationship memory |
| Memory | [amem](https://github.com/amanasmuei/amem) | Automated knowledge storage (MCP) |
| Tools | **akit** | 15 portable AI tools (MCP + manual fallback) |
| Workflows | [aflow](https://github.com/amanasmuei/aflow) | Reusable AI workflows (code review, bug fix, etc.) |
| Guardrails | [arules](https://github.com/amanasmuei/arules) | Safety boundaries and permissions |
| Evaluation | [aeval](https://github.com/amanasmuei/aeval) | Relationship tracking and session logging |
| **Unified** | **[aman](https://github.com/amanasmuei/aman)** | **One command to set up everything** |

Each works independently. `aman` is the front door.

---

## Quick Start

```bash
# Search for tools
npx @aman_asmuei/akit search database

# Add a tool
npx @aman_asmuei/akit add github

# See your toolkit
npx @aman_asmuei/akit show

# Health check
npx @aman_asmuei/akit doctor
```

## Commands

| Command | What it does |
|:--------|:------------|
| `akit add <tool>` | Add a tool (auto-configures MCP if available) |
| `akit remove <tool>` | Remove a tool |
| `akit list` | List installed tools |
| `akit search <query>` | Search the tool registry |
| `akit show` | View your kit.md |
| `akit doctor` | Health check your toolkit |

## Available Tools

| Tool | Category | What it does |
|:-----|:---------|:-------------|
| `web-search` | Search | Search the web for current information |
| `brave-search` | Search | Private web search via Brave |
| `github` | Development | PRs, issues, repos, code review |
| `git` | Development | Log, diff, blame, branch management |
| `filesystem` | Development | Read, write, search project files |
| `memory` | Memory | Persistent AI memory via amem |
| `postgres` | Data | Query PostgreSQL databases |
| `sqlite` | Data | Query local SQLite databases |
| `fetch` | Automation | HTTP requests to APIs |
| `puppeteer` | Automation | Browser automation |
| `slack` | Communication | Send and read Slack messages |
| `notion` | Communication | Notion pages and databases |
| `linear` | Development | Linear issues and projects |
| `sentry` | Development | Error monitoring and triage |
| `docker` | Automation | Container management |

## How It Works

### kit.md — The Capability Manifest

Every tool you add gets recorded in `~/.akit/kit.md`:

```markdown
# My AI Toolkit

## github
- Do: Manage GitHub repos, PRs, issues, and code review
- When: PRs, issues, repos, code review
- How: MCP -> @modelcontextprotocol/server-github

## filesystem
- Do: Read, write, and search project files
- When: coding, documentation
- How: native (built into Claude Code, Cursor)

---

## Permissions
- Never delete data without confirmation
- Never push to main without approval
- Ask before making external API calls that modify state
```

Your AI reads this file and knows what it can do.

### Platform Behavior

| Platform | What happens when you `akit add` |
|:---------|:--------------------------------|
| Claude Code | Writes MCP config to `~/.claude/settings.json` |
| Cursor | Writes MCP config to `.cursor/mcp.json` |
| Windsurf | Writes MCP config to `~/.windsurf/mcp.json` |
| ChatGPT / Other | Updates kit.md with manual instructions |

---

## Privacy

All data stays local. `~/.akit/` contains your toolkit config. No telemetry. No accounts. No cloud.

## Contributing

Contributions welcome! Add tools to the registry, improve platform support, or suggest features.

## License

[MIT](LICENSE)

---

<div align="center">

**One command. Any tool. Every AI.**

</div>
