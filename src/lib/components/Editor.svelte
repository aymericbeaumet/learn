<script>
	import { onMount } from 'svelte';
	import TypeScriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

	export let width;
	export let height;
	export let readOnly = false;
	export let value = '';

	let editor = null;
	let domElement = null;

	$: editor && editor.updateOptions({ readOnly });

	onMount(async () => {
		self.MonacoEnvironment = {
			getWorker: function () {
				return new TypeScriptWorker({ type: 'module' });
			}
		};

		const Monaco = await import('monaco-editor');
		editor = Monaco.editor.create(domElement, {
			readOnly,
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

<div bind:this={domElement} style={`width: ${width}; height: ${height}`} />
