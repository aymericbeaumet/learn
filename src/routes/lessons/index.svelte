<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { firstLesson } from '$lib/assets/lessons';

	onMount(() => {
		goto(`/lessons/${firstLesson}`);
	});
</script>
