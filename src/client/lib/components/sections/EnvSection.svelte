<script lang="ts">
	import Section from '../Section.svelte';
	import DataTable from '../DataTable.svelte';

	type Entry = {
		name: string;
		description: string;
		sensitive: boolean;
		value: string;
		sources: ("shell" | "settings")[];
	};

	let { entries }: { entries: Entry[] } = $props();
</script>

<Section title="Env" id="env" flat>
	<p class="hint">
		<a href="https://code.claude.com/docs/en/env-vars" target="_blank" rel="noopener">Claude Code 環境変数</a>:
		<code>process.env</code> + <code>~/.claude/settings.json</code> の <code>env</code> をマージ
	</p>

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
</Section>

<style>
	.hint { font-size: 12px; color: var(--text-tertiary); margin-bottom: 8px; }
	.hint code { font-family: var(--font-code); font-size: 11px; padding: 1px 4px; background: var(--bg); border-radius: 3px; }
	.hint a { color: var(--coral); }
	.var-name { font-family: var(--font-code); font-size: 12px; font-weight: 500; color: var(--text); white-space: nowrap; }
	.var-value { font-family: var(--font-code); font-size: 12px; color: var(--text-secondary); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.var-value.sensitive { color: var(--text-tertiary); font-style: italic; }
	.var-desc { font-size: 12px; color: var(--text-tertiary); }
	.badge { display: inline-block; font-size: 10px; padding: 2px 6px; border-radius: 3px; margin-right: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
	.badge-shell { background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border-light); }
	.badge-settings { background: var(--coral-bg, rgba(217, 119, 87, 0.12)); color: var(--coral); border: 1px solid var(--coral); }
</style>
