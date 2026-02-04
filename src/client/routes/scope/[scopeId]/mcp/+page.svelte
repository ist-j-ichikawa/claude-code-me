<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	let { data } = $props();
	let config = $derived(data.config);
	let mcpData = $derived((config.mcpJson?.content ?? {}) as Record<string, unknown>);
	let servers = $derived(Object.entries((mcpData.mcpServers ?? {}) as Record<string, Record<string, unknown>>));
</script>

<div class="animate-in">
	<h2>MCP Servers</h2>
	<p class="file-path">{config.scope === 'project' ? '.mcp.json' : '~/.claude.json'}</p>

	<DataTable columns={['Server Name', 'Type', 'Command / URL', 'Status']} items={servers} emptyText="MCP サーバーが定義されていません">
		{#snippet row(item)}
			{@const [name, cfg] = item as [string, Record<string, unknown>]}
			{@const type = (cfg.type ?? (cfg.url ? 'sse' : 'stdio')) as string}
			{@const cmd = (cfg.command ?? cfg.url ?? '') as string}
			{@const args = ((cfg.args ?? []) as string[]).join(' ')}
			{@const envVars = cfg.env ? Object.entries(cfg.env as Record<string, unknown>) : []}
			<tr>
				<td style="font-weight:500;color:var(--text)">{name}</td>
				<td><span class="badge type">{type}</span></td>
				<td>
					<span class="file-path">{cmd}{args ? ' ' + args : ''}</span>
					{#if envVars.length > 0}
						<div class="env-vars">
							{#each envVars as [k, v]}
								<div><span class="env-key">{k}</span>=<span class="env-val">{String(v).slice(0, 20)}{String(v).length > 20 ? '...' : ''}</span></div>
							{/each}
						</div>
					{/if}
				</td>
				<td><span class="badge" class:enabled={!cfg.disabled}>{cfg.disabled ? 'Disabled' : 'Enabled'}</span></td>
			</tr>
		{/snippet}
	</DataTable>

	<Section title="Raw JSON">
		<pre class="json-view">{JSON.stringify(mcpData, null, 2)}</pre>
	</Section>
</div>

<style>
	h2 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
	.file-path { font-size: 13px; color: var(--text-tertiary); font-family: var(--font-code); margin-bottom: 24px; }
	.badge { font-size: 12px; padding: 2px 8px; border-radius: 4px; background: #fde8e8; color: #c53030; }
	.badge.enabled { background: var(--success-light); color: var(--success); }
	.badge.type { background: var(--info-light); color: var(--info); }
	.env-vars { margin-top: 4px; font-family: var(--font-code); font-size: 12px; }
	.env-key { color: var(--coral); }
	.env-val { color: var(--text-secondary); }
	.json-view { font-family: var(--font-code); font-size: 13px; color: var(--text-secondary); white-space: pre-wrap; margin: 0; }
	.animate-in { animation: fadeIn 0.3s ease; }
	@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
