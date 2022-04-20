<script context="module">
	import { toJavaScript } from '$lib/markdown';

	export async function load({ params, fetch }) {
		const res = await fetch(`/data/lessons/${params.name}.md`);
		return {
			status: res.status,
			props: res.ok && (await res.text().then(toJavaScript))
		};
	}
</script>

<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Editor from '$lib/components/Editor.svelte';
	import { isMatch } from 'lodash';
	import { execute } from '$lib/javascript';
	import lessonsIndex from '$lib/assets/lessons-index.json';

	export let code;
	export let frontmatter;

	const lessonIdx = lessonsIndex.indexOf($page.params.name);

	let done = false;

	$: {
		try {
			if (!done) {
				const { values } = execute(code);
				done = isMatch(values, frontmatter.expect);
			}
		} catch (err) {
			console.error(err);
		}
	}
</script>

<div class="container">
	<main>
		<Editor width="800px" height="600px" bind:value={code} readOnly={done} />
	</main>
	<nav>
		<button
			disabled={!(done && lessonIdx >= 0 && lessonIdx < lessonsIndex.length - 1)}
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
