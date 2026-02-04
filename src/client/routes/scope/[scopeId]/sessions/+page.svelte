<script lang="ts">
	import DataTable from '$lib/components/DataTable.svelte';
	import type { Session } from '$lib/types';

	let { data } = $props();
	let sessions = $derived(data.sessions as Session[]);
</script>

<div class="animate-in">
	<h2>Sessions</h2>

	<DataTable columns={['Name', 'Summary', 'Last Modified', 'ID']} items={sessions} emptyText="セッションがありません">
		{#snippet row(item)}
			{@const s = item as Session}
			<tr>
				<td style="font-weight:500;color:var(--text)">{s.customTitle ?? s.slug ?? s.sessionId.slice(0, 8)}</td>
				<td style="color:var(--text-secondary);max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{s.summary ?? ''}</td>
				<td class="file-path">{s.lastModified ? new Date(s.lastModified).toLocaleString('ja-JP') : ''}</td>
				<td class="file-path">{s.sessionId.slice(0, 8)}</td>
			</tr>
		{/snippet}
	</DataTable>
</div>

<style>
	h2 { font-size: 20px; font-weight: 600; margin-bottom: 24px; }
	.file-path { font-family: var(--font-code); color: var(--text-tertiary); font-size: 13px; }
	.animate-in { animation: fadeIn 0.3s ease; }
	@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
