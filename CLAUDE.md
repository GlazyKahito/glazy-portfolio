@AGENTS.md

## Claude Code specifics

- MCP servers configured for this project: `shadcn` (project, `.mcp.json`) plus user-level `context7`, `playwright`, `chrome-devtools`, `next-devtools`, `github`, `vercel`, `figma`.
- Workflow that works here: look up current docs with Context7 → build → `npm run dev` → inspect with headless Playwright at 375/768/1440 → check runtime errors with next-devtools → headless Lighthouse (`npx lighthouse <url> --chrome-flags="--headless=new"`) → fix → commit → push (Vercel deploys `main`; big visual changes go to a preview branch first).
- On Windows, stdio MCP servers need `cmd /c npx …`; see `~/.claude` memory notes.
