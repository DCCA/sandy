import { describe, it, expect } from "vitest";
import { newCompositeId, duplicateComposite } from "@/lib/composite/identity";
import type { CompositeDefinition } from "@/lib/composite/types";

const def: CompositeDefinition = {
  id: "custom_price_tag_abc",
  name: "Price Tag",
  description: "A tag",
  category: "Commerce",
  version: "1.0",
  nodes: [{ id: "n1", type: "heading", props: { text: "Hi", level: "h2" } }],
  propBindings: [
    {
      propKey: "title",
      label: "Title",
      type: "string",
      required: true,
      targetPath: [0, "props", "text"],
    },
  ],
  createdAt: 1000,
  updatedAt: 2000,
};

describe("newCompositeId", () => {
  it("produces a readable, prefixed, unique-ish key", () => {
    const id = newCompositeId("Price Tag");
    expect(id).toMatch(/^custom_price_tag_[a-z0-9]+$/);
  });

  it("falls back to a placeholder when the name has nothing sluggable", () => {
    expect(newCompositeId("!!!")).toMatch(/^custom_custom_component_[a-z0-9]+$/);
  });
});

describe("duplicateComposite", () => {
  it("gives the copy a new id so saving it doesn't overwrite the original", () => {
    const copy = duplicateComposite(def, [def.name]);

    expect(copy.id).not.toBe(def.id);
    expect(copy.name).toBe("Price Tag copy");
  });

  it("avoids colliding with names already in the library", () => {
    const copy = duplicateComposite(def, ["Price Tag", "Price Tag copy", "Price Tag copy 2"]);

    expect(copy.name).toBe("Price Tag copy 3");
  });

  it("carries over the structure and category but not the timestamps", () => {
    const copy = duplicateComposite(def, []);

    expect(copy.nodes).toEqual(def.nodes);
    expect(copy.propBindings).toEqual(def.propBindings);
    expect(copy.category).toBe("Commerce");
    expect(copy.createdAt).toBeUndefined();
    expect(copy.updatedAt).toBeUndefined();
  });

  it("deep-clones so editing the copy cannot mutate the original", () => {
    const copy = duplicateComposite(def, []);
    copy.nodes[0].props.text = "Changed";

    expect(def.nodes[0].props.text).toBe("Hi");
  });
});
