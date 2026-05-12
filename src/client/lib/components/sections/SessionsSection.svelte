<script lang="ts">
	import Section from '../Section.svelte';
	import DataTable from '../DataTable.svelte';
	import type { Session } from '$lib/types';

	let { sessions }: { sessions: Session[] } = $props();
</script>

<Section title="Sessions" id="sessions" flat>
	<DataTable
		columns={['Name', 'Summary', 'Last Modified', 'ID']}
		items={sessions}
		emptyText="セッションがありません"
	>
		{#snippet row(item)}
			{@const s = item as Session}
			<tr>
				<td style="font-weight:500;color:var(--text)">
					{s.customTitle ?? s.slug ?? s.sessionId.slice(0, 8)}
				</td>
				<td class="summary">{s.summary ?? ''}</td>
				<td class="file-path">{s.lastModified ? new Date(s.lastModified).toLocaleString('ja-JP') : ''}</td>
				<td class="file-path">{s.sessionId.slice(0, 8)}</td>
			</tr>
		{/snippet}
	</DataTable>
</Section>

<style>
	.file-path { font-family: var(--font-code); color: var(--text-tertiary); font-size: 12px; }
	.summary {
		color: var(--text-secondary);
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
