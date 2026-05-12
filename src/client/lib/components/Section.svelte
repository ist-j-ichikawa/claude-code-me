<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		id,
		flat = false,
		children,
	}: {
		title: string;
		id?: string;
		flat?: boolean;
		children: Snippet;
	} = $props();

	let computedId = $derived(id ?? title.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, ''));
</script>

<section class="section" id={computedId}>
	<h3>{title}</h3>
	{#if flat}
		{@render children()}
	{:else}
		<div class="card">
			{@render children()}
		</div>
	{/if}
</section>

<style>
	.section {
		margin-bottom: 24px;
	}
	h3 {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 8px;
	}
	.card {
		background: var(--bg-card);
		border: 1px solid var(--border-light);
		border-radius: 8px;
		padding: 16px;
	}
</style>
