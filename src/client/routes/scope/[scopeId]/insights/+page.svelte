<script lang="ts">
	import { onMount } from 'svelte';

	let html = $state<string | null>(null);
	let error = $state<string | null>(null);

	onMount(async () => {
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
	});
</script>

<div class="animate-in">
	<div class="header">
		<h2>Insights</h2>
		<div class="hint">
			<code>/insights</code> の出力 (<code>~/.claude/usage-data/report.html</code>)
		</div>
	</div>

	{#if html !== null}
		<iframe srcdoc={html} title="Claude Code Insights" class="report-frame" sandbox="allow-same-origin allow-scripts"></iframe>
	{:else if error !== null}
		<div class="empty">{error}</div>
	{:else}
		<div class="empty">Loading...</div>
	{/if}
</div>

<style>
	.header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 16px;
		gap: 16px;
		flex-wrap: wrap;
	}

	h2 { font-size: 20px; font-weight: 600; }

	.hint {
		font-size: 12px;
		color: var(--text-tertiary);
	}

	.hint code {
		font-family: var(--font-code);
		font-size: 11px;
		padding: 1px 4px;
		background: var(--bg);
		border-radius: 3px;
	}

	.report-frame {
		width: 100%;
		height: calc(100vh - 140px);
		min-height: 600px;
		border: 1px solid var(--border-light);
		border-radius: 8px;
		background: #fff;
	}

	.empty {
		padding: 32px;
		text-align: center;
		color: var(--text-tertiary);
		border: 1px dashed var(--border-light);
		border-radius: 8px;
	}

	.animate-in { animation: fadeIn 0.3s ease; }
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
