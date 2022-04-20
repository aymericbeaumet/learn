import * as monaco from "monaco-editor";
import { remark } from "remark";
import * as babelParser from "@babel/parser";

const editorDom = document.getElementById("editor");
const editor = monaco.editor.create(editorDom, {
  language: "javascript",
  minimap: { enabled: false },
  folding: false,
  guides: {
    indentation: false,
  },
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
            js += " */\n\n";
            comment_open = false;
          }
          js += child.value + "\n\n";
          break;
        default:
          if (!comment_open) {
            js += "/*\n";
            comment_open = true;
          }
          js += remark
            .stringify(child)
            .split("\n")
            .map((line) => ` *  ${line}`)
            .join("\n");
          js += "\n";
          break;
      }
    });
    if (comment_open) {
      js += " */\n\n";
      comment_open = false;
    }

    editorModel.setValue(js);
  });

function run(code) {
  const out = {
    events: [],
    variables: {},
  };

  try {
    const ast = babelParser.parse(code, {
      sourceType: "script",
      attachComment: false,
      strictMode: true,
    });

    ast.program.body.forEach((node) => {
      if (node.type === "VariableDeclaration") {
        node.declarations.forEach((declaration) => {
          code += `\n/**/;__internal__.track(${JSON.stringify(
            declaration.id.name
          )}, ${declaration.id.name});`;
        });
      }
    });

    const fn = new Function(
      "window",
      "document",
      "console",
      "__internal__",
      code
    );
    fn(
      // window
      {},
      // document
      {},
      // console
      {
        log(...args) {
          out.events.push([new Date(), "console.log", args]);
        },
        error(...args) {
          out.events.push([new Date(), "console.error", args]);
        },
      },
      // __internal__
      {
        track(ident, value) {
          out.variables[ident] = value;
        },
      }
    );
  } finally {
    return out;
  }
}
