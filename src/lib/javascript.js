import * as babelParser from '@babel/parser';

export function execute(code) {
	const events = [];
	const vars = {};
	const declarations = {};

	const ast = babelParser.parse(code, {
		sourceType: 'script',
		attachComment: false,
		strictMode: true,
	});

	ast.program.body.forEach((node) => {
		if (node.type === 'VariableDeclaration') {
			node.declarations.forEach((declaration) => {
				code += `\n/**/;__track__(${JSON.stringify(declaration.id.name)}, ${declaration.id.name});`;
				declarations[declaration.id.name] = {
					selectionStartLineNumber: declaration.id.loc.start.line,
					selectionStartColumn: declaration.id.loc.start.column + 1,
					positionLineNumber: declaration.id.loc.end.line,
					positionColumn: declaration.id.loc.end.column + 1,
				};
			});
		}
	});

	const fn = new Function('window', 'document', 'console', '__track__', code);
	fn(
		// window
		{},
		// document
		{},
		// console
		{
			log: function (...args) {
				events.push([new Date(), 'console.log', args]);
			},
			error: function (...args) {
				events.push([new Date(), 'console.error', args]);
			},
		},
		// __track__
		function (ident, value) {
			vars[ident] = value;
		},
	);

	return { events, vars, declarations };
}
