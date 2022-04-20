import { unified } from 'unified';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import yaml from 'js-yaml';

export function toJavaScript(md) {
	const ast = unified().use(remarkParse).use(remarkFrontmatter, ['yaml']).parse(md);

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

			case 'thematicBreak':
				closeComment();
				openComment();
				break;

			case 'heading':
				openComment();
				code.push(' * ');
				code.push(child.children[0].value.toUpperCase());
				code.push('\n\n');
				break;

			case 'paragraph':
				openComment();
				code.push(
					unified()
						.use(remarkStringify)
						.stringify(child)
						.trimEnd()
						.split('\n')
						.map((line) => ` * ${line}`)
						.join('\n')
				);
				code.push('\n\n');
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
		frontmatter
	};
}
