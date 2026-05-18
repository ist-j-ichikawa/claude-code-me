<script lang="ts">
	import ScopeBadge from './ScopeBadge.svelte';
	import type { ScopeType } from '$lib/types';

	export interface InfoItem {
		label: string;
		value: string;
		scope?: ScopeType;
	}
	let { items }: { items: InfoItem[] } = $props();
</script>

{#if items.length > 0}
	<div class="info-grid">
		{#each items as item}
			<div class="info-item">
				<span class="info-label">
					{item.label}
					{#if item.scope}<ScopeBadge scope={item.scope} />{/if}
				</span>
				<span class="info-value">{item.value}</span>
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
