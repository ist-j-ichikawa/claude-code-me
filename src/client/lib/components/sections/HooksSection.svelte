<script lang="ts">
	import Section from '../Section.svelte';
	import { HOOK_EVENTS, hookType, hookPrimaryValue, hookRestFields, type HookEntry } from '$lib/hooks';
	import type { ScopeConfig } from '$lib/types';

	type HandlerGroup = { matcher?: string; hooks?: HookEntry[] };

	let { config }: { config: ScopeConfig } = $props();
	let configuredHooks = $derived(
		((config.settings ?? {}) as Record<string, unknown>).hooks as Record<string, HandlerGroup[]> ?? {},
	);
	let entries = $derived(Object.entries(configuredHooks));
</script>

<Section title="Hooks" id="hooks" flat>
	{#if entries.length > 0}
		<div class="hook-list">
			{#each entries as [event, groups]}
				<div class="hook-event">
					<div class="hook-header">
						<span class="badge coral">{event}</span>
						<span class="meta">{groups.length} group{groups.length > 1 ? 's' : ''}</span>
					</div>
					{#each groups as group}
						<div class="group">
							{#if group.matcher}
								<div class="matcher"><span class="label">matcher:</span> <code>{group.matcher}</code></div>
							{/if}
							{#each group.hooks ?? [] as h}
								{@const primary = hookPrimaryValue(h)}
								{@const rest = hookRestFields(h)}
								<div class="handler">
									<span class="type">{hookType(h)}</span>
									{#if primary}<code class="cmd">{primary}</code>{/if}
								</div>
								{#each rest as [k, v]}
									<div class="hook-field"><span class="label">{k}:</span> <code>{v}</code></div>
								{/each}
							{/each}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		<p class="empty">設定済み Hook はありません ({Object.keys(HOOK_EVENTS).length} イベントが利用可能)</p>
	{/if}
</Section>

<style>
	.empty { font-size: 13px; color: var(--text-tertiary); }

	.hook-list { display: flex; flex-direction: column; gap: 8px; }

	.hook-event {
		border: 1px solid var(--border-light);
		border-radius: 6px;
		padding: 10px 12px;
		background: var(--bg-card);
	}

	.hook-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.badge {
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 3px;
		font-weight: 600;
	}
	.badge.coral { background: #fff0eb; color: var(--coral); }

	.meta {
		font-size: 11px;
		color: var(--text-tertiary);
	}

	.group {
		padding: 4px 0 4px 8px;
		border-left: 2px solid var(--border-light);
		margin-bottom: 4px;
	}
	.group:last-child { margin-bottom: 0; }

	.matcher { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
	.label { color: var(--text-tertiary); }
	.matcher code { font-family: var(--font-code); font-size: 11px; background: var(--bg); padding: 1px 4px; border-radius: 3px; }

	.hook-field { font-size: 11px; color: var(--text-secondary); margin: 2px 0 6px 8px; }
	.hook-field code { font-family: var(--font-code); background: var(--bg); padding: 1px 4px; border-radius: 3px; word-break: break-all; }

	.handler {
		display: flex;
		align-items: baseline;
		gap: 8px;
		font-size: 12px;
		padding: 2px 0;
	}

	.type {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		color: var(--text-tertiary);
		font-weight: 600;
		flex-shrink: 0;
	}

	.cmd {
		font-family: var(--font-code);
		font-size: 12px;
		color: var(--text);
		background: var(--bg);
		padding: 2px 6px;
		border-radius: 3px;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
