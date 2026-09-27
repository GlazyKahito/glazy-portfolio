@AGENTS.md

## Claude Code specifics

- MCP servers configured for this project: `shadcn` (project, `.mcp.json`) plus user-level `context7`, `playwright`, `chrome-devtools`, `next-devtools`, `github`, `vercel`, `figma`.
- Workflow that works here: look up current docs with Context7 → build → `npm run dev` → inspect with Playwright at 375/768/1440 → check Next.js runtime errors with next-devtools → Lighthouse via chrome-devtools → fix → commit → push (Vercel deploys `main`).
- On Windows, stdio MCP servers need `cmd /c npx …`; see `~/.claude` memory notes.
