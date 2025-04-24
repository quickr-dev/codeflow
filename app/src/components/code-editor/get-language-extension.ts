import { javascript } from "@codemirror/lang-javascript";
import { rust } from "@codemirror/lang-rust";
import {
  StreamLanguage,
  defaultHighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { ruby } from "@codemirror/legacy-modes/mode/ruby";
import type { Extension } from "@uiw/react-codemirror";

const rubyLang = StreamLanguage.define(ruby);

export function getLanguageExtension(fileName: string): Extension {
  const ext = fileName.split(".").pop() ?? "";

  switch (ext) {
    case "rb":
      return rubyLang;
    case "rs":
      return rust();
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return javascript({
        typescript: ext === "ts" || ext === "tsx",
        jsx: true,
      });
    default:
      return syntaxHighlighting(defaultHighlightStyle, { fallback: true });
  }
}
