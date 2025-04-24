import { javascript } from "@codemirror/lang-javascript";
import { rust } from "@codemirror/lang-rust";
import type { EditorView } from "@codemirror/view";
import CodeMirror, { type ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { useEffect, useRef } from "react";

interface CodeEditorProps extends ReactCodeMirrorProps {
  lineNumber?: number;
  highlightRegExp?: RegExp;
}
export function CodeEditor({
  lineNumber,
  highlightRegExp,
  extensions,
  ...codemirrorProps
}: CodeEditorProps) {
  const editorRef = useRef<EditorView | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to rerender when props change but Biome complains because they're not being used in useEffect.
  useEffect(() => {
    if (editorRef.current && lineNumber !== undefined) {
      const editor = editorRef.current;
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

      editorRef.current.focus();
    }
  }, [lineNumber, codemirrorProps]);

  return (
    <CodeMirror
      {...codemirrorProps}
      onCreateEditor={(view) => {
        editorRef.current = view;
      }}
      extensions={[
        javascript({ typescript: true, jsx: true }),
        rust(),
        ...(extensions || []),
      ]}
    />
  );
}
