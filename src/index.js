import * as monaco from "monaco-editor";
import { remark } from "remark";
import * as babelParser from "@babel/parser";

const editorDom = document.getElementById("editor");
const editor = monaco.editor.create(editorDom, {
  language: "javascript",
  minimap: { enabled: false },
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

fetch("/lessons/000-intro.md")
  .then((res) => res.text())
  .then((text) => remark.parse(text))
  .then((markdown) => {
    let comment_open = false;
    let js = "";

    markdown.children.forEach((child) => {
      switch (child.type) {
        case "code":
          if (comment_open) {
            js += "\n*/\n";
            comment_open = false;
          }
          js += child.value;
          break;
        default:
          if (!comment_open) {
            js += "/*\n\n";
            comment_open = true;
          }
          js += remark.stringify(child);
          js += "\n";
          break;
      }
    });
    if (comment_open) {
      js += "*/\n";
      comment_open = false;
    }

    editorModel.setValue(js);
  });

function run(code) {
  const ast = babelParser.parse(code, {
    sourceType: "script",
    attachComment: false,
    errorRecovery: true,
    strictMode: true,
  });
  console.log(ast);

  const out = [];

  // const _console = {
  //   log: (...rest) => out.push([new Date(), "console.log", rest]),
  //   error: (...rest) => out.push([new Date(), "console.error", rest]),
  // };
  //
  // const fn = new Function("window", "document", "console", code);
  // fn({ console: _console }, {}, _console);

  return out;
}
