<script lang="ts">
	import Section from '../Section.svelte';
	import DataTable from '../DataTable.svelte';
	import type { ScopeConfig, TreeNode } from '$lib/types';

	let { config, scopeId }: { config: ScopeConfig; scopeId: string } = $props();
	let items = $derived((config.memory ?? []).filter((f) => f.type === 'file'));
</script>

<Section title="Memory" id="memory" flat>
	<DataTable columns={['File', 'Size']} items={items} emptyText="メモリファイルがありません">
		{#snippet row(item)}
			{@const f = item as TreeNode}
			<tr class="clickable" onclick={() => { window.location.hash = `#/scope/${scopeId}/file/${config.scope}:memory/${f.name}`; }}>
				<td style="font-weight:500;color:var(--text)">{f.name}</td>
				<td class="file-path">{f.size ? `${(f.size / 1024).toFixed(1)} KB` : ''}</td>
			</tr>
		{/snippet}
	</DataTable>
</Section>

<style>
	.file-path { font-family: var(--font-code); color: var(--text-tertiary); font-size: 12px; }
	.clickable { cursor: pointer; }
	.clickable:hover { background: var(--bg); }
</style>
