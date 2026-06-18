import MarkdownIt from 'markdown-it';

// ~/.claude 配下の自分の設定ファイルを描画する read-only ビューア用。
// html: false で生 HTML をエスケープし (XSS 防止)、危険な link scheme は
// markdown-it のデフォルト validateLink が遮断する。GFM テーブル / コード
// フェンス / strikethrough は標準で有効。DOM 非依存なので node 環境のまま
// 単体テストできる。
const md = new MarkdownIt({ html: false, linkify: true });

/** Markdown ソースをサニタイズ済み HTML 文字列に変換する。 */
export function renderMarkdown(src: string): string {
	if (!src) return '';
	return md.render(src);
}
