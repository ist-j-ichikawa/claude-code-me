/**
 * A single configured hook entry (an item in a matcher group's `hooks` array).
 * Open-ended on purpose: we render known fields specially and surface the rest
 * generically, so fields added by future Claude Code versions are never
 * silently dropped. Schema: https://code.claude.com/docs/en/hooks
 */
export type HookEntry = Record<string, unknown> & { type?: string };

/**
 * Per-type "what runs" field(s). The value(s) here are shown as the entry's
 * primary line; every other key is surfaced generically by hookRestFields.
 * command → command · http → url · mcp_tool → server/tool · prompt|agent → prompt
 */
const HOOK_PRIMARY_FIELDS: Record<string, string[]> = {
  command: ["command"],
  http: ["url"],
  mcp_tool: ["server", "tool"],
  prompt: ["prompt"],
  agent: ["prompt"],
};

const HOOK_PRIMARY_FALLBACK = ["command", "url", "prompt"];

export function hookType(h: HookEntry): string {
  return typeof h.type === "string" ? h.type : "command";
}

const present = (v: unknown): boolean => v != null && v !== "";

/**
 * The keys whose values form the primary descriptor — the type's own fields if
 * any are present, else the generic fallback (so a mistyped/typeless entry still
 * shows something). Shared by hookPrimaryValue and hookRestFields so the primary
 * value is never ALSO repeated as a generic field.
 */
function primaryKeys(h: HookEntry): string[] {
  const keys = HOOK_PRIMARY_FIELDS[hookType(h)] ?? HOOK_PRIMARY_FALLBACK;
  return keys.some((k) => present(h[k])) ? keys : HOOK_PRIMARY_FALLBACK;
}

/** The hook's primary descriptor (command / url / server·tool / prompt). */
export function hookPrimaryValue(h: HookEntry): string {
  return primaryKeys(h)
    .map((k) => h[k])
    .filter(present)
    .map(String)
    .join(" · ");
}

/**
 * Every entry field not already consumed by the primary value, as label/value
 * pairs (objects JSON-stringified). This is the catch-all that keeps the view
 * field-complete across Claude Code upgrades: `if`, `timeout`, `model`,
 * `headers`, `async`, and any not-yet-known field all surface here.
 */
export function hookRestFields(h: HookEntry): [string, string][] {
  const consumed = new Set(["type", ...primaryKeys(h)]);
  return Object.entries(h)
    .filter(([k, v]) => !consumed.has(k) && present(v))
    .map(([k, v]) => [k, typeof v === "object" ? JSON.stringify(v) : String(v)] as [string, string]);
}

/** ツール名にマッチする hook の matcher 候補（PreToolUse / PostToolUse / PostToolUseFailure / PermissionRequest 共通）。 */
const TOOL_MATCHERS = ["Bash", "Write", "Edit", "Read", "Glob", "Grep", "WebFetch", "Task", "mcp__*"];

/** Hook event reference data. */
export const HOOK_EVENTS: Record<
  string,
  { desc: string; timing: string; canBlock: boolean; matchers: string[] }
