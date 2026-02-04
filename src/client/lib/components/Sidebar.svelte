<script lang="ts">
	import type { ScopeEntry, ScopeConfig } from '$lib/types';
	import UserNav from './UserNav.svelte';
	import ProjectNav from './ProjectNav.svelte';
	import ScopeList from './ScopeList.svelte';

	let {
		scopes,
		userConfig,
		projectConfig,
		currentScopeId,
	}: {
		scopes: ScopeEntry[];
		userConfig: ScopeConfig;
		projectConfig: ScopeConfig | null;
		currentScopeId: string;
	} = $props();
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<a href="#/scope/user/dashboard" class="logo">
			<img src="/favicon.svg" alt="Me" class="logo-icon" />
			<span>Claude Code <span class="logo-highlight">Me</span></span>
		</a>
	</div>

	<!-- User nav: always visible -->
	<div class="sidebar-section">
		<div class="section-label">USER</div>
		<UserNav scopeId="user" {currentScopeId} />
	</div>

	<div class="sidebar-divider"></div>

	<!-- Project list: always visible -->
	<div class="sidebar-section">
		<div class="section-label">PROJECTS</div>
		<ScopeList {scopes} {currentScopeId} />
	</div>

	<!-- Project nav: shown when a project is selected -->
	{#if projectConfig}
		<div class="sidebar-divider"></div>

		<div class="sidebar-section">
			<div class="project-path">
				{scopes.find(s => s.id === currentScopeId)?.displayName ?? ''}
			</div>
			<ProjectNav config={projectConfig} scopeId={currentScopeId} {currentScopeId} />
		</div>
	{/if}
</aside>

<style>
	.sidebar {
		background: var(--bg-card);
		border-right: 1px solid var(--border);
		padding: 16px 0;
		overflow-y: auto;
		position: sticky;
		top: 0;
		height: 100vh;
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

	.sidebar-divider {
		border-top: 1px solid var(--border-light);
		margin: 8px 16px;
	}

	.section-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 8px 16px 4px;
	}

	.project-path {
		font-size: 12px;
		color: var(--text-secondary);
		padding: 8px 16px;
		word-break: break-all;
		line-height: 1.4;
		font-family: var(--font-code);
	}
</style>
