<script lang="ts">
	import Section from '../Section.svelte';
	import DataTable from '../DataTable.svelte';
	import type { ScopeConfig, TreeNode } from '$lib/types';

	let { config, scopeId }: { config: ScopeConfig; scopeId: string } = $props();
	let items = $derived((config.rules ?? []).filter((f) => f.type === 'file'));
	let zone = $derived(config.projectClaudeDir ? 'projectClaude' : 'claude');
</script>

<Section title="Rules" id="rules" flat>
	<DataTable columns={['Rule', 'File']} items={items} emptyText="ルールが設定されていません">
		{#snippet row(item)}
			{@const f = item as TreeNode}
			<tr class="clickable" onclick={() => { window.location.hash = `#/scope/${scopeId}/file/${zone}:rules/${f.name}`; }}>
				<td style="font-weight:500;color:var(--text)">{f.name.replace('.md', '')}</td>
				<td class="file-path">{f.name}</td>
			</tr>
		{/snippet}
	</DataTable>
</Section>

<style>
	.file-path { font-family: var(--font-code); color: var(--text-tertiary); font-size: 12px; }
	.clickable { cursor: pointer; }
	.clickable:hover { background: var(--bg); }
</style>
