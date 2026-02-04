<script lang="ts">
	import DataTable from '$lib/components/DataTable.svelte';
	import type { TreeNode } from '$lib/types';

	let { data } = $props();
	let items = $derived(((data.config.plans ?? []) as TreeNode[]).filter(f => f.type === 'file'));
</script>

<div class="animate-in">
	<h2>Plans</h2>

	<DataTable columns={['Plan Name', 'Size']} items={items} emptyText="プランがありません">
		{#snippet row(item)}
			{@const f = item as TreeNode}
			<tr class="clickable" onclick={() => { window.location.hash = `#/scope/${data.scopeId}/file/claude:plans/${f.name}`; }}>
				<td style="font-weight:500;color:var(--text)">{f.name.replace('.md', '')}</td>
				<td class="file-path">{f.size ? `${(f.size / 1024).toFixed(1)} KB` : ''}</td>
			</tr>
		{/snippet}
	</DataTable>
</div>

<style>
	h2 { font-size: 20px; font-weight: 600; margin-bottom: 24px; }
	.file-path { font-family: var(--font-code); color: var(--text-tertiary); font-size: 13px; }
	.clickable { cursor: pointer; }
	.clickable:hover { background: var(--bg); }
	.animate-in { animation: fadeIn 0.3s ease; }
	@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
