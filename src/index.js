import * as babelParser from "@babel/parser";
import * as monaco from "monaco-editor";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import yaml from "js-yaml";

const editorDom = document.getElementById("editor");
const editor = monaco.editor.create(editorDom, {
  language: "javascript",
  folding: false,
  fontSize: 14,
  guides: { indentation: false },
  minimap: { enabled: false },
});

const editorModel = editor.getModel();
let frontmatter = {};

editorModel.onDidChangeContent(() => {
  try {
    const out = run(editorModel.getValue());
    console.log(JSON.stringify({ frontmatter, out }, null, 2));
  } catch (err) {
    console.error(err);
  }
});

fetch("/lessons/000-intro.md")
  .then((res) => res.text())
  .then((text) =>
    unified().use(remarkParse).use(remarkFrontmatter, ["yaml"]).parse(text)
  )
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

    frontmatter = {};
    markdown.children.forEach((child) => {
      switch (child.type) {
        case "yaml":
          frontmatter = yaml.load(child.value, "utf8");
          break;

        case "heading":
          openComment();
          code.push(" * ");
          code.push(child.children[0].value.toUpperCase());
          code.push("\n\n");
          break;

        case "paragraph":
          openComment();
          code.push(
            unified()
              .use(remarkStringify)
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
    values: {},
  };

  const ast = babelParser.parse(code, {
    sourceType: "script",
    attachComment: false,
    strictMode: true,
  });

  ast.program.body.forEach((node) => {
    if (node.type === "VariableDeclaration") {
      node.declarations.forEach((declaration) => {
        code += `\n/**/;__track__(${JSON.stringify(declaration.id.name)}, ${
          declaration.id.name
        });`;
      });
    }
  });

  const fn = new Function("window", "document", "console", "__track__", code);
  fn(
    // window
    {},
    // document
    {},
    // console
    {
      log: function (...args) {
        out.events.push([new Date(), "console.log", args]);
      },
      error: function (...args) {
        out.events.push([new Date(), "console.error", args]);
      },
    },
    // __track__
    function (ident, value) {
      out.values[ident] = value;
    }
  );

  return out;
}
