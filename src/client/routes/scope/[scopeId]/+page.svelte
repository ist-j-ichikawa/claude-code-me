<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	onMount(() => {
		goto(`/scope/${page.params.scopeId}/dashboard`, { replaceState: true });
	});
</script>
