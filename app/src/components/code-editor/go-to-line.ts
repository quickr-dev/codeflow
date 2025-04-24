import type { EditorView } from "@codemirror/view";

/**
 * Move the cursor to the `lineNumber` and scroll down a bit
 * to show the line towards the top of the editor.
 */
export function scrollToLine(editor: EditorView, lineNumber: number) {
  const scrollIntoLine = Math.min(lineNumber + 30, editor.state.doc.lines);

  editor.dispatch({
    selection: {
      anchor: editor.state.doc.line(scrollIntoLine).from,
    },
    scrollIntoView: true,
  });

  editor.dispatch({
    selection: {
      anchor: editor.state.doc.line(lineNumber).from,
    },
    scrollIntoView: false,
  });
}
