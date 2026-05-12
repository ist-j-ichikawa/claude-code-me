<script lang="ts">
	let {
		items,
		variant = 'default',
	}: {
		items: string[];
		variant?: 'default' | 'enabled' | 'denied';
	} = $props();
</script>

<div class="tag-list">
	{#each items as item}
		<span class="tag {variant}">{item}</span>
	{/each}
</div>

<style>
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.tag {
		font-size: 12px;
		padding: 3px 8px;
		border-radius: 4px;
		font-family: var(--font-code);
		background: var(--bg);
		color: var(--text-secondary);
		border: 1px solid var(--border-light);
	}
	.tag.enabled {
		background: var(--success-light);
		color: var(--success);
		border-color: var(--success);
	}
	.tag.denied {
		background: #fde8e8;
		color: #c53030;
		border-color: #c53030;
	}
</style>
