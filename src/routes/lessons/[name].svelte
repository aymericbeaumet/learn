<script context="module">
	import { toJavaScript } from '$lib/markdown';
	import lessonsIndex from '$lib/assets/lessons-index.json';
	import Modal from '$lib/components/Modal.svelte';

	export async function load({ params, fetch }) {
		const url = `/data/lessons/${params.name}.md`;
		const res = await fetch(url);

		const lessonIndex = lessonsIndex.indexOf(params.name);
		const lessonsCount = lessonsIndex.length;

		if (res.ok) {
			const { code, frontmatter } = await res.text().then(toJavaScript);
			const done = false;
			const previousLesson =
				lessonIndex - 1 >= 0 ? `/lessons/${lessonsIndex[lessonIndex - 1]}` : null;
			const nextLesson =
				lessonIndex + 1 < lessonsIndex.length ? `/lessons/${lessonsIndex[lessonIndex + 1]}` : null;
			return {
				status: res.status,
				props: {
					code,
					frontmatter,
					done,
					lessonIndex,
					lessonsCount,
					previousLesson,
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
	export let lessonIndex;
	export let lessonsCount;
	export let previousLesson;
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

	$: canPrevious = previousLesson;
	$: canNext = done && nextLesson;

	function onKeyDown(event) {
		if (event.key === 'Enter') {
			next(event);
			return;
		}
	}

	function previous(event) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		if (canPrevious) {
			goto(previousLesson);
		}
	}

	function next(event) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		if (canNext) {
			goto(nextLesson);
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<div class="container">
	<main>
		<Editor bind:value={code} readOnly={done} />
	</main>

	<aside>
		{#if previousLesson}
			<button on:click={previous} disabled={!canPrevious}>Previous</button>
		{/if}
		<span>{lessonIndex + 1} / {lessonsCount}</span>
		{#if nextLesson}
			<button on:click={next} disabled={!canNext}>Next</button>
		{/if}
	</aside>

	{#if done}
		<Modal>
			<div class="modal">
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
</div>

<style>
	.container {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex-grow: 1;
	}

	aside {
		height: 40px;
		border-top: 5px solid green;
		background: lightgrey;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal {
		background-color: lightgrey;
		border-radius: 10px;
		padding: 10px 20px;
	}

	.modal input[type='submit'] {
		border-radius: 5px;
		padding: 10px 20px;
		background: green;
	}
</style>
