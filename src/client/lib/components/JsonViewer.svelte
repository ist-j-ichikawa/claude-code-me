<script lang="ts">
	let { data }: { data: unknown } = $props();
	let json = $derived(JSON.stringify(data, null, 2));
</script>

<div class="card">
	<pre class="json-view">{json}</pre>
</div>

<style>
	.card {
		background: var(--bg-card);
		border: 1px solid var(--border-light);
		border-radius: 8px;
		padding: 16px;
	}
	.json-view {
		font-family: var(--font-code);
		font-size: 13px;
		color: var(--text-secondary);
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
	}
</style>
