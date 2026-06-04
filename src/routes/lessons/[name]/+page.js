import { error } from '@sveltejs/kit';
import lessons from '$lib/assets/lessons';

export const prerender = true;

export function entries() {
	return Object.keys(lessons).map((name) => ({ name }));
}

export async function load({ params, fetch }) {
	const lesson = lessons[params.name];
	if (!lesson) {
		error(404, `unknown lesson ${params.name}`);
	}

	const res = await fetch(lesson.url);
	if (!res.ok) {
		error(res.status, `could not load ${lesson.url}`);
	}

	const { code, frontmatter = {} } = await res.json();

	for (const [key, value] of Object.entries(frontmatter.assert || {})) {
		if (value === 'undefined') {
			frontmatter.assert[key] = undefined;
		}
	}

	return {
		done: false,
		code,
		frontmatter,
		lesson: params.name,
		lessonIndex: lesson.i,
		lessonsCount: Object.keys(lessons).length,
		previousLessonURL: lesson.previous ? `/lessons/${lesson.previous}` : '',
		nextLessonURL: lesson.next ? `/lessons/${lesson.next}` : '',
	};
}
