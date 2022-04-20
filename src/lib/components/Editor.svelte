<script>
	import { onMount } from 'svelte';
	import TypeScriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

	export let value = '';

	let domElement = null;

	onMount(async () => {
		self.MonacoEnvironment = {
			getWorker: function () {
				return new TypeScriptWorker({ type: 'module' });
			}
		};

		const Monaco = await import('monaco-editor');
		const editor = Monaco.editor.create(domElement, {
			value,
			language: 'javascript',
			folding: false,
			fontSize: 13,
			guides: { indentation: false },
			minimap: { enabled: false }
		});
		const editorModel = editor.getModel();

		editorModel.onDidChangeContent(() => {
			value = editorModel.getValue();
		});

		return () => {
			editor.dispose();
		};
	});
</script>

<div bind:this={domElement} />

<style>
	div {
		width: 800px;
		height: 600px;
		border: 1px solid #ccc;
	}
</style>
