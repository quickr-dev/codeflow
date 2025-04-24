import { html } from "@codemirror/lang-html";
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
  if (/(js|jsx|ts|tsx)$/.test(fileName))
    return javascript({ typescript: true, jsx: true });

  if (fileName.endsWith("rb")) return rubyLang;
  if (fileName.endsWith("rs")) return rust();
  if (/html/.test(fileName)) return html();

  return syntaxHighlighting(defaultHighlightStyle, { fallback: true });
}
