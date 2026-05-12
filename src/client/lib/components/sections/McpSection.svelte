<script lang="ts">
	import Section from '../Section.svelte';
	import DataTable from '../DataTable.svelte';
	import type { ScopeConfig } from '$lib/types';

	let { config }: { config: ScopeConfig } = $props();
	let mcpData = $derived((config.mcpJson?.content ?? {}) as Record<string, unknown>);
	let servers = $derived(Object.entries((mcpData.mcpServers ?? {}) as Record<string, Record<string, unknown>>));
</script>

<Section title="MCP Servers" id="mcp-servers" flat>
	<DataTable columns={['Server Name', 'Type', 'Command / URL', 'Status']} items={servers} emptyText="MCP サーバーが定義されていません">
		{#snippet row(item)}
			{@const [name, cfg] = item as [string, Record<string, unknown>]}
			{@const type = (cfg.type ?? (cfg.url ? 'sse' : 'stdio')) as string}
			{@const cmd = (cfg.command ?? cfg.url ?? '') as string}
			{@const args = ((cfg.args ?? []) as string[]).join(' ')}
			<tr>
				<td style="font-weight:500;color:var(--text)">{name}</td>
				<td><span class="badge type">{type}</span></td>
				<td><span class="cmd">{cmd}{args ? ' ' + args : ''}</span></td>
				<td><span class="badge" class:enabled={!cfg.disabled}>{cfg.disabled ? 'Disabled' : 'Enabled'}</span></td>
			</tr>
		{/snippet}
	</DataTable>
</Section>

<style>
	.cmd { font-family: var(--font-code); font-size: 12px; color: var(--text-secondary); }
	.badge { font-size: 12px; padding: 2px 8px; border-radius: 4px; background: #fde8e8; color: #c53030; }
	.badge.enabled { background: var(--success-light); color: var(--success); }
	.badge.type { background: var(--info-light); color: var(--info); }
</style>
