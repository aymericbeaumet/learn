<script context="module">
	import { toJavaScript } from '$lib/markdown';

	export async function load({ params, fetch }) {
		const url = `/data/lessons/${params.name}.md`;
		const res = await fetch(url);

		if (res.ok) {
			const { code, frontmatter } = await res.text().then(toJavaScript);
			return {
				status: res.status,
				props: { code, frontmatter }
			};
		} else {
			return {
				status: res.status,
				error: new Error(`could not load ${url}`)
			};
		}
	}
</script>

<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Editor from '$lib/components/Editor.svelte';
	import isMatch from 'lodash/isMatch.js';
	import { execute } from '$lib/javascript';
	import lessonsIndex from '$lib/assets/lessons-index.json';

	export let code;
	export let frontmatter;

	let lessonIdx = lessonsIndex.indexOf($page.params.name);
	let done = false;

	$: {
		try {
			const { vars } = execute(code);
			done = done || isMatch(vars, frontmatter.vars || {});
		} catch (err) {
			console.error(err);
		}
	}
</script>

<div class="container">
	<nav>
		<button
			disabled={!(lessonIdx > 0)}
			on:click|once={() => goto(`/lessons/${lessonsIndex[lessonIdx - 1]}`)}>Prev</button
		>
	</nav>

	<main>
		<Editor width="800px" height="600px" bind:value={code} readOnly={done} />
	</main>

	<nav>
		<button
			disabled={!(done && lessonIdx < lessonsIndex.length - 1)}
			on:click|once={() => goto(`/lessons/${lessonsIndex[lessonIdx + 1]}`)}>Next</button
		>
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
