<script lang="ts">
	import type { ScopeConfig } from '$lib/types';
	import { page } from '$app/state';
	import NavItem from './NavItem.svelte';

	let {
		config,
		scopeId,
		currentScopeId,
	}: {
		config: ScopeConfig;
		scopeId: string;
		currentScopeId: string;
	} = $props();

	const items = [
		{ view: 'dashboard', label: 'Dashboard' },
		{ view: 'permissions', label: 'Permissions' },
		{ view: 'mcp', label: 'MCP Servers' },
		{ view: 'settings', label: 'Settings' },
		{ view: 'hooks', label: 'Hooks' },
		{ view: 'commands', label: 'Commands' },
		{ view: 'agents', label: 'Agents' },
		{ view: 'rules', label: 'Rules' },
		{ view: 'skills', label: 'Skills' },
		{ view: 'memory', label: 'Memory' },
		{ view: 'sessions', label: 'Sessions' },
	];

	// Conditionally show CLAUDE.md if it exists
	let allItems = $derived(
		config.claudeMd
			? [items[0], { view: `file/${config.claudeMd.zone}:${config.claudeMd.path}`, label: 'CLAUDE.md' }, ...items.slice(1)]
			: items
	);

	function isActive(view: string): boolean {
		if (currentScopeId !== scopeId) return false;
		const hash = page.url?.hash ?? '';
		return hash === `#/scope/${scopeId}/${view}`;
	}
</script>

<nav>
	{#each allItems as item}
		<NavItem
			href="#/scope/{scopeId}/{item.view}"
			label={item.label}
			active={isActive(item.view)}
		/>
	{/each}
</nav>
