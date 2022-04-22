<script context="module">
	import Modal from '$lib/components/Modal.svelte';
	import lessons from '$lib/assets/lessons';

	export async function load({ params, fetch }) {
		const lesson = lessons[params.name];
		const res = await fetch(lesson.url);

		if (res.ok) {
			const { code, frontmatter } = await res.json();
			return {
				status: res.status,
				props: {
					done: false,
					code,
					frontmatter,
					previousLessonURL: lesson.previous ? `/lessons/${lesson.previous}` : '',
					nextLessonURL: lesson.next ? `/lessons/${lesson.next}` : '',
				},
			};
		} else {
			return {
				status: res.status,
				error: new Error(`could not load ${lesson.url}`),
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

	export let done;
	export let code;
	export let frontmatter;
	export let previousLessonURL;
	export let nextLessonURL;

	$: if (browser) {
		prefetchRoutes([previousLessonURL, nextLessonURL]);
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

	$: enablePrevious = previousLessonURL;
	$: enableNext = done && nextLessonURL;

	function onKeyDown(event) {
		if (event.metaKey && event.key === 'Enter') {
			next(event);
			return;
		}
	}

	function previous(event) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		if (enablePrevious) {
			goto(previousLessonURL);
		}
	}

	function next(event) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		if (enableNext) {
			goto(nextLessonURL);
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<div class="container">
	<main>
		<Editor bind:value={code} readOnly={done} />
	</main>

	<aside>
		{#if previousLessonURL}
			<button on:click={previous} disabled={!enablePrevious}>Previous</button>
		{/if}
		{#if nextLessonURL}
			<button on:click={next} disabled={!enableNext}>Next</button>
		{/if}
	</aside>

	{#if done}
		<Modal>
			<div class="modal">
				<h1>Congratulations!</h1>

				{#if nextLessonURL}
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
