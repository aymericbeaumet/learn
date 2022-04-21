<script>
	import { onMount } from 'svelte';
	import TypeScriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

	export let width;
	export let height;
	export let value;
	export let readOnly = false;

	let editor = null;
	let domElement = null;

	$: if (editor && value !== editor.getValue()) {
		editor.setValue(value);
		editor.setScrollPosition({ scrollTop: 0 });
		editor.setPosition({ column: 1, lineNumber: 1 });
	}

	$: if (editor) {
		if (readOnly) {
			document.activeElement.blur();
			editor.updateOptions({ readOnly: true });
		} else {
			editor.updateOptions({ readOnly: false });
		}
	}

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
			theme: 'vs-dark',
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
