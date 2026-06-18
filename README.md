# Claude Code Me（目）

[![Claude Code](https://img.shields.io/badge/Claude%20Code-v2.1.181-D97757?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNiIgZmlsbD0iI0Q5Nzc1NyIvPjxlbGxpcHNlIGN4PSIxNiIgY3k9IjE2IiByeD0iMTIiIHJ5PSI4IiBmaWxsPSIjRkFGOUY3Ii8+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzFhMWExYSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjMiIGZpbGw9IiNEOTc3NTciLz48Y2lyY2xlIGN4PSIxNCIgY3k9IjE0LjUiIHI9IjEuNSIgZmlsbD0iI0ZBRjlGNyIgb3BhY2l0eT0iMC44Ii8+PC9zdmc+)](https://docs.anthropic.com/en/docs/claude-code)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![Hono](https://img.shields.io/badge/Hono-4-E36002?logo=hono&logoColor=white)](https://hono.dev/)

> Claude Code の設定、全部俯瞰して見れる UI があればいいのに。
> Hooks 何個設定したっけ？MCP サーバーどれ繋いでたっけ？あのプロジェクトの CLAUDE.md 何書いたっけ？
>
> 「Claude Code の設定を GUI で目視確認したい」— そんな声に応えるツールです。
>
> **Me** = 目（見る）× Me（自分の Claude Code を見る）

`~/.claude/` の **読み取り専用** Web コンソール。

## Features

- User / Project スコープを 1 画面で俯瞰 (CLAUDE.md / Settings / Hooks / MCP / Skills / Plugins / Env / Permissions / Commands / Agents / Rules / Memory / Sessions / History / Insights)
- Project スコープでは User からの継承を `USER` / `PROJECT` バッジで可視化 — settings は deep merge、hooks/rules/skills/commands/agents は union
- `~/.claude/history.jsonl` の検索 + project フィルタ
- `~/.claude/usage-data/report.html` を iframe 埋込

## Quick Start

```bash
git clone https://github.com/ist-j-ichikawa/claude-code-me.git
cd claude-code-me
pnpm install
pnpm dev          # ブラウザが自動で開きます
```

> **前提条件**: Node.js 22.13+, [Claude Code](https://docs.anthropic.com/en/docs/claude-code) がインストール済みであること（`~/.claude/` が存在すること）

## Tech Stack

| Layer           | Technology                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| Frontend        | [Svelte 5](https://svelte.dev/) + [SvelteKit](https://svelte.dev/docs/kit/) (SPA mode, hash router)  |
| Server          | [Hono 4](https://hono.dev/) on Node.js (+ [Zod 4](https://zod.dev/) で query 検証)                    |
| Build           | [Vite 8](https://vite.dev/), [tsup](https://tsup.egoist.dev/)                                        |
| Test            | [Vitest 4](https://vitest.dev/)                                                                      |
| Language        | **TypeScript 6**                                                                                      |
| CSS             | Svelte scoped CSS + CSS custom properties                                                            |
| Design          | Anthropic-inspired (coral `#D97757`, warm beige `#FAF9F7`, Instrument Sans + Source Code Pro)        |
| Package Manager | pnpm 11                                                                                              |

## Development

```bash
pnpm install
pnpm dev              # tsx watch src/server/dev.ts (Hono + Vite middleware, HMR 統合)
pnpm test             # Vitest
pnpm build            # vite build && tsup -> dist/
pnpm start            # node dist/server.mjs (built artifact)
```

dev / prod とも `claude-code-me.localhost` で起動します (起動時に自動でブラウザが開きます)。`pnpm dev` は Hono サーバーに Vite を `middlewareMode: true` で組み込み、`/api/*` を Hono、それ以外を Vite に振り分け。HMR の WebSocket も同じ HTTP server に upgrade。production (`dist/server.mjs`) は Vite を一切含まず、`serveStatic` + SPA fallback のみ。

### Directory Structure

```
src/
  server/             Hono API server (TypeScript)
    index.ts          Prod entry — Hono + serveStatic + serve()
    dev.ts            Dev entry — imports app, attaches Vite middleware
    routes.ts         Chained Hono routes (RPC type-inferred)
    scopes.ts         discoverScopes / resolveScope / CWD cache
    config.ts         buildConfig + CLAUDE.md / MCP detection
    sessions.ts       Session parsing (sessions-index.json + JSONL fallback)
    history.ts        Recent prompts from ~/.claude/history.jsonl
    env-vars.ts       Claude Code env var registry (~175 entries)
    files.ts          File serving + zone resolution + path traversal / symlink guard
    jsonl.ts          JSONL range reader + parser
    types.ts          Shared type definitions
  client/             SvelteKit SPA
    routes/           File-based routing
    lib/components/   Shared components + sections/ (hub page sections)
    lib/              API client (Hono RPC), types, design tokens
test/
  server/             Vitest server tests (incl. E2E via app.request)
dist/                 Production build output (gitignored)
  server.mjs          Bundled server (single file, shebang, ~615 KB)
  client/             Static SPA assets
```

## Security

- **読み取り専用**: 書き込み API なし
- **localhost のみ**: 外部アクセス不可。許可ディレクトリ外のファイルは読まない
- **ファイル境界チェック**: path traversal と symlink escape を realpath ベースで拒否
- **機密値マスク**: `settings.env` / MCP `env` などの API キー・トークン系は値を表示しない
