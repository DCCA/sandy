import { describe, it, expect } from "vitest";
import {
  findNode,
  insertNode,
  removeNode,
  moveNode,
  updateNodeProps,
  depthOf,
  MAX_NEST_DEPTH,
} from "@/lib/composite/tree";
import type { PrimitiveNode } from "@/lib/composite/types";

const node = (id: string, type: PrimitiveNode["type"] = "heading"): PrimitiveNode => ({
  id,
  type,
  props: { text: id },
  ...(type === "container" ? { children: [] } : {}),
});

/** a, then box[b, inner[c]] */
function tree(): PrimitiveNode[] {
  return [
    node("a"),
    {
      ...node("box", "container"),
      children: [node("b"), { ...node("inner", "container"), children: [node("c")] }],
    },
  ];
}

describe("findNode", () => {
  it("finds a top-level node", () => {
    expect(findNode(tree(), "a")?.id).toBe("a");
  });

  it("finds a deeply nested node", () => {
    expect(findNode(tree(), "c")?.id).toBe("c");
  });

  it("returns null when the id is absent", () => {
    expect(findNode(tree(), "nope")).toBeNull();
  });
});

describe("insertNode", () => {
  it("appends to the top level when no parent is given", () => {
    const next = insertNode(tree(), null, node("new"));

    expect(next.map((n) => n.id)).toEqual(["a", "box", "new"]);
  });

  it("appends into the named container", () => {
    const next = insertNode(tree(), "box", node("new"));

    expect(findNode(next, "box")?.children?.map((n) => n.id)).toEqual(["b", "inner", "new"]);
  });

  it("appends into a nested container", () => {
    const next = insertNode(tree(), "inner", node("new"));

    expect(findNode(next, "inner")?.children?.map((n) => n.id)).toEqual(["c", "new"]);
  });

  it("does not mutate the input", () => {
    const original = tree();
    insertNode(original, "box", node("new"));

    expect(findNode(original, "box")?.children).toHaveLength(2);
  });

  it("refuses to nest into a non-container", () => {
    const next = insertNode(tree(), "a", node("new"));

    expect(findNode(next, "new")).toBeNull();
  });
});

describe("removeNode", () => {
  it("removes a top-level node", () => {
    expect(removeNode(tree(), "a").map((n) => n.id)).toEqual(["box"]);
  });

  it("removes a nested node", () => {
    const next = removeNode(tree(), "b");

    expect(findNode(next, "b")).toBeNull();
    expect(findNode(next, "box")?.children?.map((n) => n.id)).toEqual(["inner"]);
  });

  it("removes a container along with its children", () => {
    const next = removeNode(tree(), "box");

    expect(findNode(next, "c")).toBeNull();
    expect(next.map((n) => n.id)).toEqual(["a"]);
  });

  it("does not mutate the input", () => {
    const original = tree();
    removeNode(original, "b");

    expect(findNode(original, "b")).not.toBeNull();
  });
});

describe("moveNode", () => {
  it("reorders within the top level", () => {
    expect(moveNode(tree(), "box", "up").map((n) => n.id)).toEqual(["box", "a"]);
  });

  it("reorders within a container, not across parents", () => {
    const next = moveNode(tree(), "inner", "up");

    expect(findNode(next, "box")?.children?.map((n) => n.id)).toEqual(["inner", "b"]);
    expect(next.map((n) => n.id)).toEqual(["a", "box"]);
  });

  it("is a no-op at the start of its sibling list", () => {
    expect(moveNode(tree(), "a", "up").map((n) => n.id)).toEqual(["a", "box"]);
  });

  it("is a no-op at the end of its sibling list", () => {
    const next = moveNode(tree(), "inner", "down");

    expect(findNode(next, "box")?.children?.map((n) => n.id)).toEqual(["b", "inner"]);
  });
});

describe("updateNodeProps", () => {
  it("updates a nested node's props", () => {
    const next = updateNodeProps(tree(), "c", { text: "changed" });

    expect(findNode(next, "c")?.props.text).toBe("changed");
  });

  it("leaves siblings alone and does not mutate the input", () => {
    const original = tree();
    const next = updateNodeProps(original, "b", { text: "changed" });

    expect(findNode(next, "c")?.props.text).toBe("c");
    expect(findNode(original, "b")?.props.text).toBe("b");
  });
});

describe("depthOf", () => {
  it("reports 0 for a top-level node", () => {
    expect(depthOf(tree(), "box")).toBe(0);
  });

  it("reports nesting depth", () => {
    expect(depthOf(tree(), "b")).toBe(1);
    expect(depthOf(tree(), "c")).toBe(2);
  });

  it("returns -1 for an unknown id", () => {
    expect(depthOf(tree(), "nope")).toBe(-1);
  });

  it("agrees with the renderer's ceiling", () => {
    // The renderer drops anything deeper than MAX_DEPTH, so the builder must not let
    // the user create nodes it would refuse to draw.
    expect(MAX_NEST_DEPTH).toBe(2);
  });
});
