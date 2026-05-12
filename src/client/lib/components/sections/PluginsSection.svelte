<script lang="ts">
	import Section from '../Section.svelte';
	import DataTable from '../DataTable.svelte';
	import type { ScopeConfig } from '$lib/types';

	let { config }: { config: ScopeConfig } = $props();
	let plugins = $derived(Object.entries(((config.settings ?? {}) as Record<string, unknown>).enabledPlugins as Record<string, boolean> ?? {}));
</script>

<Section title="Plugins" id="plugins" flat>
	<DataTable columns={['Plugin Name', 'Source', 'Status']} items={plugins} emptyText="プラグインがインストールされていません">
		{#snippet row(item)}
			{@const [fullName, enabled] = item as [string, boolean]}
			{@const parts = fullName.split('@')}
			<tr>
				<td style="font-weight:500;color:var(--text)">{parts[0]}</td>
				<td style="color:var(--text-secondary)">{parts[1] ?? 'local'}</td>
				<td><span class="badge" class:enabled>{enabled ? 'Enabled' : 'Disabled'}</span></td>
			</tr>
		{/snippet}
	</DataTable>
</Section>

<style>
	.badge { font-size: 12px; padding: 2px 8px; border-radius: 4px; background: #fde8e8; color: #c53030; }
	.badge.enabled { background: var(--success-light); color: var(--success); }
</style>
