<script lang="ts">
	import type { ScopeType } from '$lib/types';

	let { scope }: { scope: ScopeType | undefined } = $props();
</script>

{#if scope}
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
