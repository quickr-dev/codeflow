import {
  Decoration,
  type DecorationSet,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { createRoot } from "react-dom/client";

/**
 * Highlights @codeflow annotations
 */
export function codeflowHighlighter(path: string) {
  const regexp = new RegExp(`@codeflow\\((${path}(#\\d+)?)\\)`, "g");

  const placeholderMatcher = new MatchDecorator({
    regexp,
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

class PlaceholderWidget extends WidgetType {
  private path: string;

  constructor(path: string) {
    super();
    this.path = path;
  }

  toDOM(): HTMLElement {
    const container = document.createElement("span");
    const root = createRoot(container);
    root.render(<CodeflowAnnotation path={this.path} />);

    return container;
  }
}

const CodeflowAnnotation = ({ path }: { path: string }) => {
  return (
    <span className="px-1 py-0.5 bg-violet-100 text-violet-700 rounded text-xs">
      @codeflow(<span className="font-bold">{path}</span>)
    </span>
  );
};
