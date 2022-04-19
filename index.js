import * as monaco from "monaco-editor";

const editorRoot = document.getElementById("editor");
const editor = monaco.editor.create(editorRoot, {
  language: "javascript",
  cursorSurroundingLines: 5,
  folding: false,
  fontSize: "13px",
  glyphMargin: false,
  lineDecorationsWidth: 0,
  lineNumbers: "off",
  lineNumbersMinChars: 2,
  minimap: { enabled: false },
  occurrencesHighlight: false,
  overviewRulerLanes: 0,
  renderFinalNewline: false,
  renderIndentGuides: false,
  renderLineHighlight: "none",
  scrollBeyondLastLine: false,
  selectionHighlight: false,
});
const editorModel = editor.getModel();

editorModel.onDidChangeContent(() => {
  try {
    const out = run(editorModel.getValue());
    console.log(JSON.stringify(out, null, 2));
  } catch (err) {
    console.error(err);
  }
});

function run(code) {
  const out = {
    logs: [],
    errors: [],
  };

  const console = {
    log: (...rest) => out.logs.push([new Date(), rest]),
    error: (...rest) => out.errors.push([new Date(), rest]),
  };

  const fn = new Function("window", "document", "console", code);
  fn({ console }, {}, console);

  return out;
}
