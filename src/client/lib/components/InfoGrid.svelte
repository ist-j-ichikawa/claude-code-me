<script lang="ts">
	let { items }: { items: [string, string][] } = $props();
</script>

{#if items.length > 0}
	<div class="info-grid">
		{#each items as [label, value]}
			<div class="info-item">
				<span class="info-label">{label}</span>
				<span class="info-value">{value}</span>
			</div>
		{/each}
	</div>
{/if}

<style>
	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 12px;
	}
	.info-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.info-label {
		font-size: 12px;
		color: var(--text-tertiary);
	}
	.info-value {
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
	}
</style>
