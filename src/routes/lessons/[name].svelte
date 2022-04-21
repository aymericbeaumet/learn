<script context="module">
	import { toJavaScript } from '$lib/markdown';
	import lessonsIndex from '$lib/assets/lessons-index.json';

	export async function load({ params, fetch }) {
		const url = `/data/lessons/${params.name}.md`;
		const res = await fetch(url);

		if (res.ok) {
			const { code, frontmatter } = await res.text().then(toJavaScript);
			return {
				status: res.status,
				props: {
					code,
					frontmatter,
					done: false,
					lessonIdx: lessonsIndex.indexOf(params.name)
				}
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
	import Editor from '$lib/components/Editor.svelte';
	import isMatch from 'lodash/isMatch.js';
	import { execute } from '$lib/javascript';

	export let code;
	export let frontmatter;
	export let done;
	export let lessonIdx;

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
	<nav>
		<button
			disabled={!(lessonIdx > 0)}
			on:click={() => goto(`/lessons/${lessonsIndex[lessonIdx - 1]}`)}>Prev</button
		>
	</nav>

	<main>
		<Editor width="800px" height="600px" bind:value={code} readOnly={done} />
	</main>

	<nav>
		<button
			disabled={!(done && lessonIdx < lessonsIndex.length - 1)}
			on:click={() => goto(`/lessons/${lessonsIndex[lessonIdx + 1]}`)}>Next</button
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
