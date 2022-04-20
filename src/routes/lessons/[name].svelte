<script>
	import { page } from '$app/stores';
	import Editor from '$lib/components/Editor.svelte';
	import { onMount } from 'svelte';
	import { isMatch } from 'lodash';
	import { execute } from '$lib/javascript';
	import { toJavaScript } from '$lib/markdown';

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
		fetch(`/data/lessons/${$page.params['name']}.md`)
			.then((res) => res.text())
			.then((text) => {
				const [f, c] = toJavaScript(text);
				frontmatter = f;
				code = c;
			});
	});
</script>

<div class="container">
	<main>
		<Editor width="800px" height="600px" bind:value={code} readOnly={done} />
	</main>
	<nav>
		<button title="⌘ + Enter" disabled={!done}>Next</button>
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
