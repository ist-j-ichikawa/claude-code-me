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
		<div class="md-scroll">
			<div class="markdown-body">{@html rendered}</div>
		</div>
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
	.md-scroll {
		max-height: 320px;
		overflow-y: auto;
	}
	.error { color: #c53030; font-size: 13px; }
	.loading { color: var(--text-tertiary); font-size: 13px; }
</style>
