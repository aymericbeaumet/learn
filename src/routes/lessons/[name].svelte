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
					lesson: params.name,
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
	import { goto, prefetch } from '$app/navigation';
	import Editor from '$lib/components/Editor.svelte';
	import isMatch from 'lodash/isMatch.js';
	import { execute } from '$lib/javascript';
	import { browser } from '$app/env';
	import lessonsAll from '$lib/assets/lessons';

	export let done;
	export let code;
	export let frontmatter;
	export let lesson;
	export let lessonIndex;
	export let lessonsCount;
	export let previousLessonURL;
	export let nextLessonURL;

	$: if (browser) {
		prefetch(nextLessonURL);
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
		<div class="progress" style={`width: ${(lessonIndex / lessonsCount) * 100}%;`} />
		<div class="menu">
			<nav>
				{#if previousLessonURL}
					<button on:click={previous} disabled={!enablePrevious}>Previous</button>
				{/if}
			</nav>

			<select bind:value={lesson} on:change={() => goto(`/lessons/${lesson}`)}>
				{#each Object.keys(lessonsAll) as l}
					<option value={l}>{l}</option>
				{/each}
			</select>

			<nav>
				{#if nextLessonURL}
					<button on:click={next} disabled={!enableNext} class="next">Next</button>
				{/if}
			</nav>
		</div>
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
		background: lightgrey;
		display: flex;
		flex-direction: column;
	}

	.progress {
		background: green;
		width: 0;
		height: 4px;
	}

	.menu {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-grow: 1;
	}

	.menu nav {
		width: 80px;
	}

	.menu nav:nth-of-type(1) {
		text-align: right;
		margin-right: 10px;
	}

	.menu nav:nth-of-type(2) {
		text-align: left;
		margin-left: 10px;
	}

	.menu select {
		width: 200px;
	}

	button.next:enabled {
		background: green;
	}
</style>
