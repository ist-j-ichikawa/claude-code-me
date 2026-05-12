<script lang="ts">
	import Section from '../Section.svelte';
	import TagList from '../TagList.svelte';
	import DataTable from '../DataTable.svelte';
	import type { ScopeConfig } from '$lib/types';

	let { config }: { config: ScopeConfig } = $props();
	let sl = $derived((config.settingsLocal ?? {}) as Record<string, unknown>);
	let allowedTools = $derived((sl.allowedTools ?? []) as string[]);
	let deniedTools = $derived((sl.deniedTools ?? []) as string[]);
	let mcpServers = $derived(Object.entries((sl.enabledMcpjsonServers ?? {}) as Record<string, boolean>));
	let hasAny = $derived(allowedTools.length > 0 || deniedTools.length > 0 || mcpServers.length > 0);
</script>

<Section title="Permissions" id="permissions">
	{#if !hasAny}
		<p class="empty">settings.local.json に permissions 設定なし</p>
	{/if}
	{#if allowedTools.length > 0}
		<h4 class="allow">Allowed Tools ({allowedTools.length})</h4>
		<TagList items={allowedTools} variant="enabled" />
	{/if}
	{#if deniedTools.length > 0}
		<h4 class="deny">Denied Tools ({deniedTools.length})</h4>
		<TagList items={deniedTools} variant="denied" />
	{/if}
	{#if mcpServers.length > 0}
		<h4>MCP Servers (settings.local.json)</h4>
		<DataTable columns={['Server Name', 'Status']} items={mcpServers}>
			{#snippet row(item)}
				{@const [name, enabled] = item as [string, boolean]}
				<tr>
					<td style="font-weight:500;color:var(--text)">{name}</td>
					<td><span class="badge" class:enabled>{enabled ? 'Enabled' : 'Disabled'}</span></td>
				</tr>
			{/snippet}
		</DataTable>
	{/if}
</Section>

<style>
	h4 { font-size: 13px; font-weight: 600; margin: 16px 0 8px; color: var(--text-secondary); }
	h4:first-of-type { margin-top: 0; }
	h4.allow { color: var(--success); }
	h4.deny { color: #c53030; }
	.empty { font-size: 13px; color: var(--text-tertiary); }
	.badge { font-size: 12px; padding: 2px 8px; border-radius: 4px; background: #fde8e8; color: #c53030; }
	.badge.enabled { background: var(--success-light); color: var(--success); }
</style>
