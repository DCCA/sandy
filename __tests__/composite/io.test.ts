import { describe, it, expect } from "vitest";
import { exportComposite, parseImportedComposites } from "@/lib/composite/io";
import type { CompositeDefinition } from "@/lib/composite/types";

const sample: CompositeDefinition = {
  id: "custom_hero",
  name: "Custom Hero",
  version: "1.0",
  nodes: [
    { id: "h1", type: "heading", props: { text: "Hi", level: "h1" } },
    {
      id: "c1",
      type: "container",
      props: { direction: "column" },
      children: [{ id: "p1", type: "paragraph", props: { text: "Body" } }],
    },
  ],
  propBindings: [
    {
      propKey: "title",
      label: "Title",
      type: "string",
      required: true,
      targetPath: [0, "props", "text"],
    },
  ],
};

describe("composite import/export", () => {
  it("round-trips a definition through export → import", () => {
    const json = exportComposite(sample);
    const imported = parseImportedComposites(json);
    expect(imported).toHaveLength(1);
    expect(imported[0]).toEqual(sample);
  });

  it("accepts a bare definition and a bare array", () => {
    expect(parseImportedComposites(JSON.stringify(sample))).toHaveLength(1);
    expect(parseImportedComposites(JSON.stringify([sample, sample]))).toHaveLength(2);
  });

  it("drops structurally invalid definitions", () => {
    const bad = { ...sample, nodes: [{ id: "x" }] }; // node missing type/props
    expect(parseImportedComposites(JSON.stringify(bad))).toHaveLength(0);
  });

  it("returns [] for malformed JSON", () => {
    expect(parseImportedComposites("{ not json")).toEqual([]);
  });

  it("rejects a definition with a bad prop binding", () => {
    const bad = { ...sample, propBindings: [{ propKey: "x" }] };
    expect(parseImportedComposites(JSON.stringify(bad))).toHaveLength(0);
  });
});
