<script lang="ts">
	import Section from '../Section.svelte';

	type Entry = { display: string; timestamp: number; project: string };

	let { entries }: { entries: Entry[] } = $props();

	let query = $state('');
	let projectFilter = $state('');
	let dedup = $state(true);

	let projects = $derived(
		Array.from(new Set(entries.map((e) => e.project).filter(Boolean))).sort(),
	);

	let filtered = $derived(
		entries.filter((e) => {
			if (projectFilter && e.project !== projectFilter) return false;
			if (query && !e.display.toLowerCase().includes(query.toLowerCase())) return false;
			return true;
		}),
	);

	let displayed = $derived.by(() => {
		if (!dedup) return filtered;
		const out: Entry[] = [];
		let prev = '';
		for (const e of filtered) {
			if (e.display !== prev) out.push(e);
			prev = e.display;
		}
		return out;
	});

	function fmt(ts: number): string {
		const d = new Date(ts);
		return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
	}

	function shortProject(p: string): string {
		if (!p) return '';
		const parts = p.split('/').filter(Boolean);
		return parts[parts.length - 1] ?? p;
	}
</script>

<Section title="History" id="history" flat>
	<p class="hint">
		プロンプト履歴 (<code>~/.claude/history.jsonl</code>) — 最新 {entries.length} 件
	</p>

	<div class="filters">
		<input
			type="text"
			class="search"
			placeholder="プロンプトを検索…"
			bind:value={query}
		/>
		<select class="project-select" bind:value={projectFilter}>
			<option value="">all projects ({projects.length})</option>
			{#each projects as p}
				<option value={p}>{shortProject(p)}</option>
			{/each}
		</select>
		<label class="toggle">
			<input type="checkbox" bind:checked={dedup} />
			連続重複を圧縮
		</label>
	</div>

	{#if displayed.length === 0}
		<div class="empty">マッチするプロンプトはありません</div>
	{:else}
		<div class="result-count">{displayed.length} 件</div>
		<div class="history-list">
			{#each displayed as e}
				<div class="entry">
					<span class="ts">{fmt(e.timestamp)}</span>
					<span class="project" title={e.project}>{shortProject(e.project)}</span>
					<span class="display">{e.display}</span>
				</div>
			{/each}
		</div>
	{/if}
</Section>

<style>
	.hint { font-size: 12px; color: var(--text-tertiary); margin-bottom: 8px; }
	.hint code { font-family: var(--font-code); font-size: 11px; padding: 1px 4px; background: var(--bg); border-radius: 3px; }

	.filters {
		display: flex;
		gap: 8px;
		margin-bottom: 8px;
		flex-wrap: wrap;
		align-items: center;
	}

	.search {
		flex: 1;
		min-width: 200px;
		padding: 6px 8px;
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 13px;
		background: var(--bg-card);
		color: var(--text);
		outline: none;
	}
	.search:focus { border-color: var(--coral); }

	.project-select {
		padding: 6px 8px;
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 12px;
		background: var(--bg-card);
		color: var(--text);
		outline: none;
		max-width: 200px;
	}

	.toggle {
		font-size: 12px;
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		gap: 4px;
		cursor: pointer;
	}

	.result-count {
		font-size: 11px;
		color: var(--text-tertiary);
		margin-bottom: 6px;
	}

	.history-list {
		max-height: 400px;
		overflow-y: auto;
		border: 1px solid var(--border-light);
		border-radius: 6px;
		background: var(--bg-card);
	}

	.entry {
		display: grid;
		grid-template-columns: 90px 140px 1fr;
		gap: 12px;
		padding: 6px 12px;
		font-size: 12px;
		border-bottom: 1px solid var(--border-light);
		align-items: baseline;
	}
	.entry:last-child { border-bottom: none; }
	.entry:hover { background: var(--bg); }

	.ts { color: var(--text-tertiary); font-family: var(--font-code); }
	.project {
		color: var(--coral);
		font-family: var(--font-code);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.display {
		color: var(--text);
		font-family: var(--font-code);
		white-space: pre-wrap;
		word-break: break-word;
	}

	.empty {
		padding: 20px;
		text-align: center;
		color: var(--text-tertiary);
		font-size: 13px;
		border: 1px dashed var(--border-light);
		border-radius: 6px;
	}
</style>
