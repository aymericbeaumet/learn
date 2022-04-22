#!/usr/bin/env node

import { unified } from 'unified';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import yaml from 'js-yaml';
import pad from 'lodash/pad.js';
import fs from 'fs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const lessonsInputDir = path.join(__dirname, '../lessons/');
const lessonsOutputDir = path.join(__dirname, '../src/lib/assets/lessons/');

// Create output directory
fs.mkdir(lessonsOutputDir, { recursive: true, mode: 0o755 }, function (err) {
	if (err) {
		throw err;
	}

	// List lessons
	fs.readdir(lessonsInputDir, function (err, files) {
		if (err) {
			throw err;
		}

		let done = 0;

		// Read lessons
		for (const file of files) {
			const lessonInputFile = path.join(lessonsInputDir, file);
			fs.readFile(lessonInputFile, function (err, markdown) {
				if (err) {
					throw err;
				}

				// Compile lesson
				const lessonOutputFile = path.join(lessonsOutputDir, path.parse(file).name) + '.json';
				const { code, frontmatter } = compile(markdown.toString());
				fs.writeFile(
					lessonOutputFile,
					JSON.stringify({ code, frontmatter }, null, 2),
					function (err) {
						if (err) {
							throw err;
						}

						console.log(lessonOutputFile);
						done += 1;

						// Build index.js
						if (done === files.length) {
							const lessons = files.map((f) => path.parse(f).name).sort();
							let imports = [];
							let exportDefault = [
								`export const firstLesson = ${JSON.stringify(lessons[0])};\n`,
								`export const lastLesson = ${JSON.stringify(lessons[lessons.length - 1])};\n\n`,
								'export default {\n',
							];
							for (let i = 0; i < lessons.length; i++) {
								const lesson = lessons[i];
								const identifier = `lesson${i}URL`;
								const previous = i - 1 >= 0 ? lessons[i - 1] : '';
								const next = i + 1 < lessons.length ? lessons[i + 1] : '';
								imports.push(
									`import ${identifier} from ${JSON.stringify(`./${lesson}.json?url`)};\n`,
								);
								exportDefault.push(
									`  ${JSON.stringify(
										lesson,
									)}: { i: ${i}, url: ${identifier}, previous: ${JSON.stringify(
										previous,
									)}, next: ${JSON.stringify(next)} },\n`,
								);
							}
							imports.push('\n');
							exportDefault.push('};\n');

							// Write index.js
							const indexOutputFile = path.join(lessonsOutputDir, 'index.js');
							fs.writeFile(
								indexOutputFile,
								imports.join('') + exportDefault.join(''),
								function (err) {
									if (err) {
										throw err;
									}
									console.log(indexOutputFile);
								},
							);
						}
					},
				);
			});
		}
	});
});

export function compile(markdown) {
	const ast = unified()
		.use(remarkParse)
		.use(remarkFrontmatter, ['yaml'])
		.use(remarkGfm)
		.parse(markdown);

	let code = [];
	let frontmatter = {};

	let isComment = false;
	const openComment = () => {
		if (!isComment) {
			isComment = true;
			code.push('/*\n');
		}
	};
	const closeComment = () => {
		if (isComment) {
			isComment = false;
			code.pop(); // remove the last newline
			code.push('\n */\n\n');
		}
	};

	ast.children.forEach((child) => {
		switch (child.type) {
			case 'yaml':
				frontmatter = yaml.load(child.value, 'utf8');
				break;

			case 'list':
				closeComment();
				code.push('// Tasks:\n');
				code.push(
					unified()
						.use(remarkStringify, { bullet: '-', listItemIndent: 'one' })
						.stringify(child)
						.trimEnd()
						.split('\n')
						.map((line) => `//   ${line}`)
						.join('\n'),
				);
				code.push('\n\n');
				break;

			case 'heading':
				closeComment();
				openComment();
				code.push(' *  ');
				if (child.depth === 1) {
					code.push(pad(child.children[0].value.toUpperCase(), 80).trimEnd());
				} else {
					code.push(child.children[0].value.toUpperCase());
				}
				code.push('\n *\n');
				break;

			case 'paragraph':
				openComment();
				code.push(
					unified()
						.use(remarkStringify)
						.stringify(child)
						.trimEnd()
						.split('\n')
						.map((line) => ` *  ${line}`)
						.join('\n'),
				);
				code.push('\n *\n');
				break;

			case 'code':
				closeComment();
				code.push(child.value);
				code.push('\n\n');
				break;

			default:
				throw new Error(`unsupported markdown child type ${child.type}`);
		}
	});

	closeComment();

	return {
		code: code.join('').trim(),
		frontmatter,
	};
}
