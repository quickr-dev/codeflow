interface CodeflowParams {
  pathDefinition: string;
  options: Record<string, string>;
}

/**
 * Parses a @codeflow definition into params.
 *
 * ### Example
 *
 * ```ts
 * parseCodeflowDefinition("@codeflow(diagram->view#2, { lines: 1 })");
 * // { pathDefinition: "diagram->view#2", options: { lines: 1 } }
 * ```
 *
 * ### Path definition
 *
 * The path definition is the first part of the @codeflow definition, e.g. "diagram->view#2"
 * Dot notation (e.g. diagram.view): TODO
 * Arrow notation (e.g. diagram->view): TODO
 *
 * ### Options
 *
 * - lines: number of lines to display after the @codeflow definition. Default: 15
 */
export function parseCodeflowDefinition(input: string): CodeflowParams {
  const match = input.match(/@codeflow\(([^)]+)\)/);
  if (!match) {
    throw new Error("Codeflow syntax error: usage: @codeflow(path[, opts])");
  }

  const parts = match[1].split(",").map((param) => param.trim());
  const pathDefinition = parts[0];
  const optionsDefinition = parts.slice(1).join(",") || "{}";
  const options = eval(`(${optionsDefinition})`);
  if (options.lines && !Number.isInteger(options.lines)) {
    throw new Error("Codeflow syntax error: lines must be an integer");
  }

  return { pathDefinition, options };
}
