<script lang="ts">
	import Section from '../Section.svelte';

	let html = $state<string | null>(null);
	let error = $state<string | null>(null);
	let expanded = $state(false);

	async function load() {
		try {
			const res = await fetch('/api/insights');
			if (!res.ok) {
				error = await res.text();
				return;
			}
			html = await res.text();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	function toggle() {
		expanded = !expanded;
		if (expanded && html === null && error === null) load();
	}
</script>

<Section title="Insights" id="insights" flat>
	<button class="toggle" onclick={toggle}>
		<span class="arrow" class:open={expanded}>&#x25B6;</span>
		<span>{expanded ? 'Hide' : 'Show'} <code>/insights</code> report (~/.claude/usage-data/report.html)</span>
	</button>

	{#if expanded}
		{#if html !== null}
			<iframe srcdoc={html} title="Claude Code Insights" class="report-frame" sandbox="allow-same-origin allow-scripts"></iframe>
		{:else if error !== null}
			<div class="empty">{error}</div>
		{:else}
			<div class="empty">Loading…</div>
		{/if}
	{/if}
</Section>

<style>
	.toggle {
		all: unset;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--text-secondary);
	}
	.toggle:hover { color: var(--text); }
	.toggle code { font-family: var(--font-code); font-size: 11px; padding: 1px 4px; background: var(--bg); border-radius: 3px; }
	.arrow { font-size: 10px; transition: transform 0.2s; }
	.arrow.open { transform: rotate(90deg); }
	.report-frame {
		width: 100%;
		height: 70vh;
		min-height: 500px;
		border: 1px solid var(--border-light);
		border-radius: 6px;
		background: #fff;
		margin-top: 12px;
	}
	.empty { padding: 24px; text-align: center; color: var(--text-tertiary); border: 1px dashed var(--border-light); border-radius: 6px; margin-top: 12px; }
</style>
