<script lang="ts">
	import type { ScopeConfig } from '$lib/types';
	import ClaudeMdSection from '$lib/components/sections/ClaudeMdSection.svelte';
	import SettingsSection from '$lib/components/sections/SettingsSection.svelte';
	import HooksSection from '$lib/components/sections/HooksSection.svelte';
	import McpSection from '$lib/components/sections/McpSection.svelte';
	import SkillsSection from '$lib/components/sections/SkillsSection.svelte';
	import PluginsSection from '$lib/components/sections/PluginsSection.svelte';
	import EnvSection from '$lib/components/sections/EnvSection.svelte';
	import HistorySection from '$lib/components/sections/HistorySection.svelte';
	import InsightsSection from '$lib/components/sections/InsightsSection.svelte';
	import PermissionsSection from '$lib/components/sections/PermissionsSection.svelte';
	import CommandsSection from '$lib/components/sections/CommandsSection.svelte';
	import AgentsSection from '$lib/components/sections/AgentsSection.svelte';
	import RulesSection from '$lib/components/sections/RulesSection.svelte';
	import MemorySection from '$lib/components/sections/MemorySection.svelte';
	import SessionsSection from '$lib/components/sections/SessionsSection.svelte';

	let { data } = $props();
	let config: ScopeConfig = $derived(data.config);
	let scopeId: string = $derived(data.scopeId);
	let isUser = $derived(scopeId === 'user');

	type Stat = { label: string; value: number; anchor: string };

	let skillsCount = $derived(config.skills.filter((f) => f.type === 'dir').length);
	let hooksCount = $derived(
		Object.keys(((config.settings ?? {}) as Record<string, unknown>).hooks as Record<string, unknown> ?? {}).length,
	);
	let mcpCount = $derived(
		Object.keys(((config.mcpJson?.content ?? {}) as Record<string, unknown>).mcpServers ?? {}).length,
	);
	let pluginsCount = $derived(
		Object.keys(((config.settings ?? {}) as Record<string, unknown>).enabledPlugins ?? {}).length,
	);
	let envCount = $derived(data.env?.length ?? 0);
	let historyCount = $derived(data.history?.length ?? 0);

	let rulesCount = $derived(config.rules.filter((f) => f.type === 'file').length);
	let commandsCount = $derived(config.commands.filter((f) => f.type === 'file' && f.name.endsWith('.md')).length);
	let agentsCount = $derived(config.agents.filter((f) => f.type === 'file' && f.name.endsWith('.md')).length);
	let memoryCount = $derived(config.memory.filter((f) => f.type === 'file').length);

	let stats: Stat[] = $derived(
		isUser
			? [
					// Order follows the official docs: Hooks > MCP > Skills > Plugins ...
					{ label: 'Hooks', value: hooksCount, anchor: '#hooks' },
					{ label: 'MCP', value: mcpCount, anchor: '#mcp-servers' },
					{ label: 'Skills', value: skillsCount, anchor: '#skills' },
					{ label: 'Plugins', value: pluginsCount, anchor: '#plugins' },
					{ label: 'Env', value: envCount, anchor: '#env' },
					{ label: 'History', value: historyCount, anchor: '#history' },
				]
			: [
					// Shared concepts keep the same relative order as the user scope
					// (Hooks > Skills ...); Sessions is project-specific and shown last.
					{ label: 'Hooks', value: hooksCount, anchor: '#hooks' },
					{ label: 'Skills', value: skillsCount, anchor: '#skills' },
					{ label: 'Agents', value: agentsCount, anchor: '#agents' },
					{ label: 'Commands', value: commandsCount, anchor: '#commands' },
					{ label: 'Rules', value: rulesCount, anchor: '#rules' },
					{ label: 'Memory', value: memoryCount, anchor: '#memory' },
					{ label: 'Sessions', value: config.sessionCount, anchor: '#sessions' },
				],
	);

</script>

<div class="animate-in">
	<h2 class="page-title">{isUser ? 'User' : 'Dashboard'}</h2>

	<div class="stat-grid">
		{#each stats as stat}
			{#if stat.value === 0}
				<span class="stat-card disabled" data-tooltip="{stat.label} は未設定">
					<div class="stat-value">{stat.value}</div>
					<div class="stat-label">{stat.label}</div>
				</span>
			{:else}
				<a href={stat.anchor} class="stat-card">
					<div class="stat-value">{stat.value}</div>
					<div class="stat-label">{stat.label}</div>
				</a>
			{/if}
		{/each}
	</div>

	{#if isUser}
		{#if config.claudeMd}
			<ClaudeMdSection claudeMd={config.claudeMd} {scopeId} />
		{/if}
		<SettingsSection {config} />
		{#if data.env}
			<EnvSection entries={data.env} />
		{/if}
		<HooksSection {config} />
		<McpSection {config} />
		<SkillsSection {config} {scopeId} />
		<PluginsSection {config} />
		{#if data.history}
			<HistorySection entries={data.history} />
		{/if}
		<InsightsSection />
	{:else}
		{#if config.claudeMd}
			<ClaudeMdSection claudeMd={config.claudeMd} {scopeId} />
		{/if}
		<SettingsSection {config} />
		<PermissionsSection {config} />
		<HooksSection {config} />
		<McpSection {config} />
		<SkillsSection {config} {scopeId} />
		<AgentsSection {config} {scopeId} />
		<CommandsSection {config} {scopeId} />
		<RulesSection {config} {scopeId} />
		<MemorySection {config} {scopeId} />
		{#if data.sessions}
			<SessionsSection sessions={data.sessions} />
		{/if}
	{/if}
</div>

<style>
	.page-title {
		font-size: 20px;
		font-weight: 600;
		margin-bottom: 24px;
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 12px;
		margin-bottom: 32px;
	}

	.stat-card {
		display: block;
		background: var(--bg-card);
		border: 1px solid var(--border-light);
		border-radius: 8px;
		padding: 16px;
		text-align: center;
		text-decoration: none;
		transition: border-color 0.15s;
		cursor: pointer;
	}

	.stat-card:hover {
		border-color: var(--coral);
		text-decoration: none;
	}

	.stat-card.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		position: relative;
	}

	.stat-card.disabled:hover {
		border-color: var(--border-light);
	}

	.stat-card.disabled::after {
		content: attr(data-tooltip);
		position: absolute;
		bottom: calc(100% + 4px);
		left: 50%;
		transform: translateX(-50%);
		background: var(--text);
		color: #fff;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 11px;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.15s;
	}

	.stat-card.disabled:hover::after {
		opacity: 1;
	}

	.stat-value {
		font-size: 24px;
		font-weight: 600;
		color: var(--coral);
	}

	.stat-label {
		font-size: 12px;
		color: var(--text-tertiary);
		margin-top: 4px;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.animate-in {
		animation: fadeIn 0.3s ease;
	}
</style>
