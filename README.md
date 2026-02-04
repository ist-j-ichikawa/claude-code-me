# Claude Code Me（目）

[![Claude Code](https://img.shields.io/badge/Claude%20Code-v2.1.109-D97757?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNiIgZmlsbD0iI0Q5Nzc1NyIvPjxlbGxpcHNlIGN4PSIxNiIgY3k9IjE2IiByeD0iMTIiIHJ5PSI4IiBmaWxsPSIjRkFGOUY3Ii8+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzFhMWExYSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjMiIGZpbGw9IiNEOTc3NTciLz48Y2lyY2xlIGN4PSIxNCIgY3k9IjE0LjUiIHI9IjEuNSIgZmlsbD0iI0ZBRjlGNyIgb3BhY2l0eT0iMC44Ii8+PC9zdmc+)](https://docs.anthropic.com/en/docs/claude-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![Hono](https://img.shields.io/badge/Hono-4-E36002?logo=hono&logoColor=white)](https://hono.dev/)

> Claude Code の設定、全部俯瞰して見れる UI があればいいのに。
> Hooks 何個設定したっけ？MCP サーバーどれ繋いでたっけ？あのプロジェクトの CLAUDE.md 何書いたっけ？
>
> そんな「ちょっと見たい」を叶えるために生まれました。
>
> **Me** = 目（見る）× Me（自分の Claude Code を見る）

`~/.claude/` 配下の設定・セッション・プロジェクトを一括可視化する **読み取り専用** Web コンソール。

## Quick Start

```bash
git clone https://github.com/ist-j-ichikawa/claude-code-me.git
cd claude-code-me
pnpm install
make build
make start      # ブラウザが自動で開きます
```

> **前提条件**: Node.js 18+, [Claude Code](https://docs.anthropic.com/en/docs/claude-code) がインストール済みであること（`~/.claude/` が存在すること）

## Install / Uninstall

パスの通った場所に `ccme` コマンドとしてインストールできます。

```bash
make install          # /usr/local/bin/ccme にインストール
ccme                    # どこからでも起動
```

```bash
make uninstall        # 削除
```

カスタムプレフィックス:

```bash
make install PREFIX=~/.local
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│ Browser (SPA)                                       │
│                                                     │
│  SvelteKit (hash router)                            │
│  ┌───────────┐ ┌──────────────────────────────────┐ │
│  │ Sidebar   │ │ Views (14 pages)                 │ │
│  │           │ │  Dashboard / Settings / Hooks     │ │
│  │ User Nav  │ │  MCP / Plugins / Permissions      │ │
│  │ Projects  │ │  Rules / Commands / Agents        │ │
│  │ Proj Nav  │ │  Memory / Plans / Skills          │ │
│  │           │ │  Sessions / File Viewer           │ │
│  └───────────┘ └──────────────────────────────────┘ │
│         │                    │                       │
│         └────── fetch ───────┘                       │
│                    │                                 │
└────────────────────┼─────────────────────────────────┘
                     │ HTTP (localhost)
┌────────────────────┼─────────────────────────────────┐
│ Hono Server        │                                 │
│                    ▼                                 │
│  /api/scopes ── discoverScopes()                     │
│  /api/config ── buildConfig()                        │
│  /api/sessions ── getSessions()                      │
│  /api/file ── resolveZoneDir() + path traversal guard│
│  /api/tree ── readDirRecursive()                     │
│                    │                                 │
│                    ▼                                 │
│  ~/.claude/                                          │
│  ├── settings.json, CLAUDE.md, hooks/, rules/, ...   │
│  └── projects/                                       │
│      └── <project-id>/                               │
│          ├── *.jsonl (sessions)                       │
│          └── sessions-index.json                     │
└──────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer           | Technology                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| Frontend        | [Svelte 5](https://svelte.dev/) + [SvelteKit](https://svelte.dev/docs/kit/) (SPA mode, hash router)  |
| Server          | [Hono](https://hono.dev/) on Node.js                                                                 |
| Build           | [Vite+](https://viteplus.dev/) (`vp`), [Vite 8](https://vite.dev/), [tsup](https://tsup.egoist.dev/) |
| Test            | [Vitest](https://vitest.dev/)                                                                        |
| Language        | TypeScript                                                                                           |
| CSS             | Svelte scoped CSS + CSS custom properties                                                            |
| Design          | Anthropic-inspired (coral `#D97757`, warm beige `#FAF9F7`, Instrument Sans + Source Code Pro)        |
| Package Manager | pnpm (auto-detected by Vite+)                                                                        |

## Development

```bash
pnpm install
pnpm run dev          # SvelteKit dev server (HMR)
pnpm run server       # Hono server (tsx)
pnpm test             # Vitest
make build            # Production build -> dist/
```

### Directory Structure

```
src/
  server/             Hono API server (TypeScript)
    index.ts          Entry point + routes
    scopes.ts         Scope discovery + CWD resolution
    config.ts         buildConfig + CLAUDE.md/MCP detection
    sessions.ts       Session parsing (index.json + JSONL fallback)
    files.ts          File serving + zone resolution + path traversal guard
    jsonl.ts          JSONL range reader + parser
    types.ts          Shared type definitions
  client/             SvelteKit SPA
    routes/           File-based routing (14 views)
    lib/components/   Reusable Svelte components
    lib/              API client, types, design tokens
test/
  server/             Vitest server tests
dist/                 Production build output (gitignored)
  server.mjs          Bundled server (single file, shebang, ~97KB)
  client/             Static SPA assets
```

## Security

- **Read-only**: Me は設定の表示のみ。書き込み・変更機能はありません
- **localhost only**: サーバーは `*.localhost` にのみバインドし、外部からアクセスできません
- **Path traversal protection**: `resolveZoneDir()` が `path.normalize()` + traversal 検証を実施。`..` や絶対パスを拒否
- **Parent zone allowlist**: プロジェクトの親ディレクトリからは `CLAUDE.md` と `.mcp.json` のみ配信可能

## License

MIT
