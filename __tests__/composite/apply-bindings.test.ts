import { describe, it, expect } from "vitest";
import { applyBindings } from "@/lib/composite/render";
import type { PrimitiveNode, PropBinding } from "@/lib/composite/types";

describe("applyBindings", () => {
  const baseNodes: PrimitiveNode[] = [
    {
      id: "h1",
      type: "heading",
      props: { text: "Default Title", level: 1 },
    },
    {
      id: "p1",
      type: "paragraph",
      props: { text: "Default body" },
    },
  ];

  it("applies a simple string binding", () => {
    const bindings: PropBinding[] = [
      {
        propKey: "title",
        label: "Title",
        type: "string",
        required: true,
        targetPath: [0, "props", "text"],
      },
    ];
    const result = applyBindings(baseNodes, bindings, { title: "Custom Title" });
    expect(result[0].props.text).toBe("Custom Title");
    expect(result[1].props.text).toBe("Default body");
  });

  it("does not mutate the original nodes", () => {
    const bindings: PropBinding[] = [
      {
        propKey: "title",
        label: "Title",
        type: "string",
        required: true,
        targetPath: [0, "props", "text"],
      },
    ];
    applyBindings(baseNodes, bindings, { title: "Changed" });
    expect(baseNodes[0].props.text).toBe("Default Title");
  });

  it("uses binding default when prop is not provided", () => {
    const bindings: PropBinding[] = [
      {
        propKey: "title",
        label: "Title",
        type: "string",
        required: false,
        default: "Fallback Title",
        targetPath: [0, "props", "text"],
      },
    ];
    const result = applyBindings(baseNodes, bindings, {});
    expect(result[0].props.text).toBe("Fallback Title");
  });

  it("skips binding when prop is undefined and no default", () => {
    const bindings: PropBinding[] = [
      {
        propKey: "missing",
        label: "Missing",
        type: "string",
        required: false,
        targetPath: [0, "props", "text"],
      },
    ];
    const result = applyBindings(baseNodes, bindings, {});
    expect(result[0].props.text).toBe("Default Title");
  });

  it("handles multiple bindings", () => {
    const bindings: PropBinding[] = [
      {
        propKey: "title",
        label: "Title",
        type: "string",
        required: true,
        targetPath: [0, "props", "text"],
      },
      {
        propKey: "body",
        label: "Body",
        type: "string",
        required: true,
        targetPath: [1, "props", "text"],
      },
    ];
    const result = applyBindings(baseNodes, bindings, {
      title: "New Title",
      body: "New Body",
    });
    expect(result[0].props.text).toBe("New Title");
    expect(result[1].props.text).toBe("New Body");
  });

  it("handles nested children paths", () => {
    const nestedNodes: PrimitiveNode[] = [
      {
        id: "c1",
        type: "container",
        props: {},
        children: [{ id: "h1", type: "heading", props: { text: "Nested Title" } }],
      },
    ];
    const bindings: PropBinding[] = [
      {
        propKey: "title",
        label: "Title",
        type: "string",
        required: true,
        targetPath: [0, "children", 0, "props", "text"],
      },
    ];
    const result = applyBindings(nestedNodes, bindings, { title: "Updated" });
    expect(result[0].children![0].props.text).toBe("Updated");
  });

  it("returns unmodified clone with empty bindings", () => {
    const result = applyBindings(baseNodes, [], {});
    expect(result).toEqual(baseNodes);
    expect(result).not.toBe(baseNodes);
  });
});
