import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../../src/client/lib/markdown';

describe('renderMarkdown', () => {
	it('見出しを <h1>/<h2> に変換する', () => {
		const html = renderMarkdown('# Title\n## Sub');
		expect(html).toContain('<h1>Title</h1>');
		expect(html).toContain('<h2>Sub</h2>');
	});

	it('箇条書きを <ul><li> に変換する', () => {
		const html = renderMarkdown('- a\n- b');
		expect(html).toContain('<ul>');
		expect(html).toContain('<li>a</li>');
	});

	it('フェンスドコードブロックを言語クラス付きで描画する', () => {
		const html = renderMarkdown('```bash\npnpm dev\n```');
		expect(html).toContain('<pre');
		expect(html).toContain('<code');
		expect(html).toContain('language-bash');
		expect(html).toContain('pnpm dev');
	});

	it('GFM テーブルを <table> に変換する', () => {
		const html = renderMarkdown('| A | B |\n|---|---|\n| 1 | 2 |');
		expect(html).toContain('<table>');
		expect(html).toContain('<th>A</th>');
		expect(html).toContain('<td>1</td>');
	});

	it('強調・インラインコード・リンクを描画する', () => {
		expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>');
		expect(renderMarkdown('`code`')).toContain('<code>code</code>');
		expect(renderMarkdown('[anthropic](https://anthropic.com)')).toContain(
			'href="https://anthropic.com"',
		);
	});

	// セキュリティ: 生 HTML はエスケープして実行させない (html: false)
	it('生の HTML タグをエスケープして実行可能にしない', () => {
		const html = renderMarkdown('<script>alert(1)</script>');
		expect(html).not.toContain('<script>');
		expect(html).toContain('&lt;script&gt;');
	});

	it('javascript: スキームのリンクを無害化する', () => {
		// 括弧なしにして markdown-it の validateLink (scheme 遮断) を実際に通す
		const html = renderMarkdown('[x](javascript:alert1)');
		expect(html).not.toContain('href="javascript:');
		expect(html).not.toContain('<a href');
	});

	it('空文字や null 相当でも例外を投げず空文字を返す', () => {
		expect(renderMarkdown('')).toBe('');
		expect(renderMarkdown(undefined as unknown as string)).toBe('');
	});
});