> = {
  SessionStart: {
    desc: "セッション開始または再開時に発火します。",
    timing: "セッション開始時",
    canBlock: false,
    matchers: ["startup", "resume", "clear", "compact"],
  },
  Setup: {
    desc: "`claude -p --init` / `claude -p --maintenance` の print mode セッション開始前に発火します。command-type hook のみサポート。",
    timing: "print mode セットアップ時",
    canBlock: false,
    matchers: ["init", "maintenance"],
  },
  SessionEnd: {
    desc: "セッション終了時に発火します。",
    timing: "セッション終了時",
    canBlock: false,
    matchers: ["clear", "logout", "prompt_input_exit", "other"],
  },
  PreToolUse: {
    desc: "ツール実行前に発火します。ツールの実行をブロックしたり入力を変更できます。",
    timing: "ツール実行前",
    canBlock: true,
    matchers: TOOL_MATCHERS,
  },
  PostToolUse: {
    desc: "ツール実行成功後に発火します。",
    timing: "ツール成功後",
    canBlock: false,
    matchers: TOOL_MATCHERS,
  },
  PostToolUseFailure: {
    desc: "ツール実行失敗後に発火します。",
    timing: "ツール失敗後",
    canBlock: false,
    matchers: TOOL_MATCHERS,
  },
  PostToolBatch: {
    desc: "並列ツール呼び出しのバッチが完了し、次のモデル呼び出しに入る前に発火します。",
    timing: "ツールバッチ完了後",
    canBlock: true,
    matchers: [],
  },
  PermissionRequest: {
    desc: "パーミッションダイアログが表示される時に発火します。ユーザーに代わって自動承認 / 拒否が可能。",
    timing: "パーミッション要求時",
    canBlock: true,
    matchers: TOOL_MATCHERS,
  },
  UserPromptSubmit: {
    desc: "ユーザーがプロンプトを送信した時に発火します。",
    timing: "プロンプト送信時",
    canBlock: true,
    matchers: [],
  },
  UserPromptExpansion: {
    desc: "スラッシュコマンド / MCP プロンプトがプロンプトに展開される直前に発火します。特定コマンドのブロックや context 注入が可能。matcher は command_name にマッチ。",
    timing: "コマンド展開時",
    canBlock: true,
    matchers: [],
  },
  Stop: {
    desc: "Claudeの応答が完了した時に発火します。",
    timing: "応答完了時",
    canBlock: true,
    matchers: [],
  },
  SubagentStart: {
    desc: "サブエージェントが起動した時に発火します。",
    timing: "サブエージェント起動時",
    canBlock: false,
    matchers: ["Bash", "Explore", "Plan", "custom agents"],
  },
  SubagentStop: {
    desc: "サブエージェントが終了した時に発火します。",
    timing: "サブエージェント終了時",
    canBlock: true,
    matchers: ["Bash", "Explore", "Plan", "custom agents"],
  },
  Notification: {
    desc: "通知が表示される時に発火します。",
    timing: "通知表示時",
    canBlock: false,
    matchers: ["permission_prompt", "idle_prompt", "auth_success"],
  },
  MessageDisplay: {
    desc: "アシスタントのメッセージ表示時に発火します。`hookSpecificOutput.displayContent` で画面表示テキストを差し替え可能。",
    timing: "メッセージ表示時",
    canBlock: false,
    matchers: [],
  },
  PreCompact: {
    desc: "コンテキスト圧縮前に発火します。",
    timing: "コンテキスト圧縮前",
    canBlock: false,
    matchers: ["manual", "auto"],
  },
  WorktreeCreate: {
    desc: "ワークツリーが作成された時に発火します。",
    timing: "ワークツリー作成時",
    canBlock: false,
    matchers: [],
  },
  WorktreeRemove: {
    desc: "ワークツリーが削除された時に発火します。",
    timing: "ワークツリー削除時",
    canBlock: false,
    matchers: [],
  },
  TaskCompleted: {
    desc: "タスクが完了した時に発火します。",
    timing: "タスク完了時",
    canBlock: false,
    matchers: [],
  },
  ConfigChange: {
    desc: "設定が変更された時に発火します。",
    timing: "設定変更時",
    canBlock: false,
    matchers: [],
  },
  PostCompact: {
    desc: "コンテキスト圧縮完了後に発火します。",
    timing: "コンテキスト圧縮後",
    canBlock: false,
    matchers: [],
  },
  PermissionDenied: {
    desc: "auto mode のクラシファイアが拒否した後に発火します。{retry: true} で再試行可能。",
    timing: "パーミッション拒否後",
    canBlock: false,
    matchers: [],
  },
  StopFailure: {
    desc: "エラーにより停止した時に発火します。",
    timing: "エラー停止時",
    canBlock: false,
    matchers: ["rate_limit", "authentication_failed", "billing_error", "invalid_request", "server_error", "max_output_tokens", "unknown"],
  },
  InstructionsLoaded: {
    desc: "CLAUDE.md 等の指示ファイルが読み込まれた時に発火します。",
    timing: "指示読み込み時",
    canBlock: false,
    matchers: ["session_start", "nested_traversal", "path_glob_match", "include", "compact"],
  },
  Elicitation: {
    desc: "MCP サーバーからの問い合わせ（elicitation）時に発火します。",
    timing: "MCP 問い合わせ時",
    canBlock: false,
    matchers: [],
  },
  ElicitationResult: {
    desc: "MCP elicitation の結果を受信した時に発火します。",
    timing: "MCP 問い合わせ結果受信時",
    canBlock: false,
    matchers: [],
  },
  TeammateIdle: {
    desc: "チームメイト（並行エージェント）がアイドル状態になった時に発火します。",
    timing: "チームメイトアイドル時",
    canBlock: false,
    matchers: [],
  },
  TaskCreated: {
    desc: "タスクが作成された時に発火します。",
    timing: "タスク作成時",
    canBlock: false,
    matchers: [],
  },
  CwdChanged: {
    desc: "作業ディレクトリが変更された時に発火します。",
    timing: "ディレクトリ変更時",
    canBlock: false,
    matchers: [],
  },
  FileChanged: {
    desc: "監視対象ファイルがディスク上で変更された時に発火します（direnv 等の環境再読込やリビルドに有用）。matcher は正規表現ではなくファイル名リテラル（`|` 区切り）。`CLAUDE_ENV_FILE` 対応。",
    timing: "ファイル変更時",
    canBlock: false,
    matchers: [],
  },
};
