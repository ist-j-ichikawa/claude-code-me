<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import TagList from '$lib/components/TagList.svelte';
	import { HOOK_EVENTS } from '$lib/hooks';

	let { data } = $props();
	let configuredHooks = $derived(((data.config.settings ?? {}) as Record<string, unknown>).hooks as Record<string, unknown[]> ?? {});
	let entries = $derived(Object.entries(configuredHooks));
</script>

<div class="animate-in">
	<h2>Hooks</h2>
	<p class="subtitle">利用可能なHookイベントと設定済みのハンドラー</p>

	{#if entries.length > 0}
		<Section title="設定済みのHooks">
			{#each entries as [name, handlers]}
				<div class="hook-event open">
					<button class="hook-header" onclick={(e) => { (e.currentTarget as HTMLElement).parentElement?.classList.toggle('open'); }}>
						<span><span class="badge coral">{name}</span> {handlers.length} handler{handlers.length > 1 ? 's' : ''}</span>
						<span class="arrow">&#x25B6;</span>
					</button>
					<div class="hook-body">
						<pre class="json-view">{JSON.stringify(handlers, null, 2)}</pre>
					</div>
				</div>
			{/each}
		</Section>
	{/if}

	<Section title="利用可能なHookイベント">
		{#each Object.entries(HOOK_EVENTS) as [name, info]}
			<div class="hook-event">
				<button class="hook-header" onclick={(e) => { (e.currentTarget as HTMLElement).parentElement?.classList.toggle('open'); }}>
					<span>
						{name}
						{#if configuredHooks[name]}
							<span class="badge success">設定済み</span>
						{/if}
					</span>
					<span class="arrow">&#x25B6;</span>
				</button>
				<div class="hook-body">
					<p class="desc">{info.desc}</p>
					<div class="meta">
						<div class="meta-item">
							<span class="meta-label">発火タイミング:</span>
							<span>{info.timing}</span>
						</div>
						<div class="meta-item">
							<span class="meta-label">ブロック可能:</span>
							<span>{info.canBlock ? 'Yes' : 'No'}</span>
						</div>
					</div>
					{#if info.matchers.length > 0}
						<div class="meta-item">
							<span class="meta-label">Matchers:</span>
							<div style="margin-top:8px">
								<TagList items={info.matchers} />
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</Section>
</div>

<style>
	h2 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; }
	.hook-event { border: 1px solid var(--border-light); border-radius: 6px; margin-bottom: 8px; overflow: hidden; }
	.hook-header { all: unset; display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 10px 16px; cursor: pointer; font-size: 14px; }
	.hook-header:hover { background: var(--bg); }
	.hook-body { display: none; padding: 12px 16px; border-top: 1px solid var(--border-light); background: var(--bg); }
	.hook-event.open .hook-body { display: block; }
	.hook-event.open .arrow { transform: rotate(90deg); }
	.arrow { font-size: 10px; color: var(--text-tertiary); transition: transform 0.2s; }
	.badge { font-size: 11px; padding: 2px 6px; border-radius: 3px; margin-left: 8px; }
	.badge.coral { background: #fff0eb; color: var(--coral); }
	.badge.success { background: var(--success-light); color: var(--success); }
	.desc { font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; }
	.meta { display: flex; gap: 24px; margin-bottom: 8px; }
	.meta-item { font-size: 13px; }
	.meta-label { font-weight: 600; color: var(--text-secondary); margin-right: 4px; }
	.json-view { font-family: var(--font-code); font-size: 13px; color: var(--text-secondary); white-space: pre-wrap; margin: 0; }
	.animate-in { animation: fadeIn 0.3s ease; }
	@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
