/**
 * Claude Code が読む環境変数の公式リスト。
 * Source: https://code.claude.com/docs/en/env-vars
 *
 * sensitive = true: API キー / トークン / パスフレーズ / 認証ファイルパス。値は表示せずマスクする。
 */
export interface EnvVarDef {
  name: string;
  description: string;
  sensitive?: boolean;
}

export const CLAUDE_CODE_ENV_VARS: readonly EnvVarDef[] = [
  // --- API authentication ---
  { name: "ANTHROPIC_API_KEY", description: "API キー (X-Api-Key)", sensitive: true },
  { name: "ANTHROPIC_AUTH_TOKEN", description: "Authorization ヘッダー (Bearer)", sensitive: true },
  { name: "ANTHROPIC_FOUNDRY_API_KEY", description: "Microsoft Foundry API キー", sensitive: true },
  { name: "AWS_BEARER_TOKEN_BEDROCK", description: "Bedrock API キー", sensitive: true },
  { name: "CLAUDE_CODE_CLIENT_KEY_PASSPHRASE", description: "クライアント秘密鍵パスフレーズ", sensitive: true },
  { name: "CLAUDE_CODE_OAUTH_REFRESH_TOKEN", description: "OAuth リフレッシュトークン", sensitive: true },
  { name: "CLAUDE_CODE_OAUTH_TOKEN", description: "OAuth アクセストークン", sensitive: true },
  { name: "GOOGLE_APPLICATION_CREDENTIALS", description: "GCP 認証情報ファイルパス", sensitive: true },

  // --- Endpoints / proxies ---
  { name: "ANTHROPIC_BASE_URL", description: "API エンドポイント" },
  { name: "ANTHROPIC_BEDROCK_BASE_URL", description: "Bedrock エンドポイント URL" },
  { name: "ANTHROPIC_BEDROCK_MANTLE_BASE_URL", description: "Bedrock Mantle エンドポイント URL" },
  { name: "ANTHROPIC_FOUNDRY_BASE_URL", description: "Foundry リソースベース URL" },
  { name: "ANTHROPIC_VERTEX_BASE_URL", description: "Vertex AI エンドポイント URL" },
  { name: "ANTHROPIC_CUSTOM_HEADERS", description: "カスタムヘッダー (Name: Value)" },

  // --- Service tier / Bedrock / Foundry / Vertex ---
  { name: "ANTHROPIC_BEDROCK_SERVICE_TIER", description: "Bedrock サービスティア (default/flex/priority)" },
  { name: "ANTHROPIC_BETAS", description: "anthropic-beta ヘッダー値" },
  { name: "ANTHROPIC_FOUNDRY_RESOURCE", description: "Foundry リソース名" },
  { name: "ANTHROPIC_VERTEX_PROJECT_ID", description: "GCP プロジェクト ID" },
  { name: "ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION", description: "Haiku モデル AWS リージョン" },
  { name: "AWS_REGION", description: "Bedrock リージョン (未設定時の ~/.aws config 参照は 2.1.172+)" },
  { name: "ANTHROPIC_WORKSPACE_ID", description: "workload identity federation 用 workspace スコープ (2.1.141+)" },
  { name: "GCLOUD_PROJECT", description: "GCP プロジェクト ID (Vertex)" },
  { name: "GOOGLE_CLOUD_PROJECT", description: "GCP プロジェクト ID (Vertex 代替)" },

  // --- Model selection ---
  { name: "ANTHROPIC_MODEL", description: "使用するモデル設定名" },
  { name: "ANTHROPIC_SMALL_FAST_MODEL", description: "Haiku クラスモデル ID (非推奨)" },
  { name: "ANTHROPIC_DEFAULT_HAIKU_MODEL", description: "デフォルト Haiku モデル ID" },
  { name: "ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME", description: "Haiku モデル表示名" },
  { name: "ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION", description: "Haiku モデル説明" },
  { name: "ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES", description: "Haiku 対応機能" },
  { name: "CLAUDE_CODE_OPUS_4_6_FAST_MODE_OVERRIDE", description: "Fast mode を Opus 4.6 にピン留め (2.1.160 で削除、現在は no-op)" },
  { name: "ANTHROPIC_DEFAULT_OPUS_MODEL", description: "デフォルト Opus モデル ID" },
  { name: "ANTHROPIC_DEFAULT_OPUS_MODEL_NAME", description: "Opus モデル表示名" },
  { name: "ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION", description: "Opus モデル説明" },
  { name: "ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES", description: "Opus 対応機能" },
  { name: "ANTHROPIC_DEFAULT_SONNET_MODEL", description: "デフォルト Sonnet モデル ID" },
  { name: "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME", description: "Sonnet モデル表示名" },
  { name: "ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION", description: "Sonnet モデル説明" },
  { name: "ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES", description: "Sonnet 対応機能" },
  { name: "ANTHROPIC_CUSTOM_MODEL_OPTION", description: "カスタムモデル ID" },
  { name: "ANTHROPIC_CUSTOM_MODEL_OPTION_NAME", description: "カスタムモデル表示名" },
  { name: "ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION", description: "カスタムモデル説明" },
  { name: "ANTHROPIC_CUSTOM_MODEL_OPTION_SUPPORTED_CAPABILITIES", description: "カスタムモデル対応機能" },
  { name: "CLAUDE_CODE_SUBAGENT_MODEL", description: "サブエージェント用モデル ID" },

  // --- Timeouts / limits ---
  { name: "API_TIMEOUT_MS", description: "API リクエストタイムアウト (ms, default 600000)" },
  { name: "BASH_DEFAULT_TIMEOUT_MS", description: "Bash デフォルトタイムアウト (default 120000)" },
  { name: "BASH_MAX_TIMEOUT_MS", description: "Bash 最大タイムアウト (default 600000)" },
  { name: "BASH_MAX_OUTPUT_LENGTH", description: "Bash 出力最大文字数" },
  { name: "CLAUDE_ASYNC_AGENT_STALL_TIMEOUT_MS", description: "バックグラウンドサブエージェントタイムアウト" },
  { name: "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE", description: "自動圧縮トリガー割合 (1-100, default 95)" },
  { name: "CLAUDE_CODE_API_KEY_HELPER_TTL_MS", description: "API キーヘルパー資格情報更新間隔" },
  { name: "CLAUDE_CODE_AUTO_COMPACT_WINDOW", description: "自動圧縮用コンテキスト容量 (tokens)" },
  { name: "CLAUDE_CODE_EXIT_AFTER_STOP_DELAY", description: "アイドル後の自動終了遅延 (ms)" },
  { name: "CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS", description: "ファイル読み込みトークン制限" },
  { name: "CLAUDE_CODE_GLOB_TIMEOUT_SECONDS", description: "Glob ツールタイムアウト (秒)" },
  { name: "CLAUDE_CODE_MAX_CONTEXT_TOKENS", description: "コンテキストウィンドウサイズ上書き" },
  { name: "CLAUDE_CODE_MAX_OUTPUT_TOKENS", description: "最大出力トークン数" },
  { name: "CLAUDE_CODE_MAX_RETRIES", description: "API リクエスト最大リトライ回数 (default 10、上限は 2.1.186+ で 15)" },
  { name: "CLAUDE_CODE_RETRY_WATCHDOG", description: "無人セッション向けリトライウォッチドッグ (2.1.186 で CLAUDE_CODE_MAX_RETRIES の代替として案内)" },
  { name: "CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY", description: "ツール最大並列実行数 (default 10)" },
  { name: "CLAUDE_CODE_OTEL_FLUSH_TIMEOUT_MS", description: "OpenTelemetry フラッシュタイムアウト" },
  { name: "CLAUDE_CODE_OTEL_HEADERS_HELPER_DEBOUNCE_MS", description: "OTel ヘッダーリフレッシュ間隔" },
  { name: "CLAUDE_CODE_OTEL_SHUTDOWN_TIMEOUT_MS", description: "OTel シャットダウンタイムアウト" },
  { name: "CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS", description: "プラグイン git 操作タイムアウト" },
  { name: "CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS", description: "SessionEnd フック時間予算 (default 1500)" },
  { name: "CLAUDE_CODE_STOP_HOOK_BLOCK_CAP", description: "Stop フックの連続ブロック上限 (default 8、2.1.143+)" },
  { name: "MAX_THINKING_TOKENS", description: "拡張思考最大トークン数" },
  { name: "API_FORCE_IDLE_TIMEOUT", description: "ストリーミング応答の 5分アイドルタイムアウト上書き (=0 で無効化、2.1.169+)" },

  // --- Display / UI / accessibility ---
  { name: "CLAUDE_CODE_ACCESSIBILITY", description: "アクセシビリティモード (カーソル表示)" },
  { name: "CLAUDE_CODE_DISABLE_ALTERNATE_SCREEN", description: "全画面レンダリング無効化" },
  { name: "CLAUDE_CODE_DISABLE_MOUSE", description: "マウストラッキング無効化" },
  { name: "CLAUDE_CODE_DISABLE_MOUSE_CLICKS", description: "全画面モードでマウスのクリック/ドラッグ/ホバーを無効化 (ホイールスクロールは維持、2.1.195+)" },
  { name: "CLAUDE_CODE_DISABLE_TERMINAL_TITLE", description: "ターミナルタイトル更新無効化" },
  { name: "CLAUDE_CODE_DISABLE_VIRTUAL_SCROLL", description: "仮想スクロール無効化" },
  { name: "CLAUDE_CODE_HIDE_CWD", description: "スタートアップロゴの作業ディレクトリ非表示" },
  { name: "CLAUDE_CODE_NO_FLICKER", description: "全画面レンダリング有効化" },
  { name: "CLAUDE_CODE_SCROLL_SPEED", description: "マウスホイールスクロール速度倍率 (1-20)" },
  { name: "CLAUDE_CODE_FORCE_SYNC_OUTPUT", description: "同期出力強制有効化" },

  // --- Telemetry / privacy ---
  { name: "CLAUDE_CODE_ENABLE_TELEMETRY", description: "OpenTelemetry 有効化" },
  { name: "DISABLE_TELEMETRY", description: "テレメトリ無効化" },
  { name: "DISABLE_ERROR_REPORTING", description: "エラーレポート無効化" },
  { name: "DISABLE_FEEDBACK_COMMAND", description: "フィードバックコマンド無効化" },
  { name: "CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY", description: "フィードバック調査無効化" },
  { name: "CLAUDE_CODE_ENABLE_FEEDBACK_SURVEY_FOR_OTEL", description: "OTel 経由のフィードバック調査を再有効化 (2.1.136+)" },
  { name: "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC", description: "非必須トラフィック無効化" },
  { name: "DISABLE_AUTOUPDATER", description: "自動更新機能無効化" },
  { name: "DISABLE_UPDATES", description: "全ての update path をブロック (manual `claude update` 含む、2.1.135+)" },
  { name: "OTEL_LOG_RAW_API_BODIES", description: "API リクエスト/レスポンスボディを OTel ログとして出力" },
  { name: "OTEL_LOG_TOOL_DETAILS", description: "tool_decision テレメトリに tool_parameters (bash コマンド、MCP/skill 名) を含める (2.1.157+)" },
  { name: "OTEL_LOG_USER_PROMPTS", description: "ユーザープロンプト内容を OTel ログ (user_prompt イベント) に含める" },
  { name: "OTEL_LOG_ASSISTANT_RESPONSES", description: "アシスタント応答テキストを OTel ログ (assistant_response イベント) に含める。未設定時は OTEL_LOG_USER_PROMPTS に従う (2.1.193+)" },
  { name: "OTEL_METRICS_INCLUDE_ENTRYPOINT", description: "session entrypoint を OTel メトリクス属性 (app.entrypoint) に追加 (2.1.152+)" },
  { name: "OTEL_RESOURCE_ATTRIBUTES", description: "OTel リソース属性をメトリクスのラベルに付与 (team/repo 等でスライス、ラベル付与は 2.1.161+)" },

  // --- Features / behaviors (disable) ---
  { name: "CLAUDE_CODE_DISABLE_1M_CONTEXT", description: "1M コンテキスト無効化" },
  { name: "CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING", description: "適応型推論無効化" },
  { name: "CLAUDE_CODE_DISABLE_ATTACHMENTS", description: "ファイル添付処理無効化" },
  { name: "CLAUDE_CODE_DISABLE_AUTO_MEMORY", description: "オートメモリ無効化" },
  { name: "CLAUDE_CODE_DISABLE_BACKGROUND_TASKS", description: "バックグラウンドタスク無効化" },
  { name: "CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP", description: "アイドルなバックグラウンドシェルコマンドのメモリ圧迫時自動 reaping を無効化 (=1、2.1.193+)" },
  { name: "CLAUDE_CODE_DISABLE_CLAUDE_MDS", description: "CLAUDE.md メモリファイル無効化" },
  { name: "CLAUDE_CODE_DISABLE_CRON", description: "スケジュール済みタスク無効化" },
  { name: "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS", description: "実験的ベータ無効化" },
  { name: "CLAUDE_CODE_DISABLE_FAST_MODE", description: "ファストモード無効化" },
  { name: "CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING", description: "ファイルチェックポイント無効化" },
  { name: "CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS", description: "git 指示無効化" },
  { name: "CLAUDE_CODE_DISABLE_LEGACY_MODEL_REMAP", description: "Opus 4.0/4.1 自動リマップ無効化" },
  { name: "CLAUDE_CODE_DISABLE_NONSTREAMING_FALLBACK", description: "非ストリーミングフォールバック無効化" },
  { name: "CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL", description: "公式マーケットプレイス自動インストール無効化" },
  { name: "CLAUDE_CODE_DISABLE_POLICY_SKILLS", description: "ポリシースキル読み込み無効化" },
  { name: "CLAUDE_CODE_DISABLE_THINKING", description: "拡張思考無効化" },
  { name: "CLAUDE_CODE_DISABLE_BUNDLED_SKILLS", description: "バンドル skill / workflow / built-in slash command をモデルから隠す (2.1.169+)" },
  { name: "CLAUDE_CODE_SAFE_MODE", description: "全カスタマイズ (CLAUDE.md / plugins / skills / hooks / MCP) を無効化して起動 (--safe-mode 相当、トラブルシュート用、2.1.169+)" },

  // --- Features / behaviors (enable) ---
  { name: "CLAUDE_CODE_ENABLE_AWAY_SUMMARY", description: "セッション要約有効化" },
  { name: "CLAUDE_CODE_ENABLE_BACKGROUND_PLUGIN_REFRESH", description: "バックグラウンドプラグイン更新" },
  { name: "CLAUDE_CODE_ENABLE_FINE_GRAINED_TOOL_STREAMING", description: "ツール入力ストリーミング" },
  { name: "CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY", description: "ゲートウェイモデル検出" },
  { name: "CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION", description: "プロンプト提案" },
  { name: "CLAUDE_CODE_ENABLE_TASKS", description: "タスク追跡システム有効化" },
  { name: "CLAUDE_CODE_ENABLE_AUTO_MODE", description: "Bedrock/Vertex/Foundry で auto mode 有効化 (Opus 4.7/4.8、2.1.158+)" },
  { name: "CLAUDE_CODE_ATTRIBUTION_HEADER", description: "システムプロンプト属性ブロック表示" },
  { name: "CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD", description: "追加ディレクトリから CLAUDE.md 読み込み" },
  { name: "CLAUDE_MEMORY_STORES", description: "マウントするチームメモリストア (remote セッション対応は 2.1.172+)" },
  { name: "CLAUDE_CODE_AUTO_CONNECT_IDE", description: "IDE 自動接続" },
  { name: "CLAUDE_AUTO_BACKGROUND_TASKS", description: "長時間実行タスク自動バックグラウンド化" },
  { name: "CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR", description: "Bash コマンド後に作業ディレクトリ復帰" },
  { name: "CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS", description: "ビルトインサブエージェント無効化" },
  { name: "CLAUDE_AGENT_SDK_MCP_NO_PREFIX", description: "MCP ツール名プレフィックス削除" },
  { name: "CLAUDE_CODE_RESUME_INTERRUPTED_TURN", description: "中断ターン自動再開" },
  { name: "CLAUDE_CODE_SIMPLE", description: "ミニマルシステムプロンプト" },
  { name: "CLAUDE_CODE_SIMPLE_SYSTEM_PROMPT", description: "短縮システムプロンプト (Opus 4.7)" },
  { name: "CLAUDE_CODE_FORK_SUBAGENT", description: "フォークサブエージェント有効化" },
  { name: "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS", description: "エージェントチーム有効化" },
  { name: "CLAUDE_CODE_PERFORCE_MODE", description: "Perforce 対応書き込み保護" },
  { name: "CLAUDE_CODE_PROXY_RESOLVES_HOSTS", description: "プロキシ DNS 解決許可" },
  { name: "CLAUDE_CODE_SUBPROCESS_ENV_SCRUB", description: "サブプロセス環境資格情報削除" },
  { name: "CLAUDE_CODE_MCP_ALLOWLIST_ENV", description: "MCP サーバー環境許可リスト" },
  { name: "CLAUDE_CODE_NEW_INIT", description: "/init インタラクティブセットアップ" },
  { name: "CLAUDE_CODE_GLOB_HIDDEN", description: "Glob ツールのドットファイル含除" },
  { name: "CLAUDE_CODE_GLOB_NO_IGNORE", description: "Glob ツール .gitignore 尊重" },

  // --- Effort / context ---
  { name: "CLAUDE_CODE_EFFORT_LEVEL", description: "努力レベル (low/medium/high/xhigh/max/auto)" },
  { name: "CLAUDE_CODE_ALWAYS_ENABLE_EFFORT", description: "明示設定がなくても effort パラメータを常に送信" },
  { name: "CLAUDE_CODE_EXTRA_BODY", description: "API リクエストボディ追加 JSON" },

  // --- Auth bypass / skip ---
  { name: "CLAUDE_CODE_SKIP_BEDROCK_AUTH", description: "Bedrock 認証スキップ" },
  { name: "CLAUDE_CODE_SKIP_FOUNDRY_AUTH", description: "Foundry 認証スキップ" },
  { name: "CLAUDE_CODE_SKIP_MANTLE_AUTH", description: "Mantle 認証スキップ" },
  { name: "CLAUDE_CODE_SKIP_VERTEX_AUTH", description: "Vertex 認証スキップ" },
  { name: "CLAUDE_CODE_SKIP_PROMPT_HISTORY", description: "プロンプト履歴書き込みスキップ" },

  // --- mTLS / certs ---
  { name: "CLAUDE_CODE_CERT_STORE", description: "CA 証明書ソース (bundled/system)" },
  { name: "CLAUDE_CODE_CLIENT_CERT", description: "mTLS クライアント証明書ファイルパス" },
  { name: "CLAUDE_CODE_CLIENT_KEY", description: "mTLS クライアント秘密鍵ファイルパス" },

  // --- IDE / shell / paths ---
  { name: "CLAUDE_CODE_IDE_HOST_OVERRIDE", description: "IDE 接続ホストアドレス上書き" },
  { name: "CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL", description: "IDE 拡張機能自動インストール無効化" },
  { name: "CLAUDE_CODE_IDE_SKIP_VALID_CHECK", description: "IDE ロックファイル検証スキップ" },
  { name: "CLAUDE_CODE_GIT_BASH_PATH", description: "Git Bash 実行ファイルパス (Windows)" },
  { name: "CLAUDE_CODE_SHELL", description: "シェル自動検出上書き" },
  { name: "CLAUDE_CODE_SHELL_PREFIX", description: "シェルコマンドプレフィックス (ロギング用)" },
  { name: "CLAUDE_CODE_USE_POWERSHELL_TOOL", description: "PowerShell ツール有効化 (Windows は 2.1.143+ で Bedrock/Vertex/Foundry default 有効、`=0` で opt-out)" },
  { name: "CLAUDE_CODE_POWERSHELL_RESPECT_EXECUTION_POLICY", description: "PowerShell ツールの `-ExecutionPolicy Bypass` opt-out (2.1.143+)" },
  { name: "CLAUDE_CLIENT_PRESENCE_FILE", description: "在席マーカーファイルのパス。指定するとマシン操作中はモバイルプッシュ通知を抑制 (2.1.181+)" },
  { name: "CLAUDE_CONFIG_DIR", description: "Claude 設定ディレクトリ override (default: ~/.claude/)" },
  { name: "CLAUDE_ENV_FILE", description: "SessionStart hook が読み込む環境変数定義ファイル" },
  { name: "CLAUDE_EFFORT", description: "Bash tool 内で参照可能な effort level (skill 内では ${CLAUDE_EFFORT})" },

  // --- Plugins ---
  { name: "CLAUDE_CODE_PACKAGE_MANAGER_AUTO_UPDATE", description: "パッケージマネージャー自動更新" },
  { name: "CLAUDE_CODE_PLUGIN_CACHE_DIR", description: "プラグインルートディレクトリパス" },
  { name: "CLAUDE_CODE_PLUGIN_KEEP_MARKETPLACE_ON_FAILURE", description: "マーケットプレイス失敗時キャッシュ保持" },
  { name: "CLAUDE_CODE_PLUGIN_PREFER_HTTPS", description: "GitHub プラグインを SSH ではなく HTTPS でクローン (2.1.141+)" },
  { name: "CLAUDE_CODE_PLUGIN_SEED_DIR", description: "プラグインシードディレクトリパス" },
  { name: "CLAUDE_CODE_SYNC_PLUGIN_INSTALL", description: "プラグインインストール同期" },

  // --- OAuth scopes ---
  { name: "CLAUDE_CODE_OAUTH_SCOPES", description: "OAuth スコープ (スペース区切り)" },

  // --- Debug / logging ---
  { name: "CLAUDE_CODE_DEBUG_LOGS_DIR", description: "デバッグログファイルパス" },
  { name: "CLAUDE_CODE_DEBUG_LOG_LEVEL", description: "デバッグログレベル (verbose/debug/info/warn/error)" },

  // --- Caps / scripts ---
  { name: "CLAUDE_CODE_SCRIPT_CAPS", description: "スクリプト呼び出し制限 (JSON)" },

  // --- Provider / remote ---
  { name: "CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST", description: "ホスト管理プロバイダルーティング" },
  { name: "CLAUDE_CODE_REMOTE", description: "クラウドセッション自動設定フラグ" },
  { name: "CLAUDE_CODE_REMOTE_SESSION_ID", description: "リモートセッション ID" },
  { name: "CLAUDE_JOB_DIR", description: "バックグラウンドセッションの一時ファイルディレクトリ" },
  { name: "CLAUDE_CODE_TMPDIR", description: "Claude Code 専用一時ディレクトリ ($TMPDIR override、Unix socket / session-env 等に使用)" },
  { name: "CLAUDE_CODE_SESSION_ID", description: "セッション ID (プロセス用)" },
  { name: "CLAUDECODE", description: "Claude Code 内シェル環境判定フラグ" },
  { name: "CCR_FORCE_BUNDLE", description: "リモートモード時に強制バンドル" },

  // --- MCP ---
  { name: "ENABLE_TOOL_SEARCH", description: "MCP ツール検索有効化" },
  { name: "MCP_TOOL_TIMEOUT", description: "MCP ツール呼び出しのタイムアウト (ms、per-server timeout 未設定時のフォールバック)" },
  { name: "CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT", description: "リモート MCP ツール呼び出しのアイドルタイムアウト override (応答なしで abort する挙動は 2.1.187+)" },
];

// Name-based heuristic (best-effort, not exhaustive): masks segment-delimited
// secret-ish tokens. Bare KEY subsumes API_KEY/ACCESS_KEY/SESSION_KEY etc.;
// erring toward over-masking (e.g. CACHE_KEY) is preferred to leaking a value.
const SENSITIVE_ENV_NAME_PATTERN =
  /(^|_)(KEY|API_?KEY|TOKEN|SECRET|PASSWORD|PASSWD|PASSPHRASE|CREDENTIALS?|PRIVATE_?KEY|CLIENT_?KEY|PAT|CERT|COOKIE|AUTHORIZATION)($|_)/i;

export function isSensitiveEnvVarName(name: string): boolean {
  // Normalize hyphen-delimited names to underscore so HTTP header keys like
  // `X-Api-Key` / `X-Auth-Token` (hooks `headers`) match the same heuristic.
  const normalized = name.replace(/-/g, "_");
  return (
    CLAUDE_CODE_ENV_VARS.some((def) => def.name === name && def.sensitive) ||
    SENSITIVE_ENV_NAME_PATTERN.test(normalized)
  );
}
