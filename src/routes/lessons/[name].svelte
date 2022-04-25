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

	let vars = {};

	$: if (browser) {
		prefetch(nextLessonURL);
	}

	$: {
		if (!done) {
			try {
				const out = execute(code);
				done = isMatch(out.vars, frontmatter.vars || {});
				vars = out.vars;
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

		<aside>
			<table>
				<caption>Variables</caption>
				<thead>
					<tr>
						<th scope="col">Identifier</th>
						<th scope="col">Value</th>
						<th scope="col">Type</th>
					</tr>
				</thead>
				<tbody>
					{#each Object.keys(vars).sort() as ident}
						{@const value = vars[ident]}
						<tr>
							<td><pre>{ident}</pre></td>
							<td><pre>{value}</pre></td>
							<td><pre>{typeof value}</pre></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</aside>
	</main>

	<nav>
		<div class="progress" style={`width: ${(lessonIndex / lessonsCount) * 100}%;`} />
		<div class="menu">
			<div class="previous">
				{#if previousLessonURL}
					<button on:click={previous} disabled={!enablePrevious}>Previous</button>
				{/if}
			</div>

			<div>
				<select bind:value={lesson} on:change={() => goto(`/lessons/${lesson}`)}>
					{#each Object.keys(lessonsAll) as l}
						<option value={l}>{l}</option>
					{/each}
				</select>
			</div>

			<div class="next">
				{#if nextLessonURL}
					<button on:click={next} disabled={!enableNext}>Next</button>
				{/if}
			</div>
		</div>
	</nav>
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
		display: flex;
		flex-direction: row;
	}

	aside {
		width: 400px;
		border-left: 2px solid gray;
		padding: 10px 30px;
	}

	aside table {
		table-layout: fixed;
		border-collapse: collapse;
	}

	aside th,
	aside td {
		padding: 5px;
		border: 1px solid black;
	}

	nav {
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

	.menu .previous,
	.menu .next {
		width: 80px;
	}

	.menu .previous {
		text-align: right;
		margin-right: 10px;
	}

	.menu .next {
		text-align: left;
		margin-left: 10px;
	}

	.menu select {
		width: 200px;
	}

	.next button:enabled {
		background: green;
	}
</style>
