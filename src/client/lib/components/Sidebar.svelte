<script lang="ts">
	import type { ScopeEntry } from '$lib/types';
	import ScopeList from './ScopeList.svelte';

	let {
		scopes,
		currentScopeId,
		ccVersion,
	}: {
		scopes: ScopeEntry[];
		currentScopeId: string;
		ccVersion: string | null;
	} = $props();

	let isUserActive = $derived(currentScopeId === 'user');
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<a href="#/scope/user/dashboard" class="logo">
			<img src="/favicon.svg" alt="Me" class="logo-icon" />
			<span>Claude Code <span class="logo-highlight">Me</span></span>
		</a>
	</div>

	{#if ccVersion}
		<div class="tracking-badge">Claude Code v{ccVersion} tracking</div>
	{/if}

	<div class="sidebar-section">
		<a href="#/scope/user/dashboard" class="user-link" class:active={isUserActive}>user</a>
	</div>

	<div class="sidebar-section sidebar-section-flex">
		<div class="section-label">PROJECTS</div>
		<ScopeList {scopes} {currentScopeId} />
	</div>
</aside>

<style>
	.sidebar {
		background: var(--bg-card);
		border-right: 1px solid var(--border);
		padding: 16px 0 0;
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.sidebar::-webkit-scrollbar {
		width: 0;
	}

	.sidebar-header {
		padding: 0 16px 16px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
	}

	.logo:hover {
		text-decoration: none;
	}

	.logo-icon {
		width: 24px;
		height: 24px;
	}

	.logo-highlight {
		color: var(--coral);
		font-weight: 600;
	}

	.sidebar-section {
		padding: 4px 0;
	}

	.sidebar-section-flex {
		flex: 1 1 auto;
		min-height: 0;
		padding-bottom: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.user-link {
		display: block;
		padding: 8px 16px 4px;
		font-size: 11px;
		font-weight: 600;
		color: var(--text-tertiary);
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border-left: 2px solid transparent;
	}
	.user-link:hover {
		background: var(--bg);
		color: var(--text);
		text-decoration: none;
	}
	.user-link.active {
		color: var(--coral);
		border-left-color: var(--coral);
		background: var(--bg-warm);
	}

	.section-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 8px 16px 4px;
	}

	.tracking-badge {
		font-size: 10px;
		color: var(--text-tertiary);
		font-family: var(--font-code);
		padding: 0 16px 8px;
		letter-spacing: 0.2px;
	}

</style>
