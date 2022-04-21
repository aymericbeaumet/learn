<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import lessonsIndex from '$lib/assets/lessons-index.json';

	onMount(() => {
		goto(`/lessons/${lessonsIndex[0]}`);
	});
</script>
