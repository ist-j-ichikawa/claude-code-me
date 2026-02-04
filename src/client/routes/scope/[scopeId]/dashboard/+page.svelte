<script lang="ts">
	import type { ScopeConfig } from '$lib/types';

	let { data } = $props();
	let config: ScopeConfig = $derived(data.config);
</script>

<div class="animate-in">
	<h2 class="page-title">Dashboard</h2>

	<div class="stat-grid">
		<div class="stat-card">
			<div class="stat-value">{config.sessionCount}</div>
			<div class="stat-label">Sessions</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{config.hooks.length}</div>
			<div class="stat-label">Hooks</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{config.rules.length}</div>
			<div class="stat-label">Rules</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{config.commands.length}</div>
			<div class="stat-label">Commands</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{config.agents.length}</div>
			<div class="stat-label">Agents</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{config.memory.length}</div>
			<div class="stat-label">Memory</div>
		</div>
	</div>

	{#if config.settings}
		<section class="section">
			<h3>Settings</h3>
			<div class="card">
				<pre class="json-view">{JSON.stringify(config.settings, null, 2)}</pre>
			</div>
		</section>
	{/if}

	{#if config.mcpJson}
		<section class="section">
			<h3>MCP Servers</h3>
			<div class="card">
				<pre class="json-view">{JSON.stringify(config.mcpJson.content, null, 2)}</pre>
			</div>
		</section>
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
		background: var(--bg-card);
		border: 1px solid var(--border-light);
		border-radius: 8px;
		padding: 16px;
		text-align: center;
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

	.section {
		margin-bottom: 24px;
	}

	.section h3 {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.card {
		background: var(--bg-card);
		border: 1px solid var(--border-light);
		border-radius: 8px;
		padding: 16px;
	}

	.json-view {
		font-family: var(--font-code);
		font-size: 13px;
		color: var(--text-secondary);
		white-space: pre-wrap;
		word-break: break-word;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.animate-in {
		animation: fadeIn 0.3s ease;
	}
</style>
