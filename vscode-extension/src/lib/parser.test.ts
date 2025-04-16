import { describe, expect, test } from "bun:test";
import { parseCodeflowDefinition } from "./parser"; // Update this import to match your file structure

describe("parseCodeflowLine", () => {
  describe("syntax", () => {
    test("parses basic path definition", () => {
      const input = "@codeflow(diagram->view#2)";
      const result = parseCodeflowDefinition(input);

      expect(result.pathDefinition).toBe("diagram->view#2");
      expect(result.options).toEqual({});
    });

    test("parses path definition with options", () => {
      const input = "@codeflow(diagram->view#2, { lines: 1 })";
      const result = parseCodeflowDefinition(input);

      expect(result.pathDefinition).toBe("diagram->view#2");
      expect(result.options).toEqual({ lines: 1 });
    });

    test("handles whitespace in input", () => {
      const input = "      @codeflow(  diagram->view#2 , {lines:1    }  )";
      const result = parseCodeflowDefinition(input);

      expect(result.pathDefinition).toBe("diagram->view#2");
      expect(result.options).toEqual({ lines: 1 });
    });

    test("ignores characters unrelated to the codeflow definition", () => {
      const input = "  // @codeflow(diagram->view#2)###";
      const result = parseCodeflowDefinition(input);

      expect(result.pathDefinition).toBe("diagram->view#2");
      expect(result.options).toEqual({});
    });

    test("handles multiple options", () => {
      const input =
        "// @codeflow(path->to->view, { lines: 10, description: 'something' })";
      const result = parseCodeflowDefinition(input);

      expect(result.pathDefinition).toBe("path->to->view");
      expect(result.options).toEqual({ lines: 10, description: "something" });
    });

    test("throws error for invalid syntax", () => {
      const input = "// @codeflow";
      expect(() => parseCodeflowDefinition(input)).toThrow(
        "Codeflow syntax error: usage: @codeflow(path[, opts])",
      );
    });
  });

  describe("params", () => {
    test("first param is the path definition", () => {
      const input = "// @codeflow(diagram->view#2, { count: 5 })";
      const result = parseCodeflowDefinition(input);

      expect(result.pathDefinition).toBe("diagram->view#2");
    });

    test("second param is an object of options", () => {
      const input = "// @codeflow(diagram, {})";
      const result = parseCodeflowDefinition(input);

      expect(result.options).toEqual({});
    });

    describe("options", () => {
      test("returns empty if not specified", () => {
        const input = "// @codeflow(diagram)";
        const result = parseCodeflowDefinition(input);

        expect(result.options).toEqual({});
      });

      test("accepts lines key", () => {
        const input = "// @codeflow(diagram, { lines: 2 })";
        const result = parseCodeflowDefinition(input);

        expect(result.options).toEqual({ lines: 2 });
      });

      test("validates lines is an integer", () => {
        const input = "// @codeflow(diagram, { lines: '2' })";

        expect(() => parseCodeflowDefinition(input)).toThrow(
          "Codeflow syntax error: lines must be an integer",
        );
      });
    });
  });
});
