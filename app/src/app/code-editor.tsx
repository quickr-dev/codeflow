import { javascript } from "@codemirror/lang-javascript";
import { rust } from "@codemirror/lang-rust";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import CodeMirror, {
  type Extension,
  type ReactCodeMirrorProps,
} from "@uiw/react-codemirror";
import { useEffect, useRef } from "react";

interface CodeEditorProps extends ReactCodeMirrorProps {
  lineNumber?: number;
  highlightRegExp?: RegExp;
}

class PlaceholderWidget extends WidgetType {
  private text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  toDOM(view: EditorView): HTMLElement {
    const div = document.createElement("span");
    div.className = "font-bold";
    div.innerHTML = this.text;
    return div;
  }
}

function codeflowHighlighter(regexp: RegExp) {
  const placeholderMatcher = new MatchDecorator({
    regexp: RegExp(`(${regexp.source})`, regexp.flags),
    decoration: (match) =>
      Decoration.replace({
        widget: new PlaceholderWidget(match[1]),
      }),
  });

  return ViewPlugin.fromClass(
    class {
      placeholders: DecorationSet;
      constructor(view: EditorView) {
        this.placeholders = placeholderMatcher.createDeco(view);
      }
      update(update: ViewUpdate) {
        this.placeholders = placeholderMatcher.updateDeco(
          update,
          this.placeholders,
        );
      }
    },
    {
      decorations: (instance) => instance.placeholders,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.placeholders || Decoration.none;
        }),
    },
  );
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
      const line = editorRef.current.state.doc.line(lineNumber).from;

      editorRef.current.dispatch({
        selection: { anchor: line },
        scrollIntoView: true,
      });
      editorRef.current.focus();
    }
  }, [lineNumber, codemirrorProps]);

  const extensions: Extension[] = [
    javascript({ typescript: true, jsx: true }),
    rust(),
  ];
  if (highlightRegExp) {
    extensions.push(codeflowHighlighter(highlightRegExp));
  }
  return (
    <CodeMirror
      {...codemirrorProps}
      onCreateEditor={(view) => {
        editorRef.current = view;
      }}
      extensions={extensions}
    />
  );
}
