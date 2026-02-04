<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { data, children } = $props();
</script>

<div class="app-grid">
	<Sidebar
		scopes={data.scopes}
		userConfig={data.userConfig}
		projectConfig={data.isProject ? data.config : null}
		currentScopeId={data.scopeId}
	/>
	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.app-grid {
		display: grid;
		grid-template-columns: var(--sidebar-width) 1fr;
		min-height: 100vh;
	}

	.main-content {
		padding: 32px 40px;
		max-width: 960px;
		overflow-y: auto;
	}
</style>
