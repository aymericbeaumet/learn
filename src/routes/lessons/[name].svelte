<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Editor from '$lib/components/Editor.svelte';
	import { onMount } from 'svelte';
	import { isMatch } from 'lodash';
	import { execute } from '$lib/javascript';
	import { toJavaScript } from '$lib/markdown';
	import lessonsIndex from '$lib/assets/lessons-index.json';

	const lessonName = $page.params['name'];
	let code = '';
	let frontmatter = {};
	let done = false;

	$: {
		if (code) {
			try {
				const { values } = execute(code);
				done = done || isMatch(values, frontmatter.expect);
			} catch (err) {
				console.error(err);
			}
		}
	}

	onMount(() => {
		fetch(`/data/lessons/${lessonName}.md`)
			.then((res) => res.text())
			.then((text) => {
				const [f, c] = toJavaScript(text);
				frontmatter = f;
				code = c;
			});
	});

	const onNext = () => {
		for (let i = 0; i < lessonsIndex.length - 1; i++) {
			if (lessonsIndex[i] === lessonName) {
				goto(`/lessons/${lessonsIndex[i + 1]}`);
				return;
			}
		}
		throw new Error('cannot find the next lesson');
	};
</script>

<div class="container">
	<main>
		{#if code}
			<Editor width="800px" height="600px" bind:value={code} readOnly={done} />
		{/if}
	</main>
	<nav>
		<button disabled={!done} on:click|once={onNext}>Next</button>
	</nav>
</div>

<style>
	.container {
		display: flex;
	}

	main {
		border: 1px solid gray;
	}

	nav {
		width: 50px;
		display: flex;
		justify-content: center;
	}

	button {
		background-color: green;
		color: white;
	}

	button:disabled {
		display: none;
	}
</style>
