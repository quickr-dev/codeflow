import { describe, expect, test } from "bun:test";
import { extractAnnotations } from "./fileScanner";

describe("FileScanner", () => {
  test("extractAnnotations finds annotations in content", () => {
    const content = `
    // This is a test file
    function test() {
      // @codeflow task_manager->undo_task->button
      console.log('test');
      // Here's another annotation
      // @codeflow task_manager->undo_task->button->action
    }

    // @codeflow diagram->nodes
    const x = 5;
    `;

    const annotations = extractAnnotations(content, "test.js");

    expect(annotations).toHaveLength(3);
    expect(annotations[0].path).toBe("task_manager->undo_task->button");
    expect(annotations[0].lineNumber).toBe(3);
    expect(annotations[1].path).toBe("task_manager->undo_task->button->action");
    expect(annotations[1].lineNumber).toBe(6);
    expect(annotations[2].path).toBe("diagram->nodes");
    expect(annotations[2].lineNumber).toBe(9);
  });

  test("extractAnnotations handles multiple annotations on one line", () => {
    const content = `
    // This line has two: @codeflow path1->path2 and @codeflow path3->path4
    `;

    const annotations = extractAnnotations(content, "test.js");

    expect(annotations).toHaveLength(2);
    expect(annotations[0].path).toBe("path1->path2");
    expect(annotations[1].path).toBe("path3->path4");
    expect(annotations[0].lineNumber).toBe(1);
    expect(annotations[1].lineNumber).toBe(1);
  });

  test("extractAnnotations ignores invalid annotations", () => {
    const content = `
    // This is not a valid annotation: @codeflow
    // This has no whitespace @codeflowpath1->path2
    `;

    const annotations = extractAnnotations(content, "test.js");

    expect(annotations).toHaveLength(0);
  });
});
