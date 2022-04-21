import { unified } from 'unified';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import yaml from 'js-yaml';
import pad from 'lodash/pad.js';

export function toJavaScript(markdown) {
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
				console.log(child);
				closeComment();
				code.push('// Task');
				if (child.children.length >= 2) {
					code.push('s');
				}
				code.push(':\n');
				code.push(
					unified()
						.use(remarkStringify)
						.stringify(child)
						.trimEnd()
						.split('\n')
						.map((line) => `// - ${line.slice(4)}`)
						.join('\n'),
				);
				code.push('\n\n');
				break;

			case 'blockquote':
				closeComment();
				code.push(
					unified()
						.use(remarkStringify)
						.stringify(child)
						.trimEnd()
						.split('\n')
						.map((line) => `// ${line.slice(2)}`)
						.join('\n'),
				);
				code.push('\n\n');
				break;

			case 'thematicBreak':
				closeComment();
				openComment();
				break;

			case 'heading':
				openComment();
				code.push(' *  ');
				code.push(pad(child.children[0].value.toUpperCase(), 80).trimEnd());
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
