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
    let code = [];

    let isComment = false;
    const openComment = () => {
      if (!isComment) {
        isComment = true;
        code.push("/*\n");
      }
    };
    const closeComment = () => {
      if (isComment) {
        isComment = false;
        code.pop(); // remove the last newline
        code.push("\n */\n\n");
      }
    };

    markdown.children.forEach((child) => {
      console.log(child);

      switch (child.type) {
        case "heading":
          openComment();
          code.push(" * ");
          code.push(child.children[0].value.toUpperCase());
          code.push("\n\n");
          break;

        case "paragraph":
          openComment();
          code.push(
            remark
              .stringify(child)
              .trimEnd()
              .split("\n")
              .map((line) => ` * ${line}`)
              .join("\n")
          );
          code.push("\n\n");
          break;

        case "code":
          closeComment();
          code.push(child.value);
          code.push("\n\n");
          break;

        default:
          throw new Error(`unsupported markdown child type ${child.type}`);
      }
    });

    closeComment();
    editorModel.setValue(code.join("").trim());
  });

function run(code) {
  const out = {
    events: [],
    __assert__: {},
    __track__: {},
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
      "__assert__",
      "__track__",
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
      // __assert__
      function (ident, value) {
        out.__assert__[ident] = value;
      },
      // __track__
      function (ident, value) {
        out.__track__[ident] = value;
      }
    );
  } finally {
    return out;
  }
}
