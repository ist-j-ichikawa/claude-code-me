<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { data, children } = $props();

	const MIN_W = 200;
	const MAX_W = 560;
	const DEFAULT_W = 280;
	const STORAGE_KEY = 'ccme:sidebar-width';

	let sidebarWidth = $state(DEFAULT_W);

	onMount(() => {
		const saved = Number(localStorage.getItem(STORAGE_KEY));
		if (saved) sidebarWidth = clampW(saved);
	});

	function clampW(w: number): number {
		return Math.max(MIN_W, Math.min(MAX_W, Math.round(w)));
	}

	function persist() {
		localStorage.setItem(STORAGE_KEY, String(sidebarWidth));
	}

	// Holds the teardown for an in-flight drag so pointercancel and component
	// destroy can both end it (otherwise window listeners + body styles leak).
	let activeDragCleanup: (() => void) | null = null;

	function startResize(e: PointerEvent) {
		e.preventDefault();
		const onMove = (ev: PointerEvent) => {
			sidebarWidth = clampW(ev.clientX);
		};
		const end = () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', end);
			window.removeEventListener('pointercancel', end);
			document.body.style.userSelect = '';
			document.body.style.cursor = '';
			activeDragCleanup = null;
			persist();
		};
		activeDragCleanup = end;
		document.body.style.userSelect = 'none';
		document.body.style.cursor = 'col-resize';
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', end);
		window.addEventListener('pointercancel', end);
	}

	onDestroy(() => activeDragCleanup?.());

	function onHandleKey(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') sidebarWidth = clampW(sidebarWidth - 16);
		else if (e.key === 'ArrowRight') sidebarWidth = clampW(sidebarWidth + 16);
		else return;
		e.preventDefault();
		persist();
	}
</script>

<div class="app-grid" style="--sidebar-width: {sidebarWidth}px">
	<Sidebar
		scopes={data.scopes}
		currentScopeId={data.scopeId}
		ccVersion={data.ccVersion}
	/>
	<!-- WAI-ARIA window splitter pattern: a focusable role="separator" with
	     aria-valuenow drives keyboard/drag resize. Svelte's a11y lint treats
	     separator as non-interactive, which is a false positive here. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="resize-handle"
		role="separator"
		aria-orientation="vertical"
		aria-label="サイドバー幅を調整"
		aria-valuenow={sidebarWidth}
		aria-valuemin={MIN_W}
		aria-valuemax={MAX_W}
		tabindex="0"
		onpointerdown={startResize}
		onkeydown={onHandleKey}
		ondblclick={() => { sidebarWidth = DEFAULT_W; persist(); }}
	></div>
	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.app-grid {
		display: grid;
		grid-template-columns: var(--sidebar-width) 1fr;
		min-height: 100vh;
		position: relative;
	}

	.main-content {
		padding: 32px 40px;
		overflow-y: auto;
		min-width: 0;
	}

	/* Drag-to-resize handle sitting on the sidebar/content boundary. */
	.resize-handle {
		position: absolute;
		top: 0;
		bottom: 0;
		left: var(--sidebar-width);
		width: 9px;
		transform: translateX(-5px);
		cursor: col-resize;
		z-index: 20;
		background: transparent;
	}
	.resize-handle:hover,
	.resize-handle:focus-visible {
		background: linear-gradient(
			to right,
			transparent 4px,
			var(--coral) 4px,
			var(--coral) 6px,
			transparent 6px
		);
		outline: none;
	}
</style>
