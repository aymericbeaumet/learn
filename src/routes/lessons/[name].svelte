<script context="module">
	import lessons from '$lib/assets/lessons';

	export async function load({ params, fetch }) {
		const lesson = lessons[params.name];
		const res = await fetch(lesson.url);

		if (res.ok) {
			const { code, frontmatter } = await res.json();

			// Replace any 'undefined' string with `undefined'
			for (const [key, value] of Object.entries(frontmatter.vars)) {
				if (value === 'undefined') {
					frontmatter.vars[key] = undefined;
				}
			}

			return {
				status: res.status,
				props: {
					done: false,
					code,
					frontmatter,
					lessonIndex: lesson.i,
					lessonsCount: Object.keys(lessons).length,
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
	export let lessonIndex;
	export let lessonsCount;
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

<div class="container">
	<main>
		<Editor bind:value={code} readOnly={done} />
	</main>

	<aside>
		{#if previousLessonURL}
			<button on:click={previous} disabled={!enablePrevious}>Previous</button>
		{/if}
		<span>
			{lessonIndex + 1} / {lessonsCount}
		</span>
		{#if nextLessonURL}
			<button on:click={next} disabled={!enableNext} class="next">Next</button>
		{/if}
	</aside>
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

	button.next:enabled {
		background: green;
	}
</style>
