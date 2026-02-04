<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import InfoGrid from '$lib/components/InfoGrid.svelte';
	import TagList from '$lib/components/TagList.svelte';
	import JsonViewer from '$lib/components/JsonViewer.svelte';

	let { data } = $props();
	let config = $derived(data.config);
	let s = $derived((config.settings ?? {}) as Record<string, unknown>);

	let generalItems = $derived(
		([
			s.language && ['Language', s.language],
			s.outputStyle && ['Output Style', s.outputStyle],
			s.model && ['Model', s.model],
			s.autoUpdatesChannel && ['Updates Channel', s.autoUpdatesChannel],
		].filter(Boolean) as [string, string][])
	);

	let perms = $derived(s.permissions as Record<string, unknown> | undefined);
	let attribution = $derived(s.attribution as Record<string, unknown> | undefined);
	let envVars = $derived(Object.entries((s.env as Record<string, unknown>) ?? {}));
</script>

<div class="animate-in">
	<h2>Settings</h2>
	<p class="file-path">{config.scope === 'project' ? '.claude/settings.json' : 'settings.json'}</p>

	{#if generalItems.length > 0}
		<Section title="General">
			<InfoGrid items={generalItems} />
		</Section>
	{/if}

	{#if perms}
		<Section title="Permissions">
			{#if (perms.allow as string[])?.length}
				<div class="subsection">
					<div class="subsection-label allow">Allow ({(perms.allow as string[]).length})</div>
					<TagList items={perms.allow as string[]} variant="enabled" />
				</div>
			{/if}
			{#if (perms.deny as string[])?.length}
				<div class="subsection">
					<div class="subsection-label deny">Deny ({(perms.deny as string[]).length})</div>
					<TagList items={perms.deny as string[]} variant="denied" />
				</div>
			{/if}
			{#if perms.defaultMode}
				<div class="subsection">
					<div class="subsection-label">Default Mode</div>
					<span class="badge">{perms.defaultMode}</span>
				</div>
			{/if}
		</Section>
	{/if}

	{#if attribution}
		<Section title="Attribution">
			<InfoGrid items={[
				attribution.commit !== undefined ? ['Commit Message', String(attribution.commit || '(empty)')] : null,
				attribution.pr !== undefined ? ['PR Message', String(attribution.pr || '(empty)')] : null,
			].filter(Boolean) as [string, string][]} />
		</Section>
	{/if}

	{#if envVars.length > 0}
		<Section title="Environment Variables">
			<div class="env-vars">
				{#each envVars as [key, val]}
					<div><span class="env-key">{key}</span>=<span class="env-val">{String(val)}</span></div>
				{/each}
			</div>
		</Section>
	{/if}

	<Section title="Raw JSON">
		<pre class="json-view">{JSON.stringify(s, null, 2)}</pre>
	</Section>
</div>

<style>
	h2 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
	.file-path { font-size: 13px; color: var(--text-tertiary); font-family: var(--font-code); margin-bottom: 24px; }
	.subsection { margin-bottom: 16px; }
	.subsection-label { font-weight: 600; font-size: 13px; margin-bottom: 8px; color: var(--text-secondary); }
	.subsection-label.allow { color: var(--success); }
	.subsection-label.deny { color: #c53030; }
	.badge { font-size: 12px; padding: 2px 8px; border-radius: 4px; background: var(--info-light); color: var(--info); }
	.env-vars { font-family: var(--font-code); font-size: 13px; }
	.env-key { color: var(--coral); }
	.env-val { color: var(--text-secondary); }
	.json-view { font-family: var(--font-code); font-size: 13px; color: var(--text-secondary); white-space: pre-wrap; word-break: break-word; margin: 0; }
	.animate-in { animation: fadeIn 0.3s ease; }
	@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
