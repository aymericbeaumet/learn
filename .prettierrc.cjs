module.exports = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'all',
	printWidth: 100,
	overrides: [
		{
			files: '**/*.md',
			options: {
				printWidth: 80 - ' *  '.length,
				proseWrap: 'always',
			},
		},
	],
};
