import type { EditorView } from "@codemirror/view";

export function scrollToLine(editor: EditorView, lineNumber: number) {
  const scrollIntoLine = Math.min(lineNumber + 30, editor.state.doc.lines);

  editor.dispatch({
    selection: {
      anchor: editor.state.doc.line(scrollIntoLine).from,
    },
    scrollIntoView: true,
  });
}
