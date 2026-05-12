<script lang="ts">
	import DataTable from '$lib/components/DataTable.svelte';

	type Entry = {
		name: string;
		description: string;
		sensitive: boolean;
		value: string;
		sources: ("shell" | "settings")[];
	};

	let { data } = $props();
	let entries: Entry[] = $derived(data.entries as Entry[]);
</script>

<div class="animate-in">
	<div class="header">
		<h2>Env</h2>
		<div class="hint">
			効いている <a href="https://code.claude.com/docs/en/env-vars" target="_blank" rel="noopener">Claude Code 環境変数</a>。
			<code>process.env</code> と <code>~/.claude/settings.json</code> の <code>env</code> をマージ
		</div>
	</div>

	<DataTable
		columns={['Variable', 'Value', 'Source', 'Description']}
		items={entries}
		emptyText="設定済みの Claude Code 環境変数はありません"
	>
		{#snippet row(item)}
			{@const e = item as Entry}
			<tr>
				<td class="var-name">{e.name}</td>
				<td class="var-value" class:sensitive={e.sensitive}>{e.value}</td>
				<td>
					{#each e.sources as src}
						<span class="badge badge-{src}">{src}</span>
					{/each}
				</td>
				<td class="var-desc">{e.description}</td>
			</tr>
		{/snippet}
	</DataTable>
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

	.hint a { color: var(--coral); }

	.var-name {
		font-family: var(--font-code);
		font-size: 12px;
		font-weight: 500;
		color: var(--text);
		white-space: nowrap;
	}

	.var-value {
		font-family: var(--font-code);
		font-size: 12px;
		color: var(--text-secondary);
		max-width: 280px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.var-value.sensitive {
		color: var(--text-tertiary);
		font-style: italic;
	}

	.var-desc {
		font-size: 12px;
		color: var(--text-tertiary);
	}

	.badge {
		display: inline-block;
		font-size: 10px;
		padding: 2px 6px;
		border-radius: 3px;
		margin-right: 4px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.badge-shell {
		background: var(--bg);
		color: var(--text-secondary);
		border: 1px solid var(--border-light);
	}

	.badge-settings {
		background: var(--coral-bg, rgba(217, 119, 87, 0.12));
		color: var(--coral);
		border: 1px solid var(--coral);
	}

	.animate-in { animation: fadeIn 0.3s ease; }
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
