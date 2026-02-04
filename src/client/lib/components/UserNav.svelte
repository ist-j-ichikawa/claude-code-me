<script lang="ts">
	import { page } from '$app/state';
	import NavItem from './NavItem.svelte';

	let {
		scopeId,
		currentScopeId,
	}: {
		scopeId: string;
		currentScopeId: string;
	} = $props();

	const items = [
		{ view: 'dashboard', label: 'Dashboard' },
		{ view: 'settings', label: 'Settings' },
		{ view: 'plugins', label: 'Plugins' },
		{ view: 'hooks', label: 'Hooks' },
		{ view: 'mcp', label: 'MCP Servers' },
		{ view: 'plans', label: 'Plans' },
		{ view: 'skills', label: 'Skills' },
		{ view: 'tasks', label: 'Tasks' },
	];

	function isActive(view: string): boolean {
		if (currentScopeId !== scopeId) return false;
		const hash = page.url?.hash ?? '';
		return hash === `#/scope/${scopeId}/${view}`;
	}
</script>

<nav>
	{#each items as item}
		<NavItem
			href="#/scope/{scopeId}/{item.view}"
			label={item.label}
			active={isActive(item.view)}
		/>
	{/each}
</nav>
