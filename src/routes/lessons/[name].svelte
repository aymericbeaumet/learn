<script context="module">
	import { toJavaScript } from '$lib/markdown';
	import lessonsIndex from '$lib/assets/lessons-index.json';

	export async function load({ params, fetch }) {
		const url = `/data/lessons/${params.name}.md`;
		const res = await fetch(url);

		if (res.ok) {
			const { code, frontmatter } = await res.text().then(toJavaScript);
			const done = false;
			const idx = lessonsIndex.indexOf(params.name);
			const prevLesson = idx - 1 >= 0 ? `/lessons/${lessonsIndex[idx - 1]}` : null;
			const nextLesson = idx + 1 < lessonsIndex.length ? `/lessons/${lessonsIndex[idx + 1]}` : null;
			return {
				status: res.status,
				props: { code, frontmatter, done, prevLesson, nextLesson }
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
	import { goto, prefetchRoutes } from '$app/navigation';
	import Editor from '$lib/components/Editor.svelte';
	import isMatch from 'lodash/isMatch.js';
	import { execute } from '$lib/javascript';
	import { browser } from '$app/env';

	export let code;
	export let frontmatter;
	export let done;
	export let prevLesson;
	export let nextLesson;

	$: if (browser) {
		prefetchRoutes([prevLesson, nextLesson].filter(Boolean));
	}

	$: {
		if (!done) {
			try {
				const { vars } = execute(code);
				done = isMatch(vars, frontmatter.vars || {});
			} catch (err) {
				console.error(err);
			}
		}
	}
</script>

<div class="container">
	<nav class="prev">
		<button disabled={!prevLesson} on:click={() => goto(prevLesson)}>Prev</button>
	</nav>

	<main>
		<Editor width="800px" height="600px" bind:value={code} readOnly={done} />
	</main>

	<nav class="next">
		<button disabled={!done || !nextLesson} on:click={() => goto(nextLesson)}>Next</button>
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

	.prev button {
		background-color: lightgrey;
		color: black;
	}

	.next button {
		background-color: green;
		color: white;
	}

	button:disabled {
		display: none;
	}
</style>
