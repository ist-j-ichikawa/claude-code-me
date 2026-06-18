<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchFile } from '$lib/api';
	import { renderMarkdown } from '$lib/markdown';
	import Section from '../Section.svelte';
	import type { FileRef } from '$lib/types';

	let {
		claudeMd,
		scopeId,
	}: {
		claudeMd: FileRef;
		scopeId: string;
	} = $props();

	let content = $state<string | null>(null);
	let error = $state<string | null>(null);
	let rendered = $derived(content === null ? '' : renderMarkdown(content));

	// Long CLAUDE.md files are collapsed to a preview by default; expanding shows
	// the full content inline (no nested scroll box — the page scrolls instead).
	const COLLAPSED_MAX = 260;
	let expanded = $state(false);
	let bodyEl = $state<HTMLElement | undefined>();
	let overflowing = $state(false);

	$effect(() => {
		rendered; // re-measure once the content renders
		overflowing = !!bodyEl && bodyEl.scrollHeight > COLLAPSED_MAX + 8;
	});

	onMount(async () => {
		try {
			content = await fetchFile(scopeId, claudeMd.zone ?? claudeMd.scope, claudeMd.path);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	});
</script>

<Section title="CLAUDE.md" id="claude-md">
	<p class="path">{claudeMd.path}</p>
	{#if content !== null}
		<div class="md-wrap" class:collapsed={overflowing && !expanded} style="--collapsed-max: {COLLAPSED_MAX}px">
			<div class="markdown-body" bind:this={bodyEl}>{@html rendered}</div>
		</div>
		{#if overflowing}
			<button class="toggle" onclick={() => (expanded = !expanded)}>
				{expanded ? '折りたたむ' : '全文表示'}
			</button>
		{/if}
	{:else if error}
		<p class="error">{error}</p>
	{:else}
		<p class="loading">Loading…</p>
	{/if}
</Section>

<style>
	.path {
		font-family: var(--font-code);
		font-size: 12px;
		color: var(--text-tertiary);
		margin-bottom: 8px;
	}
	.md-wrap.collapsed {
		max-height: var(--collapsed-max);
		overflow: hidden;
		-webkit-mask-image: linear-gradient(to bottom, #000 72%, transparent);
		mask-image: linear-gradient(to bottom, #000 72%, transparent);
	}
	.toggle {
		margin-top: 8px;
		padding: 4px 0;
		background: none;
		border: none;
		font-family: var(--font-ui);
		font-size: 13px;
		color: var(--coral);
		cursor: pointer;
	}
	.toggle:hover {
		text-decoration: underline;
	}
	.error { color: #c53030; font-size: 13px; }
	.loading { color: var(--text-tertiary); font-size: 13px; }
</style>
