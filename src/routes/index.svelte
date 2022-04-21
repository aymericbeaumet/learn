<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto(`/lessons/${lessonsIndex[0]}`);
	});
</script>
