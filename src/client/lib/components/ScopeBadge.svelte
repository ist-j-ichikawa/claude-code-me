<script lang="ts">
	import type { ScopeType } from '$lib/types';

	let { scope, scopeId }: { scope: ScopeType | undefined; scopeId?: string } = $props();

	// In the user scope every item is user-scoped, so a "USER" badge is just
	// redundant noise. Only show it where it disambiguates — the project scope,
	// which mixes inherited-user and project-defined items.
	let show = $derived(!!scope && scopeId !== 'user');
</script>

{#if show}
	<span class="badge {scope}" title={scope === 'user' ? 'User スコープから継承' : 'このプロジェクトで定義'}>
		{scope === 'user' ? 'USER' : 'PROJECT'}
	</span>
{/if}

<style>
	.badge {
		font-size: 9px;
		letter-spacing: 0.4px;
		padding: 1px 5px;
		border-radius: 3px;
		font-weight: 600;
		vertical-align: middle;
	}
	.badge.user {
		background: var(--bg);
		color: var(--text-tertiary);
		border: 1px solid var(--border-light);
	}
	.badge.project {
		background: #fff0eb;
		color: var(--coral);
	}
</style>
