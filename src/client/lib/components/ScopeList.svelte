<script lang="ts">
	import type { ScopeEntry } from '$lib/types';

	let {
		scopes,
		currentScopeId,
	}: {
		scopes: ScopeEntry[];
		currentScopeId: string;
	} = $props();

	let search = $state('');

	let filtered = $derived(
		search
			? scopes.filter((s) =>
					s.displayName.toLowerCase().includes(search.toLowerCase()),
				)
			: scopes,
	);
</script>

<div class="scope-list">
	<input
		type="text"
		class="scope-search"
		placeholder="Search projects..."
		bind:value={search}
	/>

	{#each filtered as scope (scope.id)}
		<a
			href="#/scope/{scope.id}/dashboard"
			class="scope-item"
			class:active={scope.id === currentScopeId}
		>
			<span class="scope-badge">P</span>
			<span class="scope-name">{scope.displayName}</span>
			<span class="scope-count">{scope.sessionCount}</span>
		</a>
	{:else}
		<div class="empty">No projects found</div>
	{/each}
</div>

<style>
	.scope-list {
		padding: 0 8px;
	}

	.scope-search {
		width: 100%;
		padding: 6px 8px;
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 13px;
		font-family: var(--font-ui);
		background: var(--bg);
		color: var(--text);
		margin-bottom: 4px;
		outline: none;
	}

	.scope-search:focus {
		border-color: var(--coral);
	}

	.scope-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		border-radius: 4px;
		font-size: 13px;
		color: var(--text-secondary);
		text-decoration: none;
		transition: background 0.1s;
	}

	.scope-item:hover {
		background: var(--bg);
		text-decoration: none;
		color: var(--text);
	}

	.scope-item.active {
		background: var(--bg-warm);
		color: var(--text);
		font-weight: 500;
	}

	.scope-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 3px;
		font-size: 10px;
		font-weight: 600;
		background: var(--warning-light);
		color: var(--warning);
		flex-shrink: 0;
	}

	.scope-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.scope-count {
		font-size: 12px;
		color: var(--text-tertiary);
		flex-shrink: 0;
	}

	.empty {
		padding: 12px 8px;
		font-size: 13px;
		color: var(--text-tertiary);
	}
</style>
