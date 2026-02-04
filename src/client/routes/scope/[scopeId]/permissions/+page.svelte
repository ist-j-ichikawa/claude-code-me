<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import TagList from '$lib/components/TagList.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	let { data } = $props();
	let sl = $derived((data.config.settingsLocal ?? {}) as Record<string, unknown>);
	let allowedTools = $derived((sl.allowedTools ?? []) as string[]);
	let deniedTools = $derived((sl.deniedTools ?? []) as string[]);
	let mcpServers = $derived(Object.entries((sl.enabledMcpjsonServers ?? {}) as Record<string, boolean>));
</script>

<div class="animate-in">
	<h2>Permissions</h2>
	<p class="file-path">settings.local.json</p>

	{#if allowedTools.length > 0}
		<Section title="Allowed Tools ({allowedTools.length})">
			<TagList items={allowedTools} variant="enabled" />
		</Section>
	{/if}

	{#if deniedTools.length > 0}
		<Section title="Denied Tools ({deniedTools.length})">
			<TagList items={deniedTools} variant="denied" />
		</Section>
	{/if}

	{#if mcpServers.length > 0}
		<Section title="MCP Servers">
			<DataTable columns={['Server Name', 'Status']} items={mcpServers}>
				{#snippet row(item)}
					{@const [name, enabled] = item as [string, boolean]}
					<tr>
						<td style="font-weight:500;color:var(--text)">{name}</td>
						<td><span class="badge" class:enabled>{enabled ? 'Enabled' : 'Disabled'}</span></td>
					</tr>
				{/snippet}
			</DataTable>
		</Section>
	{/if}

	<Section title="Raw JSON">
		<pre class="json-view">{JSON.stringify(sl, null, 2)}</pre>
	</Section>
</div>

<style>
	h2 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
	.file-path { font-size: 13px; color: var(--text-tertiary); font-family: var(--font-code); margin-bottom: 24px; }
	.badge { font-size: 12px; padding: 2px 8px; border-radius: 4px; background: #fde8e8; color: #c53030; }
	.badge.enabled { background: var(--success-light); color: var(--success); }
	.json-view { font-family: var(--font-code); font-size: 13px; color: var(--text-secondary); white-space: pre-wrap; margin: 0; }
	.animate-in { animation: fadeIn 0.3s ease; }
	@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
