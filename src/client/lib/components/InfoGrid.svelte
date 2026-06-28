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
	<div class="info-list">
		{#each items as item}
			<div class="info-row">
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
	/* Vertically aligned label → value list: labels stack in a max-content
	   column, values line up in the next column so each row reads cleanly. */
	.info-list {
		display: grid;
		/* Label track shrinks (minmax floor 0) so a long unbroken settings key
		   wraps instead of overflowing the card on narrow widths. */
		grid-template-columns: minmax(0, max-content) 1fr;
		gap: 6px 24px;
		align-items: baseline;
	}
	.info-row {
		display: contents;
	}
	.info-label {
		font-size: 13px;
		color: var(--text-tertiary);
		overflow-wrap: anywhere;
	}
	.info-label :global(.badge) {
		margin-left: 6px;
	}
	.info-value {
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
		overflow-wrap: anywhere;
	}
</style>
