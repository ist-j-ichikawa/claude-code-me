<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		children,
	}: {
		title: string;
		children: Snippet;
	} = $props();
</script>

<section class="section">
	<h3>{title}</h3>
	<div class="card">
		{@render children()}
	</div>
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
