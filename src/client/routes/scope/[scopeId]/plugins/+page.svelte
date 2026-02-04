<script lang="ts">
	import DataTable from '$lib/components/DataTable.svelte';

	let { data } = $props();
	let plugins = $derived(Object.entries(((data.config.settings ?? {}) as Record<string, unknown>).enabledPlugins as Record<string, boolean> ?? {}));
</script>

<div class="animate-in">
	<h2>Plugins</h2>

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
</div>

<style>
	h2 { font-size: 20px; font-weight: 600; margin-bottom: 24px; }
	.badge { font-size: 12px; padding: 2px 8px; border-radius: 4px; background: #fde8e8; color: #c53030; }
	.badge.enabled { background: var(--success-light); color: var(--success); }
	.animate-in { animation: fadeIn 0.3s ease; }
	@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
