# Changelog

Claude Code Me（目）の変更履歴。

本アプリは Claude Code 本体のバージョンに追従しており、各 catch-up で追従先バージョンを `upstream-version` と README バッジに記録する。app 独自の semver は持たないため、本 CHANGELOG は日付（JST）＋追従先 Claude Code バージョンで区切る。

形式は [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) に準拠。

## [Unreleased]

### Added

- Hooks: 全 hook タイプ（command / http / mcp_tool / prompt / agent）のフィールドを完全表示。`if` 条件や未知のフィールドも自動で表示するため、Claude Code のバージョンアップで増えたフィールドを取りこぼさない

### Changed

- ダッシュボードのコンテンツ幅を上限 1100px に統一し、CLAUDE.md 等の本文がカード幅を満たすように（ワイド画面で右側が大きく空く問題を解消）
- Settings: 一般項目をラベル / 値の縦整列リストに、「Other」の複雑な値（配列・オブジェクト）を整形済み JSON ブロックで表示
- Env セクションを Settings の直下に移動（User スコープ）
- User スコープでは冗長な "USER" バッジを非表示（Project スコープでは継承元の判別用に表示）

### Fixed

- Hooks: `if` 条件を表示し、条件だけが異なる hook が重複して見える問題を解消。timeout の単位誤表記（秒値に `ms`）を修正

### Security

- 機密値マスクの対象名を拡充（`KEY` / `PAT` / `PASSPHRASE` 等を含む名前、およびハイフン区切りのヘッダ名 `X-Api-Key` 等）。README のマスク記述を実態に合わせ「名前ベースのベストエフォート（全件保証ではない）」と明記

## 2026-06-28 — Claude Code v2.1.195 追従

### Added

- 環境変数を追加（`src/server/env-vars.ts`）:
  - `CLAUDE_CODE_DISABLE_MOUSE_CLICKS` — 全画面でマウスのクリック/ドラッグ/ホバーを無効化（ホイールスクロールは維持、2.1.195）
  - `OTEL_LOG_ASSISTANT_RESPONSES` — アシスタント応答テキストを OTel ログに含める（2.1.193）
  - `OTEL_LOG_USER_PROMPTS` — ユーザープロンプト内容を OTel ログに含める（既存ドリフトの拾い上げ）
  - `CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP` — アイドルなバックグラウンドシェルのメモリ圧迫時 reaping を無効化（2.1.193）
  - `CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT` — リモート MCP ツール呼び出しのアイドルタイムアウト override
  - `CLAUDE_CODE_RETRY_WATCHDOG` — 無人セッション向けリトライウォッチドッグ

### Changed

- `CLAUDE_CODE_MAX_RETRIES` の説明に上限引き上げ（15, 2.1.186）を注記
- hook events を公式ドキュメント（全 30 イベント）と突合し、差分なしを確認

## 2026-06-21

### Fixed

- pnpm 11 の esbuild build 承認を `pnpm-workspace.yaml` の `allowBuilds` に移行

## 2026-06-19 — Claude Code v2.1.181 追従

### Added

- Dashboard のカード/セクションを公式ドキュメント順に整列
- 長い CLAUDE.md をプレビューに折りたたみ、展開トグルを追加
- CLAUDE.md / `.md` ファイルビューを markdown レンダリング
- 可変コンテンツ幅 + prose 上限、ドラッグで可変なサイドバー（幅を localStorage に永続）
- Claude Code v2.1.181 追従（env vars / hook events）

### Changed

- Project scope は自身の `settings.json` のみ表示（user 設定とマージしない。merge/provenance を撤去）

### Fixed

- symlink された skills / commands / agents を表示・配信（単一ディレクトリ symlink mount のみ許可しリークを防止）
- Project scope の `user` file zone を `~/.claude` に解決（404 を修正）

## 2026-06-12 — Claude Code v2.1.174 追従

### Added

- Claude Code v2.1.174 追従（env vars / hook events）

## 2026-06-09 — Claude Code v2.1.168 追従

### Added

- Claude Code v2.1.168 追従（env vars / hook events）

## 2026-06-02 — Claude Code v2.1.160 追従

### Added

- Claude Code v2.1.160 追従（env vars / hook events）

## 2026-05-29

### Changed

- README の要件・セキュリティ注記を更新

### Fixed

- 設定ファイルアクセスの安全策を強化（path traversal ガード）

## 2026-05-18 — Claude Code v2.1.143 追従

### Added

- User → Project の設定継承を scope タグで可視化
- Claude Code v2.1.143 追従（env vars / hook events）

## 2026-05-12 — 初版

### Added

- 初版: `~/.claude/` を透視する読み取り専用 Web コンソール（Hono + SvelteKit、dev/prod 1 ポート統合）

### Fixed

- dev: `serveStatic` の警告を抑制し、HMR でブラウザを再オープンしないように
