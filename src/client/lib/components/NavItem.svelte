<script lang="ts">
	let {
		href,
		label,
		active = false,
	}: {
		href: string;
		label: string;
		active?: boolean;
	} = $props();
</script>

<a {href} class="nav-item" class:active>
	{label}
</a>

<style>
	.nav-item {
		display: block;
		padding: 6px 16px;
		font-size: 14px;
		color: var(--text-secondary);
		text-decoration: none;
		transition: background 0.1s;
	}

	.nav-item:hover {
		background: var(--bg);
		text-decoration: none;
		color: var(--text);
	}

	.nav-item.active {
		background: var(--bg);
		color: var(--text);
		font-weight: 500;
		border-right: 2px solid var(--coral);
	}
</style>
