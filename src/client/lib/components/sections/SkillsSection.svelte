<script lang="ts">
	import Section from '../Section.svelte';
	import DataTable from '../DataTable.svelte';
	import type { ScopeConfig, TreeNode } from '$lib/types';

	let { config, scopeId }: { config: ScopeConfig; scopeId: string } = $props();
	let items = $derived((config.skills ?? []).filter((f) => f.type === 'dir'));
	let zone = $derived(config.projectClaudeDir ? 'projectClaude' : 'claude');
</script>

<Section title="Skills" id="skills" flat>
	<DataTable columns={['Skill Name', 'File']} items={items} emptyText="スキルが設定されていません">
		{#snippet row(item)}
			{@const f = item as TreeNode}
			{@const mdFile = (f.children ?? []).find((c) => c.name.endsWith('.md'))}
			<tr class="clickable" onclick={() => { if (mdFile) window.location.hash = `#/scope/${scopeId}/file/${zone}:skills/${f.name}/${mdFile.name}`; }}>
				<td style="font-weight:500;color:var(--text)">{f.name}</td>
				<td class="file-path">{mdFile?.name ?? ''}</td>
			</tr>
		{/snippet}
	</DataTable>
</Section>

<style>
	.file-path { font-family: var(--font-code); color: var(--text-tertiary); font-size: 12px; }
	.clickable { cursor: pointer; }
	.clickable:hover { background: var(--bg); }
</style>
