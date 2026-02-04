<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		columns,
		items,
		emptyText = 'No items',
		row,
	}: {
		columns: string[];
		items: unknown[];
		emptyText?: string;
		row: Snippet<[unknown]>;
	} = $props();
</script>

{#if items.length === 0}
	<div class="empty-state">{emptyText}</div>
{:else}
	<div class="data-table">
		<table>
			<thead>
				<tr>
					{#each columns as col}
						<th>{col}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each items as item}
					{@render row(item)}
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.data-table {
		background: var(--bg-card);
		border: 1px solid var(--border-light);
		border-radius: 8px;
		overflow: hidden;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th {
		text-align: left;
		padding: 10px 16px;
		font-size: 12px;
		font-weight: 600;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border-bottom: 1px solid var(--border-light);
		background: var(--bg);
	}
	.data-table :global(td) {
		padding: 10px 16px;
		font-size: 14px;
		border-bottom: 1px solid var(--border-light);
	}
	.data-table :global(tr:last-child td) {
		border-bottom: none;
	}
	.empty-state {
		padding: 32px;
		text-align: center;
		color: var(--text-tertiary);
		font-size: 14px;
	}
</style>
