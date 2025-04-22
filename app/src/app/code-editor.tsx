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

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to rerender when props change but Biome complains because they're not being used in useEffect.
  useEffect(() => {
    if (editorRef.current && lineNumber !== undefined) {
      const line = editorRef.current.state.doc.line(lineNumber).from;

      editorRef.current.dispatch({
        selection: { anchor: line },
        scrollIntoView: true,
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
      extensions={[javascript({ typescript: true, jsx: true })]}
    />
  );
}
