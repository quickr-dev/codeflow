import { javascript } from "@codemirror/lang-javascript";
import type { EditorView } from "@codemirror/view";
import CodeMirror, { type ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { useEffect, useRef } from "react";

interface CodeEditorProps extends ReactCodeMirrorProps {
  lineNumber?: number;
}

export function CodeEditor({
  lineNumber,
  ...codemirrorProps
}: CodeEditorProps) {
  const editorRef = useRef<EditorView | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Biome complains about the ref in the deps but it doesn't work without it.
  useEffect(() => {
    if (editorRef.current && lineNumber !== undefined) {
      const line = editorRef.current.state.doc.line(lineNumber).from;

      editorRef.current.dispatch({
        selection: { anchor: line },
        scrollIntoView: true,
      });
      editorRef.current.focus();
    }
  }, [lineNumber, editorRef.current]);

  return (
    <CodeMirror
      {...codemirrorProps}
      onCreateEditor={(view) => {
        editorRef.current = view;
      }}
      extensions={[javascript({ typescript: true, jsx: true })]}
    />
  );
}
