<script>
	import '../lib/tokens.css';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="description" content="Claude Code Me" />
</svelte:head>

{@render children()}

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: var(--font-ui);
		font-size: 15px;
		color: var(--text);
		background: var(--bg);
		line-height: 1.5;
	}

	:global(code, pre) {
		font-family: var(--font-code);
	}

	:global(a) {
		color: var(--coral);
		text-decoration: none;
	}

	:global(a:hover) {
		text-decoration: underline;
	}
</style>
