<script lang="ts">
	import DataTable from '$lib/components/DataTable.svelte';
	import type { TreeNode } from '$lib/types';

	let { data } = $props();
	let items = $derived(((data.config.skills ?? []) as TreeNode[]).filter(f => f.type === 'dir'));
	let zone = $derived(data.config.projectClaudeDir ? 'projectClaude' : 'claude');
</script>

<div class="animate-in">
	<h2>Skills</h2>

	<DataTable columns={['Skill Name', 'File']} items={items} emptyText="スキルが設定されていません">
		{#snippet row(item)}
			{@const f = item as TreeNode}
			{@const mdFile = (f.children ?? []).find(c => c.name.endsWith('.md'))}
			<tr class="clickable" onclick={() => { if (mdFile) window.location.hash = `#/scope/${data.scopeId}/file/${zone}:skills/${f.name}/${mdFile.name}`; }}>
				<td style="font-weight:500;color:var(--text)">{f.name}</td>
				<td class="file-path">{mdFile?.name ?? ''}</td>
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
