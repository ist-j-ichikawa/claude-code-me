<script lang="ts">
	let { data } = $props();
	let isJson = $derived(data.filePath.endsWith('.json'));
	let formatted = $derived(isJson ? tryFormatJson(data.content) : data.content);

	function tryFormatJson(text: string): string {
		try { return JSON.stringify(JSON.parse(text), null, 2); }
		catch { return text; }
	}
</script>

<div class="animate-in">
	<h2>File Viewer</h2>
	<p class="file-path">{data.zone}:{data.filePath}</p>

	{#if data.error}
		<div class="error">{data.content}</div>
	{:else}
		<div class="card">
			<pre class="file-content">{formatted}</pre>
		</div>
	{/if}
</div>

<style>
	h2 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
	.file-path { font-size: 13px; color: var(--text-tertiary); font-family: var(--font-code); margin-bottom: 24px; }
	.card { background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 8px; padding: 16px; }
	.file-content { font-family: var(--font-code); font-size: 13px; color: var(--text-secondary); white-space: pre-wrap; word-break: break-word; margin: 0; line-height: 1.6; }
	.error { padding: 32px; text-align: center; color: #c53030; font-size: 14px; }
	.animate-in { animation: fadeIn 0.3s ease; }
	@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
