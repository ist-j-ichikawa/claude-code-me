# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-04-10

Full rewrite from vanilla JS to a modern stack.

### Added

- Hono RPC Client (`hc<ApiType>`) for type-safe API calls (replaces manual fetch)
- Route grouping: API routes extracted to `routes.ts` with chained definitions
- Zod validation on all query parameters (`scopeQuery`, `fileQuery` with Zone enum)
- E2E API tests via `app.request()` (11 tests, no server startup needed)
- Hono skill installed for inline API reference
- Hook events reference updated to 25 events (v2.1.107): PostCompact, PermissionDenied, StopFailure, InstructionsLoaded, Elicitation, ElicitationResult, TeammateIdle, TaskCreated, CwdChanged, PostToolUseFailure
- Tasks view: `~/.claude/tasks/` のタスクグループ表示（プログレスバー、プロジェクト紐付け）
- `/api/tasks` endpoint with session-to-project resolution via sessions-index.json
- Fixed port 3333 (`claude-code-me.localhost:3333`)
- TODO.md for tracking future work
- SvelteKit 5 SPA with hash-based routing and 14 view pages
- Hono server with TypeScript and type-safe API routes
- Unified sidebar: User nav + Project list + Project nav always visible
- Shared components: DataTable, Section, InfoGrid, TagList, JsonViewer, NavItem
- Project name decoding for encoded directory names
- Path traversal protection with `path.normalize()` validation
- Zone type (`'claude' | 'parent' | 'projectClaude' | 'memory'`) for type-safe zone handling
- Production build pipeline: `vite build` (SPA) + `tsup` (server bundle)
- 61 server-side tests with Vitest
- Test helpers (`useTmpDir`, `writeFile`) for clean test setup
- Me favicon (SVG, coral background)
- Hash router bootstrap script in `app.html` for reliable initial navigation

### Changed

- Renamed from "Claude Code Config UI" to "Claude Code Me" (Me)
- Server: raw `node:http` replaced with Hono (~97KB bundled, runtime deps zero)
- Frontend: vanilla JS string concatenation replaced with Svelte 5 components
- State management: 6 global variables replaced with SvelteKit `load` functions + `$derived`
- CSS: monolithic 600-line `<style>` block replaced with Svelte scoped CSS + design tokens
- Build output: 2 files (server.js + index.html) replaced with `dist/server.mjs` + `dist/client/`
- Hostname: `claude-code-config-ui.localhost` -> `claude-code-me.localhost`
- Package manager: none -> pnpm (via Vite+)

### Improved

- `readJsonlRange`: single `fstatSync` instead of `statSync` + `openSync` (syscall reduction)
- `readDirRecursive`: `withFileTypes` eliminates per-entry `statSync`
- `listJsonlFiles`: `withFileTypes` + `isFile()` filter
- `discoverScopes`: single-pass CWD + mtime resolution (no double stat)
- Empty projects (0 sessions) hidden from project list
