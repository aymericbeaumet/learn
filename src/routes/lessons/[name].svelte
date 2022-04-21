<script context="module">
	import { toJavaScript } from '$lib/markdown';
	import lessonsIndex from '$lib/assets/lessons-index.json';
	import Modal from '$lib/components/Modal.svelte';

	export async function load({ params, fetch }) {
		const url = `/data/lessons/${params.name}.md`;
		const res = await fetch(url);

		const idx = lessonsIndex.indexOf(params.name);

		if (res.ok) {
			const { code, frontmatter } = await res.text().then(toJavaScript);
			const done = false;
			const nextLesson = idx + 1 < lessonsIndex.length ? `/lessons/${lessonsIndex[idx + 1]}` : null;
			return {
				status: res.status,
				props: {
					code,
					frontmatter,
					done,
					nextLesson,
				},
			};
		} else {
			return {
				status: res.status,
				error: new Error(`could not load ${url}`),
			};
		}
	}
</script>

<script>
	import { goto, prefetch } from '$app/navigation';
	import Editor from '$lib/components/Editor.svelte';
	import isMatch from 'lodash/isMatch.js';
	import { execute } from '$lib/javascript';
	import { browser } from '$app/env';

	export let code;
	export let frontmatter;
	export let done;
	export let nextLesson;

	$: if (browser) {
		prefetch(nextLesson);
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

	function onKeyDown(event) {
		if (event.key === 'Enter' && event.metaKey) {
			next(event);
			return;
		}
	}

	function next(event) {
		event.preventDefault();
		event.stopPropagation();

		if (done && nextLesson) {
			goto(nextLesson);
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<main>
	<Editor bind:value={code} readOnly={done} />
	{#if done}
		<Modal>
			<div>
				<h1>Congratulations!</h1>

				{#if nextLesson}
					<form on:submit={next}>
						<input type="submit" value="Move on to the next lesson" title="⌘ + Enter" />
					</form>
				{:else}
					<p>You have finished the course!</p>
				{/if}
			</div>
		</Modal>
	{/if}
</main>

<style>
	main {
		width: 100%;
		height: 100vh;
	}

	div {
		background-color: lightgrey;
		border-radius: 10px;
		padding: 10px 20px;
	}

	input[type='submit'] {
		border-radius: 5px;
		padding: 10px 20px;
		background: green;
	}
</style>
