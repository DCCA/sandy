import { describe, it, expect, beforeEach } from "vitest";
import { loadComposites, saveComposites } from "@/lib/composite/storage";
import type { CompositeDefinition } from "@/lib/composite/types";

const STORAGE_KEY = "sandy-composites";

const valid: CompositeDefinition = {
  id: "custom_ok",
  name: "Good One",
  version: "1.0",
  nodes: [{ id: "n1", type: "heading", props: { text: "Hi", level: "h2" } }],
  propBindings: [],
};

describe("composite storage load reporting", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns saved definitions with nothing dropped", () => {
    saveComposites([valid]);

    const result = loadComposites();

    expect(result.definitions).toHaveLength(1);
    expect(result.droppedCount).toBe(0);
  });

  it("reports entries it could not load instead of discarding them silently", () => {
    // A shape the current validator rejects - e.g. a future/corrupted version tag.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([valid, { ...valid, id: "custom_bad", version: "2.0" }, { nope: true }]),
    );

    const result = loadComposites();

    expect(result.definitions).toHaveLength(1);
    expect(result.definitions[0].id).toBe("custom_ok");
    expect(result.droppedCount).toBe(2);
  });

  it("reports nothing when storage is empty", () => {
    const result = loadComposites();

    expect(result.definitions).toEqual([]);
    expect(result.droppedCount).toBe(0);
  });

  it("reports nothing when storage holds unparseable junk", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");

    const result = loadComposites();

    expect(result.definitions).toEqual([]);
    expect(result.droppedCount).toBe(0);
  });
});
