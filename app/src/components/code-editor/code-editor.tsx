import type { EditorView } from "@codemirror/view";
import CodeMirror, { type ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { useEffect, useRef } from "react";
import { scrollToLine } from "./go-to-line";

interface CodeEditorProps extends ReactCodeMirrorProps {
  lineNumber?: number;
  highlightRegExp?: RegExp;
}
export function CodeEditor({
  lineNumber,
  highlightRegExp,
  ...codemirrorProps
}: CodeEditorProps) {
  const editorRef = useRef<EditorView | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to rerender when props change but Biome complains because they're not being used in useEffect.
  useEffect(() => {
    if (editorRef.current && lineNumber !== undefined) {
      const editor = editorRef.current;
      scrollToLine(editor, lineNumber);
    }
  }, [lineNumber, codemirrorProps]);

  return (
    <CodeMirror
      {...codemirrorProps}
      onCreateEditor={(view) => {
        editorRef.current = view;
      }}
    />
  );
}
